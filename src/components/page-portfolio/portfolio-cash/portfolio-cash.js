/**
 * @module {can.Component} wallet-ui/components/page-portfolio/portfolio-cash portfolio-cash
 * @parent components.common
 *
 * A short description of the portfolio-cash component
 *
 * @signature `<portfolio-cash />`
 *
 * @link ../src/wallet-ui/components/page-portfolio/portfolio-cash.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/wallet-ui/components/page-portfolio/portfolio-cash.html
 */

import Component from 'can-component';
import DefineMap from 'can-define/map/';
import './portfolio-cash.less';
import view from './portfolio-cash.stache';

export const ViewModel = DefineMap.extend({
  cash: {
    value: {
      btc: 1.245678,
      btcVal: 1.234567,
      eqb: 230.4646,
      eqbVal: 8.3453
    }
  }
});

export default Component.extend({
  tag: 'portfolio-cash',
  ViewModel,
  view
});