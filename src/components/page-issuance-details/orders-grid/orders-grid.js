/**
 * @module {can.Component} components/orders-grid orders-grid
 * @parent components.issuance-details
 *
 * Issuance Details / Order Book / Sell and Buy Orders
 *
 * @signature `<orders-grid type="BUY" limit="10" issuanceAddress:from="issuance.issuanceAddress" />`
 *
 * @link ../src/components/page-issuance-details/orders-grid/orders-grid.html Full Page Demo
 * ## Example
 *
 * @demo src/components/page-issuance-details/orders-grid/orders-grid.html
 *
 */

import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import './orders-grid.less'
import view from './orders-grid.stache'
import Order from '~/models/order'
import Offer from '~/models/offer'
import Session from '~/models/session'

const INIT_PAGE_SIZE = 20
const PAGE_SIZE_INCREMENT = 100

export const ViewModel = DefineMap.extend({ seal: false }, {
  type: {
    set (val) {
      if (['BUY', 'SELL'].indexOf(val) === -1) {
        console.error(`[sell-orders] Unexpected type ${val}`)
      }
      return val || 'SELL'
    }
  },
  portfolio: '*',
  issuanceAddress: 'string',
  assetType: {
    default: 'ISSUANCE'
  },
  limit: {
    type: 'number',
    value: INIT_PAGE_SIZE
  },
  skip: {
    type: 'number',
    value: 0
  },
  isLoading: 'boolean',
  hasMore: {
    type: 'boolean',
    value: true
  },
  loadMore () {
    if (this.limit === INIT_PAGE_SIZE) {
      this.limit += PAGE_SIZE_INCREMENT
      this.skip = INIT_PAGE_SIZE
    } else {
      this.limit += PAGE_SIZE_INCREMENT
      this.skip += PAGE_SIZE_INCREMENT
    }
  },
  rowsPromise: {
    get () {
      if (this.assetType === 'ISSUANCE' && !this.issuanceAddress) {
        console.error('Orders require issuanceAddress!')
        return
      }
      this.isLoading = true
      const params = {
        $limit: this.limit,
        $skip: this.skip,
        type: this.type,
        status: [ 'OPEN', 'TRADING-AVAILABLE' ],
        $sort: { 'price': this.type === 'BUY' ? -1 : 1 },
        issuanceAddress: this.issuanceAddress
      }
      if (this.assetType !== 'ISSUANCE') {
        params.assetType = this.assetType
      }
      return Order.getList(params).then(r => {
        this.isLoading = true
        this.hasMore = r.total > r.skip + r.length
        this.isLoading = false
        return r
      }, e => {
        this.hasMore = false
        this.isLoading = false
        throw e
      })
    }
  },
  get userOffersPromise () {
    return Offer.getList({userId: this.session.user._id})
  },
  userOffers: {
    get (setVal, resolve) {
      this.userOffersPromise.then(d => {
        resolve && resolve(d)
      })
      return []
    }
  },
  get userOfferOrderIds () {
    return this.userOffers
      .filter(offer => offer.status === 'OPEN' || offer.status === 'TRADING')
      .map(offer => offer.orderId)
  },
  get session () {
    return Session.current
  },
  rowsList: {
    value: []
  },
  rows: {
    get (val, resolve) {
      this.rowsPromise && this.rowsPromise.then(d => {
        d.forEach(elem => {
          if (this.rowsList.indexOf(elem) === -1) {
            this.rowsList.push(elem)
          }
        })
        resolve && resolve(d)
      }).then(() => {
        resolve(this.rowsList)
      })
      return val
    }
  },
  get totalQuantity () {
    return this.rows ? this.rows.reduce((sum, row) => (sum + row.quantity), 0) : 0
  },
  // Return a reason why the user can't buy or sell against this order
  // Possible reasons include:
  //  - User is not logged in
  //  - User was the one who posted the order (can't buy from / sell to yourself)
  //  - User already made an offer against the FillOrKill order
  //  - User has no shares to sell, for a buy order (not yet implemented)
  // Note: for a partial order user can place multiple offers.
  /**
   * Identify whether user can place an offer for the row order:
   * @param row {Order}
   * @returns {String | null}
   */
  whyUserCantOffer (row) {
    if (!this.session) {
      return 'Not logged in'
    }
    if (row.userId === this.session.user._id) {
      return 'User is owner'
    }
    if (~this.userOfferOrderIds.indexOf(row._id) && row.isFillOrKill) {
      return 'Offer exists'
    }
    if (this.assetType === 'ISSUANCE' && !this.session.hasIssuanceUtxo(this.issuanceAddress)) {
      return 'No securities'
    }
    if (this.assetType === 'EQUIBIT') {
      if (this.type === 'SELL' && !this.portfolio.hasEnoughFunds(row.totalPrice, 'BTC')) {
        return 'No funds'
      }
      if (this.type === 'BUY' && !this.portfolio.hasEnoughFunds(row.totalPrice, 'EQB')) {
        return 'No blank equibits'
      }
    }

    // TODO create a condition that shows that the number of shares
    // a user holds for an issuance is zero.
    // if () {
    //   return 'No shares to sell'
    // }
    return null
  },

  /**
   * Market depth chart as a background for order table tows.
   * @returns {Array<Number>}
   */
  get marketWidth () {
    // Accumulative quantity value per row:
    const hasLeftOffset = this.type === 'SELL'
    let quantityTab = 0
    if (!this.rows) {
      return []
    }
    return this.rows.map(row => {
      quantityTab += row.quantity
      const percentageWidth = Math.floor(quantityTab / this.totalQuantity * 100)
      const percentageOffset = hasLeftOffset ? 100 - percentageWidth : percentageWidth
      // console.log(`marketWidth: totalQuantity=${this.totalQuantity}, quantity=${quantity}, accumulativeQuantity=${this.accumulativeQuantity} => ${percentageOffset}`)
      return percentageOffset >= 100 ? 99 : (percentageOffset === 0 ? 1 : percentageOffset)
    })
  },

  buySell (order) {
    this.dispatch('buysell', [order])
  },

  userOfferForOrder (row) {
    return this.userOffers.filter(offer => offer.orderId === row._id)[0]
  },

  ordersCallback: '*',
  ordersRemovedCallback: '*'
})

export default Component.extend({
  tag: 'orders-grid',
  ViewModel,
  view,
  events: {
    inserted () {
      Order.subscribe(this.viewModel.ordersCallback = order => {
        const rows = this.viewModel.rows
        const pageEndPrice = rows.length < 1 ? 0 : rows[rows.length - 1].price * (this.viewModel.type === 'BUY' ? -1 : 1)
        const orderPrice = order.price * (this.viewModel.type === 'BUY' ? -1 : 1)
        if (rows &&
          order.type === this.viewModel.type &&
          (rows.length < this.viewModel.limit || orderPrice < pageEndPrice)
        ) {
          this.viewModel.trigger('limit')
        }
      })
      Order.subscribeUpdated(this.viewModel.ordersRemovedCallback = order => {
        const rows = this.viewModel.rows
        if (rows && (rows.indexOf(order) > -1 || rows.length === this.viewModel.limit - 1)) {
          this.viewModel.trigger('limit')
        }
      })
    },
    ' removed' () {
      Order.unSubscribe(this.viewModel.ordersCallback)
      Order.unSubscribeUpdated(this.viewModel.ordersRemovedCallback)
    }
  }
})
