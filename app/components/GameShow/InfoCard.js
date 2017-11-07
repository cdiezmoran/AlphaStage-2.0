import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import uuid from 'uuid/v4';
import styles from './InfoCard.scss';

const InfoCard = ({ game }) => {
  const renderTags = () => (
    game.tags.map(tag => <Link key={uuid()} to="/">{tag}</Link>)
  );

  return (
    <div className={styles.Info}>
      <div
        className={styles.Header}
        style={{ background: `url(${game.thumbnail})`, backgroundSize: '100% 100%' }}
      >
        <button className={styles.ButtonPlay}>
          <i className="fa fa-gamepad" /> Play
        </button>
      </div>
      <div className={styles.Body}>
        <div className={styles.Row}>
          <p className={styles.Subtitle}>Release Status</p>
          <p className={styles.Subvalue}>{game.releaseStatus}</p>
        </div>
        <div className={styles.Row}>
          <p className={styles.Subtitle}>Genre</p>
          <p className={styles.Subvalue}>{game.genre}</p>
        </div>
        <p className={styles.Subtitle}>Tags</p>
        <div className={styles.Tags}>
          {renderTags()}
        </div>
      </div>
    </div>
  );
};

InfoCard.propTypes = {
  game: PropTypes.object.isRequired
};

export default InfoCard;
