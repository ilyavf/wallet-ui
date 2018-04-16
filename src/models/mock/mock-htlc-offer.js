
import DefineMap from 'can-define/map/map'
import { Buffer } from '@equibit/wallet-crypto/dist/wallet-crypto'
import { createHtlcOffer } from '../../components/page-issuance-details/order-book/order-book'
import Order from '../order'
import Session from '../session'
import orderFixturesData from '../fixtures/orders'
import issuance from './mock-issuance'
import './mock-session'

const orderDataAsk = Object.assign({}, orderFixturesData[0], { issuance: issuance })
const orderAsk = new Order(orderDataAsk)
const formDataAsk = new (DefineMap.extend('OfferFormData', {seal: false}, {}))({
  order: orderAsk,
  quantity: 500
})

const orderDataBid = Object.assign({}, orderFixturesData[1], { issuance: issuance })
const orderBid = new Order(orderDataBid)
const formDataBid = new (DefineMap.extend('OfferFormData', {seal: false}, {}))({
  order: orderBid,
  quantity: 500
})

const orderDataBlankEqb = Object.assign({}, orderFixturesData[0], { assetType: 'EQUIBIT' })
const orderBlankEqb = new Order(orderDataBlankEqb)

const secretHex = '7f270ed6627eb571afa18061eda973ba7fb76d5799c29ff2bfa46c23f91db30f'
const secret = Buffer.from(secretHex, 'hex')
const timelock = 20
const eqbAddress = 'n3vviwK6SMu5BDJHgj4z54TMUgfiLGCuoo'
const refundBtcAddress = 'n2iN6cGkFEctaS3uiQf57xmiidA72S7QdA'
// const changeBtcAddressPair = { EQB: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ', BTC: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ' }

