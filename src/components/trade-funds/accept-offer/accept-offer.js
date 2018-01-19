/**
 * @module {can.Component} wallet-ui/components/trade-funds/accept-offer accept-offer
 * @parent components.common
 *
 * Input should include:
 *    - transaction (with address, amount and fee) and
 *    - issuance details.
 * Output would be:
 *    - timelock value and
 *    - description.
 *
 * @signature `<accept-offer />`
 *
 * @link ../src/wallet-ui/components/trade-funds/accept-offer/accept-offer.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/wallet-ui/components/trade-funds/accept-offer/accept-offer.html
 */

import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import './accept-offer.less'
import view from './accept-offer.stache'
import currencyConverter from '~/utils/btc-usd-converter'

export const ViewModel = DefineMap.extend({
  tx: '*',
  issuance: '*',
  portfolio: '*',
  offerTimelock: {
    value: function () {
      return this.tx.timelock * 2
    }
  },
  formData: {
    get () {
      const tx = this.tx
      const issuance = this.issuance
      return {
        type: tx.currencyType,
        address: tx.address,
        issuanceName: issuance.companyName + ', ' + issuance.issuanceName,
        quantityBtc: tx.amount / 100000000,
        quantity: tx.amount,
        fee: tx.fee,
        totalAmountBtc: (tx.amount + tx.fee) / 100000000,
        // timelock is in blocks (10min per block)
        timelock: tx.timelock / 6,
        description: tx.description,
        offerTimelock: this.offerTimelock / 6,
        portfolioName: this.portfolio.name
      }
    }
  },
  convertToUSD: function (value) {
    return currencyConverter.convert(value, 'EQBUSD')
  },
  send (close) {
    this.dispatch('send', [this.formData.timelock * 6, this.formData.description])
    close()
  }
})

export default Component.extend({
  tag: 'accept-offer',
  ViewModel,
  view
})
