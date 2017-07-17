/**
 * @module {can-map} wallet-ui/app AppViewModel
 * @parent models
 *
 * Application view model.
 *
 * Usage:
 * ```
 * <can-import from="wallet-ui/app" export-as="viewModel" />
 * ```
 *
 * @group wallet-ui/app.properties 0 properties
 */

import 'core-js/client/core'
import DefineMap from 'can-define/map/'
import route from 'can-route'
import 'can-route-pushstate'
import Session from '~/models/session'
// import '~/models/fixtures/fixtures';

//! steal-remove-start
window.route = route
//! steal-remove-end

var pages = {
  home: 'public',
  loading: 'public',
  signup: 'public',
  login: 'public',
  research: 'public',
  issuances: 'public',
  'issuance-details': 'public',
  'four-oh-one': 'public',
  'forgot-password': 'public',
  'change-password': 'private',
  'recovery-phrase': 'private',
  dashboard: 'private',
  settings: 'private',
  portfolio: 'private',
  preferences: 'private',
  transactions: 'private',
  orders: 'public',
  offers: 'public'
}

const AppViewModel = DefineMap.extend({
  '*': {
    serialize: false
  },

  /**
   * Route params.
   */
  page: {
    serialize: true
  },
  companySlug: {
    serialize: true
  },
  issuanceId: {
    serialize: true
  },
  sort: {
    serialize: true
  },

  /**
   * @property {wallet-ui/app.session} wallet-ui/app.session session
   * @parent wallet-ui/app.properties
   * A session object that get's created on successful user login.
   */
  // TODO: consider using Session.current in a getter and do not pass session to other pages via template bindings.
  session: {
    Type: Session
  },
  get isLoggedIn () {
    return !!(this.session && this.session.user)
  },

  /**
   * Determines which page-level component is displayed.
   */
  displayedPage: {
    get () {
      let page = this.page

      if (!this.session) {
        page = pages[page] === 'private' ? 'four-oh-one' : page
      }
      return pages[page] ? page : 'four-oh-four'
    }
  },

  logout () {
    // TODO: what do we call in feathers to logout?
    this.session.user.clearKeys()
    this.session.destroy()
    this.session = null
    this.page = 'home'
    window.location.reload()
  },

  refresh () {
    this.session.refreshBalance()
  }
})

route('issuances/sort/{sort}', {page: 'issuances'})
route('issuances/{companySlug}/{issuanceId}', {page: 'issuance-details'})
route('{page}', {page: 'research'})

export default AppViewModel
