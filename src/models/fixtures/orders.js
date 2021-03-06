import fixture from 'can-fixture'
import { times } from 'ramda'
import Order from '../order'
import issuance from '../mock/mock-issuance'
import { companies } from '../fixtures/issuances'

const data = times(i => {
  return {
    _id: '' + i,
    issuanceAddress: issuance.address,
    issuanceId: issuance._id,
    quantity: (1000 * (i + 1)),
    price: 70 * (i + 1),
    createdAt: [(new Date()).toJSON(), '2017-04-12T04:35:34.835Z', '2017-03-05T08:45:34.835Z'][i % 3],
    isFillOrKill: [true, false, false][i % 3],
    type: ['SELL', 'BUY', 'SELL'][i % 3],
    status: ['OPEN', 'TRADING', 'CANCELLED', 'CLOSED', 'TRADING-AVAILABLE'][i % 5],
    acceptedOfferIds: (i < 6 ? ['1', '2'] : ['3', '4', '5']),

    btcAddress: 'n2iN6cGkFEctaS3uiQf57xmiidA72S7QdA',
    // eqbAddressTrading: ['', 'mk7KNEW61JGqTiJ7h4vXUAziChW29igyn1', ''][i % 3],
    eqbAddress: issuance.utxo[0].address,

    companyName: companies[i % 9],
    issuanceName: ['Series 1', 'Series 2'][i % 2],
    issuanceType: ['common_shares', 'trust_units', 'preferred_shares'][i % 3],

    assetType: ['ISSUANCE', 'EQUIBIT'][i < 25 ? 0 : 1]
  }
}, 50)

const store = fixture.store(data, Order.algebra)

fixture('/orders/{_id}', store)

export default data
