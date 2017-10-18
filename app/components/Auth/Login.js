import React, { Component } from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import styles from './styles.scss';

import callApi from '../../helpers/apiCaller';

class Login extends Component {
  state = {
    email: '',
    password: ''
  }

  handleChange = (event) => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  }

  login = () => {
    const { email, password } = this.state;
    const user = {
      email,
      password
    };

    let errorMessage = '';
    if (email === '') errorMessage = 'Please enter your email.';
    else if (password === '') errorMessage = 'Please enter your password.';

    if (errorMessage !== '') {
      toastr.error(errorMessage);
      return;
    }

    callApi('login', user, 'POST')
      .then(res => res.json())
      .then(({ token, message }) => {
        if (message) return Promise.reject(message);

        localStorage.setItem('token', token);
        return token;
      })
      .catch(err => toastr.error(err));
  }

  render() {
    const { switchForm } = this.props;
    const { email, password } = this.state;
    return (
      <div className={styles.Login}>
        <div className={styles.InputGroup}>
          <label htmlFor="loginEmail" className={styles.Tag}>EMAIL</label>
          <input
            id="loginEmail"
            type="email"
            name="email"
            className={styles.Input}
            value={email}
            onChange={this.handleChange}
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
          />
        </div>

        <button className={styles.SubmitButton} onClick={this.login}>
          Login
        </button>

        <span className={styles.Switch}>
          New to Alpha Stage? <button onClick={switchForm}>Create an account!</button>
        </span>
      </div>
    );
  }
}

Login.propTypes = {
  switchForm: PropTypes.func.isRequired
};

export default Login;
