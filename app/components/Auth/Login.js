import React, { Component } from 'react';
import { func } from 'prop-types';
import toastr from 'toastr';
import jwtDecode from 'jwt-decode';
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

  handleKeyPress = ({ key }) => {
    if (key === 'Enter') this.login();
  }

  login = () => {
    const { addUser, switchPage } = this.props;
    const { email, password } = this.state;

    let errorMessage = '';
    if (email === '') errorMessage = 'Please enter your email.';
    else if (password === '') errorMessage = 'Please enter your password.';

    if (errorMessage !== '') {
      toastr.error(errorMessage);
      return;
    }

    callApi('login', this.state, 'POST')
      .then(res => res.json())
      .then(({ token, message }) => {
        if (message) return Promise.reject(message);

        const { hasAccess, gameCount } = jwtDecode(token);

        if (!hasAccess && gameCount <= 0) {
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

        <button className={styles.SubmitButton} onClick={this.login}>
          Login
        </button>

        <span className={styles.Switch}>
          New to Alpha Stage?
          <button onClick={() => switchPage(0)}>
            {' '}Create an account!
          </button>
        </span>
      </div>
    );
  }
}

Login.propTypes = {
  switchPage: func.isRequired,
  addUser: func.isRequired
};

export default Login;
