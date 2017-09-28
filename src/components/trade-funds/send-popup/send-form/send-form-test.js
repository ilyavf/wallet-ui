import assert from 'chai/chai'
import 'steal-mocha'
import { ViewModel } from './send-form'
import FormData from '../form-data'
import portfolio from '~/models/mock/mock-portfolio'
import issuance, { amount } from '~/models/mock/mock-issuance'

describe('components/trade-funds/send-popup/send-popup', function () {
  const formData = new FormData({
    portfolio,
    issuance,
    type: 'SECURITIES',
    issuanceOnly: true
  })
  describe('availableFunds', function () {
    it('should be set from issuance', function () {
      var vm = new ViewModel({
        formData,
        portfolio
      })
      assert.equal(vm.availableFunds, amount)
    })
  })
  describe('sendAllFunds', function () {
    it('should set formData.amount to availableFunds', function () {
      var vm = new ViewModel({
        formData,
        portfolio
      })
      vm.sendAllFunds()
      assert.equal(vm.formData.amount, vm.availableFunds)
    })
  })
})