// type :: Ask | Bid
export default function (type = 'Ask') {
  const offer = type === 'Ask'
    ? createHtlcOffer(orderAsk, secret, timelock, 'description', Session.current.user, issuance, {EQB: eqbAddress, BTC: refundBtcAddress})
    : createHtlcOffer(orderBid, secret, timelock, 'description', Session.current.user, issuance, {EQB: eqbAddress, BTC: refundBtcAddress})

  offer.quantity = 500
  offer.htlcTxId1 = 'e426a916871ef47650edd38ed66fbcf36803622da301e8931b1df59bee42e301'
  offer.htlcTxId2 = 'e426a916871ef47650edd38ed66fbcf36803622da301e8931b1df59bee42e301'
  offer.timelock2 = timelock / 2

  return {
    offer,
    order: orderAsk,
    orderBid,
    orderData: orderDataAsk,
    orderDataBid,
    orderBlankEqb,
    formData: formDataAsk,
    formDataBid,
    secretHex,
    timelock,
    eqbAddress,
    refundBtcAddress,
    htlcScript: '63a820169c59d82c28bbefc3ef6ae83b94c93ffa03d2c4bd2b9f6d33340fdd4fe27cd98876a914e88316256761f24413dab167e4c2e07a6b8f11ce670114b17576a914e88316256761f24413dab167e4c2e07a6b8f11ce6888ac',
    htlcScript2: '63a820169c59d82c28bbefc3ef6ae83b94c93ffa03d2c4bd2b9f6d33340fdd4fe27cd98876a914f5db705e49316357b6b27087daa63c1ae2771f66675ab17576a91441ab400b12f9311d00ff9bb98423481c921a0edb6888ac',
    htlcScript2Btc: '63a820169c59d82c28bbefc3ef6ae83b94c93ffa03d2c4bd2b9f6d33340fdd4fe27cd98876a914e88316256761f24413dab167e4c2e07a6b8f11ce675ab17576a914a8d51b85759148bf787411b168b4eb380cc12bfd6888ac',
    htlcScript4: '',
    txHex: '010000000101e342ee9bf51d1b93e801a32d620368f3bc6fd68ed3ed5076f41e8716a926e2010000006b483045022100d41a34b389da085ac9bb10ebe84f238a54820a0f8578ca5fbc5e89b27c5d6c0a02205de6fa347953984c7fbc223548ee237bc0c915a79534fd74c137eb275f0bcc6d012103687b195326cc57e054a5b780d3fb3383b2e113a0082be4a22f600acdc276a564ffffffff02b8880000000000005a63a820169c59d82c28bbefc3ef6ae83b94c93ffa03d2c4bd2b9f6d33340fdd4fe27cd98876a914e88316256761f24413dab167e4c2e07a6b8f11ce670114b17576a914e88316256761f24413dab167e4c2e07a6b8f11ce6888ac74029800000000001976a914a8d51b85759148bf787411b168b4eb380cc12bfd88ac00000000',
    txId: '5fddc5744df1a44edd407d816082bef618f46593abe64359af1a1ea75210eafa',
    txHex2: '020000000250ca92bfbf67976d7d3ba408f6481ca7e3666664ce32227b12877d539e757e4e000000006b483045022100e9aee5ec9ec38a82bb4ede08358d7bc05aee6433f32474a111006d98d81544ee0220728d8b8a90766564cd8006d82f4b74f7355a022145a8af1acdd7f495ec0f6d08012102ecddd56c4d3b695ce762ef51dcd2ce4f660396cc93c8e091477d220ba8b896060000000001e342ee9bf51d1b93e801a32d620368f3bc6fd68ed3ed5076f41e8716a926e4000000006a47304402200089e7691233ae1c592aeccf0fa2bbf578e3c25f52f1a111d065efabf64e544802202015ebf33cebff5a5daccc89e8023febce5a64bc3abe6d768c73845c24cd76c9012102f53adfa2754b5fa7066f4d013ff5d10ff7c24e3feb6f1e4f001e275236cd22970000000003f4010000000000005963a820169c59d82c28bbefc3ef6ae83b94c93ffa03d2c4bd2b9f6d33340fdd4fe27cd98876a914f5db705e49316357b6b27087daa63c1ae2771f66675ab17576a91441ab400b12f9311d00ff9bb98423481c921a0edb6888ac000000000050ca92bfbf67976d7d3ba408f6481ca7e3666664ce32227b12877d539e757e4e008ccff008000000001976a91441ab400b12f9311d00ff9bb98423481c921a0edb88ac000000000050ca92bfbf67976d7d3ba408f6481ca7e3666664ce32227b12877d539e757e4e0093e31c0d000000001976a914a8d51b85759148bf787411b168b4eb380cc12bfd88ac000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    txId2: 'f936e8d023813c3b5d9130d4472847c710605667cfa48476ec2860f5a7550761',
    txHex4: '010000000101e342ee9bf51d1b93e801a32d620368f3bc6fd68ed3ed5076f41e8716a926e4000000008d48304502210093728abe8ffb455be8e420b69b7276d99223014b1eb6769d558659a7cc03134e02200ab90aee31c289f68cd990b56f91e4aef08d88447d8650a85be2e039398946a5012102bea71df2e079601e1f279cee848af0e07ff00180a47f58a66cefa5d94b1478c5207f270ed6627eb571afa18061eda973ba7fb76d5799c29ff2bfa46c23f91db30f51ffffffff01ee7f0000000000001976a914e88316256761f24413dab167e4c2e07a6b8f11ce88ac00000000',
    txId4: '8a1116a9424910357bf22e94f1b63aa799aaa4d7c003935a55bb277a8b78ef27',
    txHexBlankEqb: '020000000101e342ee9bf51d1b93e801a32d620368f3bc6fd68ed3ed5076f41e8716a926e4000000008c47304402201af47f16e2df82749b09d5664d7ee4977adcfc323ae5d6d05565dabae3f56c9d02202137e2fe75c0ef535ba43a9916a21ce6174b4f9b5c286b40b8df6784e63e3d2101210262a2aff1cc81f4d56240e3c6c877e7b40d9fa8c3b4c385a2486531f46fae15ba207f270ed6627eb571afa18061eda973ba7fb76d5799c29ff2bfa46c23f91db30f51ffffffff01f3010000000000001976a914f5db705e49316357b6b27087daa63c1ae2771f6688ac0000000020e426a916871ef47650edd38ed66fbcf36803622da301e8931b1df59bee42e30100000000000000000000000000000000000000000000000000000000000000000000000000',
    txIdBlankEqb: '80fe1d6c3d769039e2f74ddb0290b2edeeaaf3eb5a9b76f5cad948937d9c85aa'
  }
}
