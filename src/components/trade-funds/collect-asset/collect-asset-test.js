import assert from 'chai/chai'
import 'steal-mocha'
import { ViewModel } from './collect-asset'

describe('wallet-ui/components/trade-funds/collect-asset', function () {
  it('should have message', function () {
    var vm = new ViewModel()
    assert.equal(vm.message, 'This is the collect-asset component')
  })
})
