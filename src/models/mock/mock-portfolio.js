import Portfolio from '../portfolio'
import hdNode from './mock-keys'
import listunspent, { listunspentZero, listunspentBtc } from './mock-listunspent'

const addressesMeta = [
  {index: 0, type: 'BTC', used: true, isChange: false},
  {index: 1, type: 'BTC', used: true, isChange: false},
  {index: 0, type: 'EQB', used: true, isChange: false},
  {index: 1, type: 'EQB', used: false, isChange: false},

  {index: 0, type: 'BTC', used: true, isChange: true}
]

const portfolioKeys = {
  BTC: hdNode.derivePath("m/44'/0'/0'"),
  EQB: hdNode.derivePath("m/44'/73'/0'")
}

const portfolio = new Portfolio({
  index: 0,
  name: 'My Portfolio',
  addressesMeta,
  keys: portfolioKeys,
  userBalance: listunspent
})

const portfolioZero = new Portfolio({
  index: 0,
  name: 'My Portfolio Empty',
  addressesMeta,
  keys: portfolioKeys,
  userBalance: listunspentZero
})

const portfolioBtc = new Portfolio({
  index: 0,
  name: 'My Portfolio Empty',
  addressesMeta,
  keys: portfolioKeys,
  userBalance: listunspentBtc
})

export default portfolio
export { portfolioZero }
export { portfolioBtc }
export { addressesMeta }
