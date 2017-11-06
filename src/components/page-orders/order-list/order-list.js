/**
 * @module {can.Component} components/page-orders/order-list order-list
 * @parent components.buy-sell 4
 *
 * This components shows a list of orders.
 *
 * @signature `<order-list />`
 *
 * @link ../src/components/page-orders/order-list/order-list.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/components/page-orders/order-list/order-list.html
 */

import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import './order-list.less'
import view from './order-list.stache'

const labelStatusMap = {
  OPEN: 'info',
  TRADING: 'progress',
  CANCELLED: 'danger',
  CLOSED: 'success'
}

export const ViewModel = DefineMap.extend({
  // ENUM ['ORDER', 'OFFER']
  type: {
    get (val) {
      return val === 'OFFER' ? val : 'ORDER'
    }
  },
  mode: {
    get (val) {
      return val || 'SELL'
    },
    set () {
      this.selectedIndex = 0
    },
    value () {
      return 'SELL'
    }
  },
  // Either orders or offers:
  items: '*',
  itemsFiltered: {
    get () {
      const isArchive = this.mode === 'ARCHIVE'
      return this.items ? this.items.filter(item => {
        return isArchive
          ? ['CLOSED', 'CANCELLED'].indexOf(item.status) !== -1
          : ['CLOSED', 'CANCELLED'].indexOf(item.status) === -1 && item.type === this.mode
      }) : []
    }
  },
  switchMode (mode) {
    this.mode = mode
  },
  toLabel (status) {
    return labelStatusMap[status] || labelStatusMap.OPEN
  },
  selectItem (item) {
    this.selectedIndex = this.itemsFiltered.indexOf(item)
  },
  selectedIndex: {
    type: 'number'
  },
  selectedItem: {
    get () {
      if (!this.itemsFiltered || !this.itemsFiltered.length) {
        return
      }
      if (!this.selectedIndex) {
        this.selectedIndex = 0
      }

      return this.itemsFiltered[this.selectedIndex]
    }
  }
})

export default Component.extend({
  tag: 'order-list',
  ViewModel,
  view
})

export { labelStatusMap }
