import DefineMap from 'can-define/map/map'
import Portfolio from '../../../models/portfolio'
import Order from '../../../models/order'
import Issuance from '../../../models/issuance'
import { toMaxPrecision } from '../../../utils/formatter'
import feathersClient from '~/models/feathers-client'
import {translate} from '~/i18n/'

const FormData = DefineMap.extend('OfferFormData', {
  portfolio: Portfolio,
  order: Order,
  issuance: Issuance,
  quantity: {
    type: 'number',
    value: 0,
    get (val) {
      if (this.order.isFillOrKill) {
        return this.order.quantity
      }
      return val
    }
  },
  // For blank EQB we show quantity in EQB for flexible conversion to BTC.
  quantityInCoins: {
    type: 'number',
    // Currently in uEQB. Set quantity which is in Satoshi:
    set (val) {
      if (this.order.isFillOrKill) {
        val = toMaxPrecision(this.order.quantity / 100000000, 8)
      }
      this.quantity = Math.floor(val * 100000000)
      return val
    }
  },
  get orderQuantityInCoins () {
    return this.order && toMaxPrecision(this.order.quantity / 100000000, 8)
  },
  get uBtcPrice () {
    // Price in order is in Satoshi:
    return (this.order && toMaxPrecision(this.order.price / 100, 2)) || 0
  },
  error: 'string',
  fee: {
    type: 'number',
    value: 1000
  },
  description: 'string',
  timelock: {
    type: 'number',
    value: 72 // 72 blocks ~= 12 hours on the BTC blockchain
  },

  get flowType () {
    return this.order.type === 'SELL' ? 'Ask' : 'Bid'
  },

  get currencyType () {
    return this.order.type === 'SELL' ? 'BTC' : 'EQB'
  },

  get assetType () {
    return this.order.assetType
  },

  // In uBTC:
  get uBtcTotalPrice () {
    return this.uBtcPrice * this.quantity * this.order.priceMutliplier
  },

  // In Satoshi:
  get totalPrice () {
    return Math.floor(this.uBtcTotalPrice * 100)
  },

  get totalPriceWithFee () {
    return this.totalPrice + this.fee
  },

  sellData: '*',
  _sellDataPromise: '*',
  get sellDataPromise () {
    const prom = this._sellDataPromise
    if (prom) {
      return prom
    }
    const issuance = this.issuance || {}
    const issuanceId = issuance._id
    const portfolio = this.portfolio || {}
    const userId = portfolio.userId

    if (!issuanceId || !userId) {
      return Promise.reject(new Error(translate('sellingSecuritiesCannotQuery')))
    }

    const ordersService = feathersClient.service('orders')

    // query for orders
    const query = {
      issuanceId,
      userId,
      type: 'SELL',
      status: { $in: ['OPEN', 'TRADING'] }
    }

    const promises = Promise.all([
      ordersService.find({ query })
    ]).then(response => {
      const sellIssuanceData = {}
      sellIssuanceData.sellOrderTotal = response[0].data.reduce((total, obj) => total + (obj.quantity || 0), 0)
      sellIssuanceData.maxSellQuantity = issuance.utxoAmountTotal - sellIssuanceData.sellOrderTotal
      this.sellData = sellIssuanceData
      return this.sellData
    })

    return promises
  },

  quantityProblem: 'string',
  get quantityIsVaild () {
    const orderType = this.order.type
    const quantity = this.quantity || 0
    const order = this.order || {}
    const orderQuantity = order.quantity || 0
    this.quantityProblem = ''

    if (quantity > orderQuantity) {
      this.quantityProblem = translate('sellingSecuritiesQuantityGTSharesOrdered')
      return false
    }
    if (orderType === 'SELL') {
      return true
    }

    if (this.order.assetType !== 'EQUIBIT') {
      const sellDataPromise = this.sellDataPromise
      const sellData = sellDataPromise && this.sellData

      if (!sellData) {
        this.quantityProblem = translate('sellingSecuritiesCheckingSellData')
        // waiting for sellData info
        return false
      } else if (sellData && quantity > sellData.maxSellQuantity) {
        this.quantityProblem = translate('sellingSecuritiesQuantityGTSharesOwned')
        // can't sell more than owned (that are not pending)
        return false
      }
    }

    return true
  },

  hasFunds: {
    get () {
      return (this.portfolio.balance.cashBtc - this.fee) > 0
    }
  },
  hasEnoughFunds: {
    get () {
      if (this.currencyType === 'BTC') {
        return this.portfolio.hasEnoughFunds(this.totalPrice + this.fee, 'BTC')
      } else {
        if (this.order.assetType === 'EQUIBIT') {
          return this.portfolio.hasEnoughFunds(this.quantity + this.fee, 'EQB')
        } else {
          return this.issuance.utxoAmountTotal >= this.quantity && this.portfolio.hasEnoughFunds(this.fee, 'EQB')
        }
      }
    }
  },
  isValid: {
    get () {
      return !!(this.quantity && this.hasEnoughFunds && this.quantityIsVaild)
    }
  },
  get errorMessage () {
    return this.currencyType === 'BTC' ? translate('notEnoughFundsPopoverMessage') : translate('notEnoughSecuritiesPopoverMessage')
  }
})

export default FormData
