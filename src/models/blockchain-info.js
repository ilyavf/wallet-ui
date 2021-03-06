import DefineMap from 'can-define/map/map'
import DefineList from 'can-define/list/list'
import { bitcoin } from '@equibit/wallet-crypto/dist/wallet-crypto'
import feathersClient from './feathers-client'
import { superModelNoCache as superModel } from './super-model'
import algebra from './algebra'

const BlockchainInfo = DefineMap.extend('BlockchainInfo', {seal: false}, {
  '__v': 'number',
  '_id': 'string',
  'bestblockhash': 'string',
  'currentBlockHeight': 'number',
  'coinType': 'string',
  'difficulty': 'number',
  'errorMessage': 'string',
  mode: 'string',   // enum: [ 'regtest', 'test', 'main', 'unknown' ]
  status: 'boolean',
  mediantime: 'number',
  feeRates: {
    default () {
      return new DefineMap({ priority: 20, regular: 5 })
    }
  },
  sha: 'string',
  createdAt: 'date',
  updatedAt: 'date',
  get network () {
    return this.mode === 'main' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  }
  // these should probably be added on the server side from the RPC call
  // 'mediantime': 'date',
  // 'verificationprogress': 'number',
})

BlockchainInfo.List = DefineList.extend('BlockchainInfo.List', {
  '#': BlockchainInfo
})

BlockchainInfo.connection = superModel({
  Map: BlockchainInfo,
  List: BlockchainInfo.List,
  feathersService: feathersClient.service('/blockchain-info'),
  name: 'BlockchainInfos',
  algebra// ,
  // TODO can remove this when the backend for blockchain-info is ready
  // getList () {
  //   const service = feathersClient.service('/proxycore')
  //   return Promise.all([
  //     service.get({
  //       node: 'btc',
  //       action: 'getblockchaininfo'
  //     }).then(p => { p.result._id = 'BTC'; return p.result }),
  //     service.get({
  //       node: 'eqb',
  //       action: 'getblockchaininfo'
  //     }).then(p => { p.result._id = 'EQB'; return p.result })
  //   ])
  // }
})

BlockchainInfo.algebra = algebra
let singleton
BlockchainInfo.infoBySymbol = function () {
  if (!singleton) {
    singleton = new DefineMap({
      BTC: new this({coinType: 'BTC'}),
      EQB: new this({coinType: 'EQB', sha: 'SHA3_256'}),
      isPending: true,
      promise: this.findAll().then(results => {
        results.forEach(result => {
          singleton.set(result.coinType, result)
        })
        singleton.isPending = false
        return singleton
      })
    })
  }
  return singleton
}

export default BlockchainInfo
