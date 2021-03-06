/**
 * @module {can.Component} components/page-offers/offer-order-data offer-details > offer-order-data
 * @parent components.buy-sell-offers 7
 *
 * Shows the details of an order for an offer.
 *
 * @signature `<offer-order-data />`
 *
 * @link ../src/components/page-offers/offer-order-data/offer-order-data.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/components/page-offers/offer-order-data/offer-order-data.html
 */

import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import './offer-order-data.less'
import view from './offer-order-data.stache'

export const ViewModel = DefineMap.extend({
  order: '*'
})

export default Component.extend({
  tag: 'offer-order-data',
  ViewModel,
  view
})
