/**
 * @module {can.Component} components/page-preferences/setup-phrase setup-phrase
 * @parent components.user-preferences
 *
 * A short description of the setup-phrase component
 *
 * @signature `<setup-phrase />`
 *
 * @link ../src/components/page-preferences/setup-phrase/setup-phrase.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/components/page-preferences/setup-phrase/setup-phrase.html
 */

import Component from 'can-component';
import DefineMap from 'can-define/map/';
import './setup-phrase.less';
import view from './setup-phrase.stache';

export const ViewModel = DefineMap.extend({
  message: {
    value: 'This is the setup-phrase component'
  }
});

export default Component.extend({
  tag: 'setup-phrase',
  ViewModel,
  view
});
