import React, { Component } from 'react';
import { array, object, string, func } from 'prop-types';

import Sessions from './Sessions';
import Empty from './Empty';
import Tests from './Tests';

class Index extends Component {
  state = {
    page: this.props.sessions.length > 0 ? 0 : 1,
    selectedIndex: 0
  };

  componentWillReceiveProps({ sessions: nextSessions }) {
    const { sessions } = this.props;

    if (sessions.length !== nextSessions.length) {
      const page = nextSessions.length > 0 ? 0 : 1;
      this.setState({ page });
    }
  }

  switchPage = (page, selectedIndex = 0) => {
    this.setState({ page, selectedIndex });
  }

  render() {
    const { createId, sessions, displayId, selectTest, game, invite } = this.props;
    const { page, selectedIndex } = this.state;
    const session = sessions[selectedIndex];

    switch (page) {
      case 0:
        return <Sessions sessions={sessions} createId={createId} switchPage={this.switchPage} />;
      case 1:
        return <Empty createId={createId} switchPage={this.switchPage} />;
      case 2:
        return (
          <Tests
            session={session}
            displayId={displayId}
            selectTest={selectTest}
            game={game}
            invite={invite}
          />
        );
      default:
        break;
    }
  }
}

Index.propTypes = {
  sessions: array,
  game: object,
  createId: string.isRequired,
  displayId: string.isRequired,
  selectTest: func.isRequired,
  invite: func.isRequired
};

Index.defaultProps = {
  sessions: [],
  game: {}
};

export default Index;
