/**
 * @module {can.Component} components/page-auth/log-in Login
 * @parent components.auth
 *
 * @link ../src/components/page-auth/log-in/log-in.html Full Page Demo
 * ## Example
 *
 * @demo src/components/page-auth/log-in/log-in.html
 *
**/

import Component from 'can-component';
import DefineMap from 'can-define/map/';
import './log-in.less';
import view from './log-in.stache';
import Session from '~/models/session';
import User from '~/models/user/user';
import validate from '~/utils/validators';
import route from 'can-route';

export const ViewModel = DefineMap.extend({
  email: {
    type: 'string',
    set (value) {
      this.emailError = validate.email(value, {allowEmpty: 1});
      return value;
    }
  },
  password: {
    type: 'string',
    set (value) {
      this.passwordError = validate.password(value, {allowEmpty: 1});
      return value;
    }
  },
  session: {
    type: 'any'
  },
  /**
   * @property {boolean}
   * Toggles the password input visibility (password vs text type).
   */
  passwordVisible: {
    value: false
  },
  hashedPassword: 'string',
  isAccountCreated: {
    value: false
  },

  // Error validation:
  loginError: 'boolean',
  emailError: 'string',
  passwordError: 'string',
  get hasErrors () {
    this.emailError = validate.email(this.email, {allowEmpty: 0});
    this.passwordError = validate.password(this.password, {allowEmpty: 0});
    return this.emailError || this.passwordError;
  },

  // Methods:
  handleLogin (event, email, password) {
    this.loginError = false;
    event.preventDefault();
    if (this.hasErrors) {
      return false;
    }

    User.login(email, password)
      .then(({ usingTempPassword, user }) => {
        this.session = new Session({ usingTempPassword, user });
        route.data.page = usingTempPassword ? 'change-password' : 'portfolio';
      })
      .catch(error => {
        console.log(error);
        this.loginError = true;
      });
  },
  togglePassword () {
    this.passwordVisible = !this.passwordVisible;
  }
});

export default Component.extend({
  tag: 'log-in',
  ViewModel,
  view
});
