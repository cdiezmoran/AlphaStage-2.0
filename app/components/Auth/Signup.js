import React, { Component } from 'react';
import { func } from 'prop-types';
import toastr from 'toastr';
import jwtDecode from 'jwt-decode';
import styles from './styles.scss';

import callApi from '../../helpers/apiCaller';

class Signup extends Component {
  state = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  }

  handleChange = (event) => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  }

  handleKeyPress = ({ key }) => {
    if (key === 'Enter') this.signup();
  };

  signup = () => {
    const { addUser, switchPage } = this.props;
    const { email, username, password, confirmPassword } = this.state;

    const payload = {
      user: {
        email,
        username,
        password
      }
    };

    let errorMessage = '';
    if (email === '') errorMessage = 'Please enter your email.';
    else if (username === '') errorMessage = 'Please enter your username.';
    else if (password === '') errorMessage = 'Please enter your password.';
    else if (confirmPassword === '') errorMessage = 'Please re-enter your password to confirm it.';

    if (errorMessage !== '') {
      toastr.error(errorMessage);
      return;
    }

    callApi('signup', payload, 'POST')
      .then(res => res.json())
      .then(({ token, message }) => {
        if (message) return Promise.reject(message);

        const { hasAccess } = jwtDecode(token);

        if (!hasAccess) {
          switchPage(2);
          return;
        }

        localStorage.setItem('token', token);
        addUser(token);
        return token;
      })
      .catch(err => toastr.error(err));
  }

  render() {
    const { switchPage } = this.props;
    const { email, username, password, confirmPassword } = this.state;
    return (
      <div className={styles.Signup}>
        <div className={styles.InputGroup}>
          <label htmlFor="loginEmail" className={styles.Tag}>EMAIL</label>
          <input
            id="loginEmail"
            type="email"
            name="email"
            className={styles.Input}
            value={email}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
          />
        </div>
        <div className={styles.InputGroup}>
          <label htmlFor="username" className={styles.Tag}>USERNAME</label>
          <input
            id="username"
            type="text"
            name="username"
            className={styles.Input}
            value={username}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
          />
        </div>
        <div className={styles.InputGroup}>
          <label htmlFor="password" className={styles.Tag}>PASSWORD</label>
          <input
            id="password"
            type="password"
            name="password"
            className={styles.Input}
            value={password}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
          />
        </div>
        <div className={styles.InputGroup}>
          <label htmlFor="confirmPassword" className={styles.Tag}>CONFIRM PASSWORD</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            className={styles.Input}
            value={confirmPassword}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
          />
        </div>

        <button className={styles.SubmitButton} onClick={this.signup}>
          Signup
        </button>

        <span className={styles.Switch}>
          Already have an account? <button onClick={() => switchPage(1)}>Login now!</button>
        </span>
      </div>
    );
  }
}

Signup.propTypes = {
  switchPage: func.isRequired,
  addUser: func.isRequired
};

export default Signup;
