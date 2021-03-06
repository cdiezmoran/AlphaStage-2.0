import React, { Component } from 'react';
import { func, object, string } from 'prop-types';
import moment from 'moment';
import swal from 'sweetalert';
import styles from './SettingsModal.scss';

import Modal from '../Modal';
import General from './SettingsViews/General';
import Availability from './SettingsViews/Availability';

class SettingsModal extends Component {
  state = {
    contentIndex: 0,
    privacyCheck: this.props.game.isPrivate,
    releaseStatus: this.props.game.releaseStatus,
    focusedInput: null,
    playable: {
      allTime: true,
      onTestingSession: false,
      certainDate: {
        active: false,
        startDate: null,
        endDate: null
      },
      certainRelease: {
        active: false,
        status: 'Released - Game is ready.'
      }
    }
  }

  componentDidMount() {
    this.setInitialState();
  }

  componentDidUpdate(prevProps, prevState) {
    const { playable } = this.state;
    const { playable: prevPlayable } = prevState;
    this.checkPlayableUpdate(prevPlayable, playable);
  }

  setInitialState = () => {
    const { playable: strPlayable } = this.props.game;
    const playable = JSON.parse(strPlayable);
    playable.certainDate.startDate = moment(playable.certainDate.startDate);
    playable.certainDate.endDate = moment(playable.certainDate.endDate);
    this.setState({ playable });
  }

  changeContent = (contentIndex) => () => this.setState({ contentIndex });

  changeInput = ({ target }) => {
    const { name } = target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({ [name]: value }, () => {
      this.saveSettings();
    });
  }

  saveSettings = () => {
    const { game, updateGeneral } = this.props;
    const { privacyCheck, releaseStatus } = this.state;

    updateGeneral(game._id, privacyCheck, releaseStatus);
  }

  checkDelete = () => {
    const { id, game, deleteGame } = this.props;
    swal({
      text: `Deleting your game is irreversible. Enter your game's name (${game.title}) to confirm that you want to permanently delete it.`,
      icon: 'warning',
      content: 'input',
      dangerMode: true,
      buttons: {
        cancel: 'Go back',
        confirm: {
          text: 'Delete'
        }
      }
    })
      .then(title => {
        if (!title) return;
        if (title !== game.title) return;

        deleteGame(game._id);
        document.getElementById(id).style.display = 'none';

        return title;
      })
      .catch(err => console.log(err));
  }

  activeClass = (index) => (
    index === this.state.contentIndex
      ? styles.active
      : ''
  )

  setStateProperty = (name, value) =>
    this.setState({ [name]: value })

  checkPlayableUpdate = (prevPlayable, playable) => {
    const { updateProperty, game: { _id } } = this.props;
    const {
      allTime: prevAllTime,
      onTestingSession: prevOnTestingSession,
      certainDate: { active: prevDateActive, startDate: prevStartDate, endDate: prevEndDate },
      certainRelease: { active: prevReleaseActive, status: prevStatus }
    } = prevPlayable;
    const {
      allTime,
      onTestingSession,
      certainDate: { active: dateActive, startDate, endDate },
      certainRelease: { active: releaseActive, status }
    } = playable;

    if (
      allTime !== prevAllTime ||
      onTestingSession !== prevOnTestingSession ||
      (!dateActive && prevDateActive) ||
      (!releaseActive && prevReleaseActive) ||
      ((dateActive && startDate !== null && endDate !== null) &&
      (!prevDateActive || prevStartDate === null || prevEndDate === null)) ||
      ((releaseActive && status) && (!prevReleaseActive || !prevStatus))
    ) {
      updateProperty(_id, 'playable', JSON.stringify(playable));
    }
  }

  getContent = () => {
    const { privacyCheck, releaseStatus, playable, focusedInput } = this.state;
    return [
      <General
        releaseStatus={releaseStatus || ''}
        privacyCheck={privacyCheck}
        handleChange={this.changeInput}
      />,
      <Availability
        handleChange={this.changeInput}
        playable={playable}
        focusedInput={focusedInput}
        setState={this.setStateProperty}
      />
    ];
  }

  render() {
    const { id } = this.props;
    const { contentIndex } = this.state;
    const content = this.getContent();

    return (
      <Modal isSettings id={id}>
        <div className={styles.Container}>
          <div className={styles.Menu}>
            <button className={this.activeClass(0)} onClick={this.changeContent(0)}>
              General
            </button>
            <button className={this.activeClass(1)} onClick={this.changeContent(1)}>
              Availability
            </button>
            <div className={styles.Divider} />
            <button className={styles.DeleteButton} onClick={this.checkDelete}>
              Delete
            </button>
          </div>
          <div className={styles.Content}>
            {content[contentIndex]}
          </div>
        </div>
      </Modal>
    );
  }
}

SettingsModal.propTypes = {
  id: string,
  game: object.isRequired,
  updateGeneral: func.isRequired,
  deleteGame: func.isRequired,
  updateProperty: func.isRequired
};

SettingsModal.defaultProps = {
  id: '',
};

export default SettingsModal;
