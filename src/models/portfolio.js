/**
 * @module {can-map} models/portfolio Portfolio
 * @parent models.auth
 *
 * Portfolio model
 *
 * @group models/portfolio.properties 0 properties
 */

import DefineMap from 'can-define/map/';
import DefineList from 'can-define/list/list';
import feathersClient from '~/models/feathers-client';
import superModel from '~/models/super-model';
import algebra from '~/models/algebra';

// TODO: FIXTURES ON!
// import '~/models/fixtures/portfolio';

const Portfolio = DefineMap.extend('Portfolio', {
  '*': {
    serialize: false
  },

  /**
   * @property {String} models/portfolio.properties._id _id
   * @parent models/portfolio.properties
   * Id prop
   */
  _id: {
    serialize: true,
    type: 'string'
  },

  /**
   * @property {String} models/portfolio.properties.name name
   * @parent models/portfolio.properties
   * Name of the portfolio. Default: My Portfolio.
   */
  name: {
    serialize: true,
    type: 'string'
  },

  /**
   * @property {String} models/portfolio.properties.addressesMeta addressesMeta
   * @parent models/portfolio.properties
   * Tracking addresses by index for one-time usage.
   * ```
   * [
   *   {index: 0, type: 'EQB', isChange: false, used: true},
   *   {index: 1, type: 'EQB', isChange: false, used: false},
   *   {index: 0, type: 'BTC', isChange: false, used: true},
   * ]
   * ```
   */
  addressesMeta: {
    serialize: true,
    // Type: DefineList,
    // value: new DefineList([])
    value: []
  },

  index: 'number',

  /**
   * @property {String} models/portfolio.properties.addresses addresses
   * @parent models/portfolio.properties
   * A list of address objects that includes real addresses, amount and txouts.
   */
  addresses: {
    get () {
      return (this.addressesMeta && this.addressesMeta.map(a => {
        const keysNode = this.keys[a.type].derive(a.isChange ? 1 : 0).derive(a.index);
        return {
          index: a.index,
          isChange: a.isChange,
          type: a.type,
          address: keysNode.getAddress(),
          keyPair: keysNode.keyPair
        };
      })) || [];
    }
  },

  /**
   * @property {String} models/portfolio.properties.addressesList addressesList
   * @parent models/portfolio.properties
   * A flat list of portfolio addresses to be used for `/listunspent` request.
   */
  addressesBtc: {
    get () {
      return this.addresses.filter(a => a.type === 'BTC').map(a => a.address);
    }
  },
  addressesEqb: {
    get () {
      return this.addresses.filter(a => a.type === 'EQB').map(a => a.address);
    }
  },

  /**
   * @property {String} models/portfolio.properties.userBalance userBalance
   * @parent models/portfolio.properties
   * A reference to user's balance. Portfolio uses it to figure out its own funds in `balance`.
   */
  userBalance: {type: '*'},

  /**
   * @property {String} models/portfolio.properties.balance balance
   * @parent models/portfolio.properties
   * Portfolio's balance gets calculated when user's balance is loaded.
   *
   * ```
   * {
   *   cashBtc: 1,
   *   cashEqb: 3,
   *   cashTotal: 4,
   *   securities: 6,
   *   total: 10,
   *   txouts: {EQB: [], BTC: []}
   * }
   * ```
   */
  balance: {
    get () {
      const unspent = this.userBalance;
      if (!unspent) {
        return {cashBtc: 0, cashEqb: 0, cashTotal: 0, securities: 0, total: 0};
      }

      // TODO: figure out how to evaluate securities.

      const { cashBtc, cashEqb, cashTotal, securities, txouts } = this.addresses.reduce((acc, a) => {
        // Note `listunspent` service returns lower cased `eqb` and `btc` in JSON.
        const unspentByType = unspent[a.type.toLowerCase()];
        if (unspentByType[a.address]) {
          const amount = unspentByType[a.address].amount;

          // TODO: mutating addresses here is a bad pattern.
          // Add amount and txouts:
          a.amount = amount;
          a.txouts = unspentByType[a.address].txouts;

          // Calculate summary:
          if (a.type === 'BTC') {
            acc.cashBtc += amount;
          } else {
            acc.cashEqb += amount;
          }
          acc.cashTotal += amount;
          acc.txouts[a.type] = acc.txouts[a.type].concat(unspentByType[a.address].txouts);
        }
        return acc;
      }, {cashBtc: 0, cashEqb: 0, cashTotal: 0, securities: 0, txouts: {EQB: [], BTC: []}});

      const total = cashTotal + securities;

      return new DefineMap({ cashBtc, cashEqb, cashTotal, securities, total, txouts });
    }
  },

  unrealizedPL: {type: 'number', value: 0},
  unrealizedPLPercent: {type: 'number', value: 0},
  createdAt: 'date',
  updatedAt: 'date',
  userId: 'string',
  keys: {
    type: '*'
  },

  // "m /44' /0' /portfolio-index' /0 /index"
  nextAddress: {
    get () {
      return this.getNextAddress(false);
    }
  },

  // "m /44' /0' /portfolio-index' /1 /index"
  nextChangeAddress: {
    get () {
      return this.getNextAddress(true);
    }
  },

  // getNextAddress :: Bool -> Object(EQB<String>,BTC<String>)
  getNextAddress (isChange = false) {
    const changeIndex = isChange ? 1 : 0;
    const btcAddr = getNextAddressIndex(this.addressesMeta, 'BTC', isChange);
    const eqbAddr = getNextAddressIndex(this.addressesMeta, 'EQB', isChange);
    const btcNode = this.keys.BTC.derive(changeIndex).derive(btcAddr.index);
    const eqbNode = this.keys.EQB.derive(changeIndex).derive(eqbAddr.index);
    const addr = {
      BTC: btcNode.getAddress(),
      EQB: eqbNode.getAddress()
    };
    if (btcAddr.imported === false) {
      // Import addr as watch-only
      this.importAddr(addr.BTC);
      // Mark address as generated/imported but not used yet:
      this.addressesMeta.push({index: 0, type: 'BTC', used: false, isChange});
    }
    if (eqbAddr.imported === false) {
      // Import addr as watch-only
      this.importAddr(addr.EQB);
      // Mark address as generated/imported but not used yet:
      this.addressesMeta.push({index: 0, type: 'EQB', used: false, isChange});
    }
    if (!eqbAddr.imported || !btcAddr.imported) {
      // Save newly generated addresses to DB:
      this.save();
    }

    return addr;
  },

  // Methods:
  /**
   * @function models/portfolio.properties.importAddr importAddr
   * @parent models/portfolio.properties
   * Imports the given address to the built-in wallet (to become watch-only for registering transactions).
   */
  importAddr (addr) {
    // TODO: replace with a specific service (e.g. /import-address).
    feathersClient.service('proxycore').find({
      query: {
        method: 'importaddress',
        params: [addr]
      }
    }).then(res => {
      if (!res.error) {
        console.log('The address was imported successfully', res);
      } else {
        console.error('There was an error when I tried to import your address: ', res);
      }
    });
  },
  hasEnoughFunds (amount, type) {
    return amount === 0 || !!this.getTxouts(amount, type).length;
  },

  /**
   * @function getTxouts
   * Returns txouts that contain enough funds in them.
   * @param amount
   * @param type
   * @returns {*}
   */
  getTxouts (amount, type) {
    if (!this.balance.txouts || this.balance[type === 'BTC' ? 'cashBtc' : 'cashEqb'] < amount) {
      return [];
    }
    return getUnspentOutputsForAmount(this.balance.txouts[type], amount);
  },

  findAddress (addr) {
    return this.addresses.reduce((acc, a) => a.address === addr ? a : acc);
  }
});

