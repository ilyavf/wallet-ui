/**
 * @module {can.Component} wallet-ui/components/page-preferences/user-password user-password
 * @parent components.common
 *
 * A short description of the user-password component
 *
 * @signature `<user-password />`
 *
 * @link ../src/wallet-ui/components/page-preferences/user-password/user-password.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/wallet-ui/components/page-preferences/user-password/user-password.html
 */

import Component from 'can-component';
import DefineMap from 'can-define/map/';
import './user-password.less';
import view from './user-password.stache';

export const ViewModel = DefineMap.extend({
  message: {
    value: 'This is the user-password component'
  }
});

export default Component.extend({
  tag: 'user-password',
  ViewModel,
  view
});
