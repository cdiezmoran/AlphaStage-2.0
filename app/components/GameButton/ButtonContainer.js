import React, { Component } from 'react';
import { remote, ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { exec } from 'child_process';
import fs from 'fs';
import moment from 'moment';
import { bool, func, object, string } from 'prop-types';
import styles from './styles.scss';

import { startDownload, finishDownload } from '../../actions/game';
import addToMetric from '../../graphql/addToMetric.graphql';

import Button from './Button';

const { app } = remote;

const withMutation = graphql(addToMetric, {
  props: ({ mutate }) => ({
    incrementMetric: (gameId, metric) => mutate({ variables: { gameId, metric } }),
  }),
});

const mapStateToProps = ({ game }) => (
  {
    ...game,
    downloadId: game.id
  }
);

const mapDispatchToProps = dispatch => ({
  startDownloading: (id) => dispatch(startDownload(id)),
  completeDownload: () => dispatch(finishDownload())
});

class ButtonContainer extends Component {
  state = {
    isInstalled: false,
    uninstalling: false,
  }

  componentWillMount() {
    const { game } = this.props;
    const path = `${app.getPath('appData')}/ASLibrary/${game.title}`;

    if (fs.existsSync(path)) this.setState({ isInstalled: true });
  }

  componentDidUpdate() {
    const { isFinished, downloadId, game, completeDownload } = this.props;

    // This would only be called once because we reset the download state in
    // completeDownload() that is why we disable the line.
    if (isFinished && downloadId === game._id) {
      this.setState({ isInstalled: true }); // eslint-disable-line
      completeDownload();
    }
  }

  handleInstallClick = () => {
    const { game, startDownloading, incrementMetric } = this.props;

    const url = process.platform === 'darwin' ? game.macBuild : game.windowsBuild;

    const args = {
      id: game._id,
      title: game.title,
      thumbnail: game.thumbnail,
      url
    };

    incrementMetric(game._id, 'downloads');

    ipcRenderer.send('download-game', args);
    startDownloading(game._id);
  }

  handlePlayClick = () => {
    const { game, incrementMetric, openGame } = this.props;
    const localPath = this.gamePath();

    openGame(localPath);
    incrementMetric(game._id, 'plays');
  }

  handleUninstall = () => {
    const { game, incrementMetric } = this.props;
    const path = `${app.getPath('appData')}/ASLibrary/${game.title}`.split(' ').join('\\ ');
    const execCommand = process.platform === 'darwin'
      ? `rm -rf ${path}`
      : `DEL ${path}`;

    incrementMetric(game._id, 'uninstalls');
    this.setState({ uninstalling: true });

    exec(execCommand, (err) => {
      if (err) throw err;

      this.setState({
        isInstalled: false,
        uninstalling: false
      });
    });
  };

  gamePath = () => {
    const { game } = this.props;
    const path = `${app.getPath('appData')}/ASLibrary/${game.title}`;
    const file = this.localGameFile(path);

    return `${path}/${file}`.split(' ').join('\\ ');
  }

  localGameFile = (path) => {
    const regexp = process.platform === 'darwin' ? /^.*\.(app)$/ : /^.*\.(exe)$/;
    let gameFile = '';
    fs.readdirSync(path).forEach(file => {
      if (regexp.test(file)) gameFile = file;
    });

    return gameFile;
  }

  buttonConfig = (key) => {
    const sharedDisabledConfig = {
      iconClass: 'fa fa-spinner fa-spin',
      btnClass: styles.ButtonDisabled,
      handleClick: null,
      isDisabled: true
    };

    const configs = {
      play: {
        iconClass: 'fa fa-gamepad',
        text: 'Play',
        btnClass: styles.ButtonPlay,
        handleClick: this.handlePlayClick
      },
      install: {
        iconClass: 'fa fa-download',
        text: 'Install',
        btnClass: styles.ButtonPlay,
        handleClick: this.handleInstallClick
      },
      downloading: {
        ...sharedDisabledConfig,
        text: 'Downloading'
      },
      installing: {
        ...sharedDisabledConfig,
        text: 'Installing'
      },
      unavailable: {
        ...sharedDisabledConfig,
        iconClass: '',
        text: `Unavailable on ${process.platform === 'darwin' ? 'mac' : 'Windows'}`,
        btnClass: `${styles.ButtonUnavailable} ${process.platform === 'darwin' ? '' : styles.win}`
      },
      uninstalling: {
        ...sharedDisabledConfig,
        text: 'Uninstalling'
      }
    };

    return configs[key];
  }

  buttonConfigKey = () => {
    const { game, isDownloading, isInstalling, downloadId, isFinished } = this.props;
    const { isInstalled, uninstalling } = this.state;

    if (process.platform === 'darwin') {
      if (!game.macBuild) return 'unavailable';
    } else if (process.platform === 'win32') {
      if (!game.windowsBuild) return 'unavailable';
    }

    if (uninstalling) return 'uninstalling';

    if (downloadId && downloadId === game._id && !isFinished) {
      if (isDownloading) return 'downloading';
      else if (isInstalling) return 'installing';
    } else {
      return isInstalled ? 'play' : 'install';
    }
  }

  buttonStatus = () => {
    const { game: { playable: strPlayable, releaseStatus }, activeSession } = this.props;
    const playable = JSON.parse(strPlayable);
    const {
      allTime,
      onTestingSession,
      certainDate: { active: dateActive, startDate, endDate },
      certainRelease: { active: releaseActive, status }
    } = playable;
    const now = moment();

    if (
      allTime ||
      (onTestingSession && activeSession) ||
      (dateActive && now.isBetween(startDate, endDate)) ||
      (releaseActive && releaseStatus === status)
    ) {
      const key = this.buttonConfigKey();
      return this.buttonConfig(key);
    }

    return {
      iconClass: '',
      btnClass: styles.ButtonDisabled,
      handleClick: null,
      isDisabled: true,
      text: 'Not playable'
    };
  }

  render() {
    const { text, iconClass, btnClass, handleClick, isDisabled } = this.buttonStatus();
    const { isInstalled, uninstalling } = this.state;
    const { isInstalling } = this.props;

    return (
      <React.Fragment>
        <Button
          text={text}
          iconClass={iconClass}
          btnClass={btnClass}
          handleClick={handleClick}
          isDisabled={isDisabled}
        />
        {
          isInstalled && !uninstalling && !isInstalling
          ? (
            <button className={styles.Uninstall} onClick={this.handleUninstall}>
              <i className="fa fa-trash-o" />
            </button>
          )
          : null
        }
      </React.Fragment>
    );
  }
}

ButtonContainer.propTypes = {
  game: object.isRequired,
  startDownloading: func.isRequired,
  completeDownload: func.isRequired,
  incrementMetric: func.isRequired,
  openGame: func.isRequired,
  isDownloading: bool,
  isInstalling: bool,
  downloadId: string,
  isFinished: bool,
  activeSession: object
};

ButtonContainer.defaultProps = {
  isDownloading: false,
  isInstalling: false,
  downloadId: '',
  isFinished: false,
  activeSession: null
};

const ButtonWithMutation = withMutation(ButtonContainer);

export default connect(mapStateToProps, mapDispatchToProps)(ButtonWithMutation);