function getNextAddressIndex (addresses = [], type, isChange = false) {
  return addresses.filter(a => a.type === type && a.isChange === isChange).reduce((acc, a) => {
    return a.used !== true ? {index: a.index, imported: true} : {index: a.index + 1, imported: false};
  }, {index: 0, imported: false});
}

// function getPoftfolioBalance (balance, addresses) {
//   return addresses.reduce((acc, address) => (balance[address] ? acc + balance[address].amount : acc), 0);
// }

function getUnspentOutputsForAmount (txouts, amount) {
  return txouts.reduce((acc, a) => {
    if (a.amount >= amount &&
        (acc.txouts.length > 1 ||
          (acc.txouts.length === 1 &&
            (acc.txouts[0].amount < amount || a.amount < acc.txouts[0].amount)))
    ) {
      return {sum: a.amount, txouts: [a]};
    }
    if (acc.sum >= amount) {
      return acc;
    }
    acc.sum += a.amount;
    acc.txouts.push(a);
    return acc;
  }, {sum: 0, txouts: []}).txouts;
}

Portfolio.List = DefineList.extend('PortfolioList', {
  '#': Portfolio
});

Portfolio.connection = superModel({
  Map: Portfolio,
  List: Portfolio.List,
  feathersService: feathersClient.service('/portfolios'),
  name: 'portfolio',
  algebra
});

Portfolio.algebra = algebra;

export default Portfolio;
export { getNextAddressIndex };
export { getUnspentOutputsForAmount };

// Import an address to be added as watch-only to the built-in wallet:
// http://localhost:3030/proxycore?method=importaddress&params[]=mwd7FgMkm9yfPmNTnntsRbugZS7BEZaf32

// List unspent TOs for given addresses:
// http://localhost:3030/proxycore?method=listunspent&params[0]=0&params[1]=99999&params[2][]=mp9GiieHrLQvLu4C8nE9bbwxNmXqcC3nVf&params[2][]=mwd7FgMkm9yfPmNTnntsRbugZS7BEZaf32
