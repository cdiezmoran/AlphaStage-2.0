import React from 'react';
import { string } from 'prop-types';
import VideoJS from '../libs/VideoJS';

const VideoPlayer = ({ src, id }) => {
  const videoJsOptions = {
    autoplay: false,
    controls: true,
    className: 'video-js vjs-default-skin',
    poster: 'https://image.ibb.co/jh0EYH/placeholder_black.png',
    src,
    preload: 'auto',
    width: '720',
    height: '380',
    id
  };

  return <VideoJS {...videoJsOptions} />;
};

VideoPlayer.propTypes = {
  src: string,
  id: string
};

VideoPlayer.defaultProps = {
  src: '',
  id: ''
};

export default VideoPlayer;
