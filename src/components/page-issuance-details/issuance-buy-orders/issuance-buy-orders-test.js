import QUnit from 'steal-qunit';
import { ViewModel } from './issuance-buy-orders';

// ViewModel unit tests
QUnit.module('wallet-ui/components/page-issuance-details/issuance-buy-orders');

QUnit.test('Has message', function () {
  var vm = new ViewModel();
  QUnit.equal(vm.message, 'This is the issuance-buy-orders component');
});