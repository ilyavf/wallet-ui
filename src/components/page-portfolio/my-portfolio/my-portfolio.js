/**
 * @module {can.Component} wallet-ui/components/page-portfolio/my-portfolio my-portfolio
 * @parent components.portfolio
 *
 * A short description of the my-portfolio component
 *
 * @signature `<my-portfolio />`
 *
 * @link ../src/components/page-portfolio/my-portfolio/my-portfolio.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/components/page-portfolio/my-portfolio/my-portfolio.html
 */

import Component from 'can-component';
import DefineMap from 'can-define/map/';
import './my-portfolio.less';
import view from './my-portfolio.stache';
import hub from '~/utils/event-hub';
import { translate } from '~/i18n/';
import Portfolio from '~/models/portfolio';
import Session from '~/models/session';
import Transaction from '~/models/transaction';
import { merge } from 'ramda';

let portfolio;

export const ViewModel = DefineMap.extend({
  portfolio: Portfolio,
  isSending: 'boolean',
  isSendFundsPopup: 'boolean',
  isReceiveFundsPopup: 'boolean',
  receiveFunds () {
    this.isReceiveFundsPopup = false;
    if (!this.portfolio) {
      portfolio = new Portfolio({name: 'My Portfolio'});
      portfolio.save().then(portfolio => {
        portfolio.keys = Session.current.user.generatePortfolioKeys(portfolio.index);
        this.portfolio = portfolio;
        this.isReceiveFundsPopup = true;
      });
    } else {
      this.isReceiveFundsPopup = true;
    }
  },
  receiveDone () {
    if (!this.portfolio) {
      this.portfolio = portfolio;
    }
  },
  send (args) {
    const formData = args[1];
    console.log('send: ', formData);

    const amount = formData.amount;
    const currencyType = formData.fundsType.toLowerCase();
    const toAddress = formData.toAddress;
    const txouts = this.portfolio
      .getTxouts(amount, currencyType)
      .map(a => merge(a, {keyPair: this.portfolio.findAddress(a.address).keyPair}));
    const options = {
      fee: formData.transactionFee,
      changeAddr: this.portfolio.nextChangeAddress[currencyType],
      type: 'OUT',
      currencyType,
      description: formData.description
    };
    const tx = Transaction.makeTransaction(amount, toAddress, txouts, options);
    console.log('tx.hex: ' + tx.hex, tx);

    // Show the spinner:
    this.isSending = true;

    tx.save().then(() => {
      this.isSending = false;

      const msg = this.type === 'SECURITIES' ? translate('securitiesSent') : translate('fundsSent');
      hub.dispatch({
        'type': 'alert',
        'kind': 'success',
        'title': msg,
        'displayInterval': 5000
      });
    });
  }
});

export default Component.extend({
  tag: 'my-portfolio',
  ViewModel,
  view
});
