import assert from 'chai/chai';
import 'steal-mocha';
import { ViewModel } from './modal-email-update';

describe('wallet-ui/components/page-preferences/user-email/modal-email-update', function () {
  it('should have message', function () {
    var vm = new ViewModel();
    assert.equal(vm.message, 'This is the modal-email-update component');
  });
});
