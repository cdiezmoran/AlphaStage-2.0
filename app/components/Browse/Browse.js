// @flow
import React, { Component } from 'react';

import TopSlider from './TopSlider';

import type { Game } from '../../types/dataTypes';

class Browse extends Component {
  props: {
    games: [Game]
  }

  render() {
    return (
      <div>
        <TopSlider games={this.props.games} />
      </div>
    );
  }
}

export default Browse;