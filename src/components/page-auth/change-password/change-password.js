/**
 * @module {can.Component} components/page-auth/change-password change-password
 * @parent components.auth
 *
 * Change password component
 *
 * @signature `<change-password {user}="user" />`
 *
 *  @param {models/user} user A reference to the [models/user] instance
 *
 * @link ../src/components/page-auth/change-password/change-password.html Full Page Demo
 * ## Example
 *
 * @demo src/components/page-auth/change-password/change-password.html
 *
**/

import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import './change-password.less'
import view from './change-password.stache'
import validate from '~/utils/validators'
import route from 'can-route'
import hub from '~/utils/event-hub'
import i18n from '~/i18n/'
import zxcvbn from 'zxcvbn'

export const ViewModel = DefineMap.extend({
  email: {
    type: 'string'
  },
  password: {
    type: 'string'
  },
  passwordVisible: {
    value: false
  },
  user: '*',

  // Form validation:
  passwordError: 'string',
  generalError: 'string',
  get isPasswordValid () {
    this.passwordError = validate.password(this.password, {allowEmpty: 0})
    return !this.passwordError
  },

  // Methods:
  updatePassword (el) {
    this.password = el.value
  },
  validatePassword (el) {
    this.passwordError = validate.password(el.value, {allowEmpty: 1})
    return el.value
  },
  handlePasswordChange (event) {
    event.preventDefault()
    if (!this.isPasswordValid) {
      return false
    }

    // Note: after changing password user is no longer new.
    const isNewUser = this.user.isNewUser

    if (this.password && zxcvbn(this.password).score !== 4) {
      this.passwordError = 'Password too weak'
      return
    }

    this.user.changePassword(this.password)
      .then(() => {
        if (isNewUser) {
          this.user.generateKeysAndPatchUser()
        }
        this.routeWithAlert('portfolio', isNewUser)
      })
      .catch(e => {
        console.error(e)
        if (e.code === 400 && e.errors && e.errors.password) {
          this.passwordError = e.errors.password
        } else {
          this.generalError = JSON.stringify(e)
        }
      })
  },
  togglePassword () {
    this.passwordVisible = !this.passwordVisible
  },
  routeWithAlert (routeName, isNewUser) {
    route.data.page = routeName
    hub.dispatch({
      'type': 'alert',
      'kind': 'success',
      'title': isNewUser ? i18n.accountCreated : i18n.passwordReset,
      'displayInterval': 10000,
      'message': isNewUser ? '' : i18n.passwordResetMsg
    })
  }
})

export default Component.extend({
  tag: 'change-password',
  ViewModel,
  view
})
