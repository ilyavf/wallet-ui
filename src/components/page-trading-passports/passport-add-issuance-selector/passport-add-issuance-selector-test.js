import assert from 'chai/chai'
import 'steal-mocha'
import { ViewModel } from './passport-add-issuance-selector'

describe('wallet-ui/components/page-trading-passports/passport-add-issuance-selector', function () {
  it('should have message', function () {
    var vm = new ViewModel()
    assert.equal(vm.message, 'This is the passport-add-issuance-selector component')
  })
})
