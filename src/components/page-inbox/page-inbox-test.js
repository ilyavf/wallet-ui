import assert from 'chai/chai'
import 'steal-mocha'
import { ViewModel } from './page-inbox'

describe('wallet-ui/components/page-inbox', function () {
  it('should have message', function () {
    var vm = new ViewModel()
    assert.equal(vm.message, 'This is the page-inbox component')
  })
})
