import React from 'react';
import PropTypes from 'prop-types';
import parseImageUpload, { coverImageOptions, thumbnailOptions } from '../../helpers/parseImageUpload';
import styles from './styles.scss';

const Media = ({ handleChange }) => {
  const chooseSingleImage = (type) => () => {
    const options = type === 'cover' ? coverImageOptions : thumbnailOptions;
    const name = type === 'cover' ? 'coverImage' : 'thumbnail';
    parseImageUpload(options)
      .then(({ filesUploaded }) => {
        const event = {
          target: {
            name,
            value: filesUploaded[0].url
          }
        };
        handleChange(event);
        return Promise.resolve(event);
      })
      .catch(err => console.log(err));
  };

  return (
    <div className={styles.Row}>
      <div className={styles.ColumnLeft}>
        <p className={styles.Title}>Media</p>
      </div>
      <div className={styles.ColumnRight}>
        <div className={styles.InputContainer}>
          <label htmlFor="coverImg" className={styles.Tag}>Cover Image</label>
          <p className={styles.InputDescription}>
            {'This image will be used as the header in your game\'s page. (Aspect ratio: 980x400)'}
          </p>
          <button
            id="coverImg"
            className={styles.ImageButton}
            onClick={chooseSingleImage('cover')}
          >
            Add cover image
          </button>
        </div>
        <div className={styles.InputContainer}>
          <label htmlFor="thumbnail" className={styles.Tag}>Thumbnail</label>
          <p className={styles.InputDescription}>
            This image will be used to display your game throughout Alpha Stage.
            (Aspect ratio: 325x150)
          </p>
          <button
            id="thumbnail"
            className={styles.ImageButton}
            onClick={chooseSingleImage('thumb')}
          >
              Add Thumbnail
            </button>
        </div>
        <div className={styles.InputContainer}>
          <label htmlFor="screenshots" className={styles.Tag}>Screenshots</label>
          <p className={styles.InputDescription}>
            Adding screenshots is optional but highly recommended
          </p>
          <button id="screenshots" className={styles.ImageButton}>Add Screenshots</button>
        </div>
        <div className={styles.InputContainer}>
          <label htmlFor="trailer" className={styles.Tag}>Trailer</label>
          <p className={styles.InputDescription}>
            Provide a link to YouTube
          </p>
          <input type="text" id="trailer" name="trailer" className={styles.Input} />
        </div>
      </div>
    </div>
  );
};

Media.propTypes = {
  handleChange: PropTypes.func.isRequired
};

export default Media;
