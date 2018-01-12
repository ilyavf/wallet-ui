import assert from 'chai/chai'
import 'steal-mocha'
import { bitcoin } from '@equibit/wallet-crypto/dist/wallet-crypto'

// Fixtures:
import '../fixtures/portfolio'
import '../fixtures/listunspent'
import '../mock/mock-session'
import hdNode from '../mock/mock-keys'
import issuance from '../mock/mock-issuance'
import portfolio from '../mock/mock-portfolio'
import mockHtlcOffer from '../mock/mock-htlc-offer'

import {
  buildTransaction,
  buildTransactionOld,
  buildTransactionBtc,
  buildTransactionEqb,
  toSatoshi
} from './transaction-build'
import { makeTransaction } from './transaction-make'
import { createHtlc1, prepareHtlcConfig, prepareTxData } from './transaction-create-htlc1'
import { createHtlc2, prepareHtlcConfig2 } from './transaction-create-htlc2'
import { createHtlc3, prepareHtlcConfig3 } from './transaction-create-htlc3'

describe('models/transaction/utils', function () {
  describe('buildTransaction', function () {
    const expectedHex = '0100000002b5a4d2ee7ada7a30722d3224c8e29443e75fc3506612ae41ee853f2fe24b6756000000006b483045022100c5d7e56232d2eff6461ea45bb8e9ffee36675598adb853bf6f61e881b2c29282022000d4f1d3c3e091daa4dbece16fb1f27ee199fdbd2db4db940b9a4b6987e24ed6012102c149f0b80bbbb0811cd7f2d8c2eed5bae28de5e992064590a0a16eb1743bc469ffffffff79ea8eea8ee96dc748304f5d85163d28bfcc0f9760ee50e02664b6b52dd9da1e000000006b483045022100861ac9755c989a65726a1dbf46bf85dcf12928fc5f4bc42fede7142af4111fd30220385336eed4e26c52c605a18a60effee88bfc9d0306b09994dd85bf48607762f50121028fe426abec4cd47b05911e18e91cd751a1646d179217380e7799cd12268bf202ffffffff0201000000000000001976a9143ed6bbf121b09f20b46381ab7dbf547e18ffbc3b88ac02000000000000001976a914af407ff486847db48b9a2cb25b6e14d3044eaf4488ac00000000'
    const inputA = hdNode.derive(0)
    const inputB = hdNode.derive(1)
    const inputs = [
      {txid: '56674be22f3f85ee41ae126650c35fe74394e2c824322d72307ada7aeed2a4b5', vout: 0, keyPair: inputA.keyPair},
      {txid: '1edad92db5b66426e050ee60970fccbf283d16855d4f3048c76de98eea8eea79', vout: 0, keyPair: inputB.keyPair}
    ]
    const outputs = [
      {address: 'mmFDRwLd2sNzqFHeoKJdrTdwMzVYiH4Hm6', value: 1},
      {address: 'mwVbp9hMyfvnjW3sEbyfgLqiGd4wMxbekh', value: 2}
    ]
    it('should create a transaction hex (bitcoinjs-lib build)', function () {
      const transactionInfo = buildTransactionOld('BTC')(inputs, outputs, bitcoin.networks.testnet)
      assert.equal(transactionInfo.hex, expectedHex)
    })
    // todo: figure out why tx-builder causes testee to crash (Internal error: too much recursion. Stack trace: /testee/testee.min.js:202:55582)
    if (window.Testee) {
      it.skip('skipping builtTransaction in Testee due to https://github.com/ilyavf/tx-builder/issues/12', function () {})
    } else {
      it('should create a transaction hex (tx-builder)', function () {
        const transactionInfo = buildTransaction('BTC')(inputs, outputs, bitcoin.networks.testnet)
        assert.equal(transactionInfo.hex, expectedHex)
      })
    }
  })
  describe.skip('buildTransactionBtc', function () {
    it('should work :)', function () {
      assert.ok(typeof buildTransactionBtc === 'function')
    })
  })
  describe.skip('buildTransactionEqb', function () {
    it('should work :)', function () {
      assert.ok(typeof buildTransactionEqb === 'function')
    })
  })
  describe.skip('toSatoshi', function () {
    it('should work :)', function () {
      assert.ok(typeof toSatoshi === 'function')
    })
  })
  describe.skip('makeTransaction', function () {
    it('should work :)', function () {
      assert.ok(typeof makeTransaction === 'function')
    })
  })
  describe('HTLC-1', function () {
    const changeAddrPair = { EQB: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ', BTC: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ' }
    let htlcOfferMock, htlcConfig
    describe('prepareHtlcConfig', function () {
      before(function () {
        htlcOfferMock = mockHtlcOffer()
        htlcConfig = prepareHtlcConfig(htlcOfferMock.offer, htlcOfferMock.order, portfolio, changeAddrPair.BTC)
      })
      it('should create buildConfig', function () {
        const amount = htlcOfferMock.offer.quantity * htlcOfferMock.orderData.price
        const buildConfig = htlcConfig.buildConfig
        assert.equal(buildConfig.vin.length, 1, 'one vin')
        assert.equal(buildConfig.vin[0].txid, 'e226a916871ef47650edd38ed66fbcf36803622da301e8931b1df59bee42e301', 'txid')
        assert.equal(buildConfig.vin[0].vout, 1, 'vin.0.vout')
        assert.ok(buildConfig.vin[0].keyPair, 'keyPair')
        assert.equal(buildConfig.vout[0].value, amount, 'amount of 35000')
        assert.equal(buildConfig.vout[0].scriptPubKey.toString('hex'), htlcOfferMock.htlcScript, 'scriptPubKey')
        assert.equal(buildConfig.vout[1].value, 10000000 - amount - 1000, 'change amount of 9964000')
        assert.equal(buildConfig.vout[1].address, changeAddrPair.BTC, 'change address')
      })
      it('should create txInfo object', function () {
        const txInfo = htlcConfig.txInfo
        assert.equal(txInfo.address, 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ', 'address')
        assert.equal(txInfo.addressTxid, 'e226a916871ef47650edd38ed66fbcf36803622da301e8931b1df59bee42e301', 'vin.0.txid')
        assert.equal(txInfo.addressVout, '1', 'vin.0.vout')
        assert.equal(txInfo.amount, 35000, 'amount')
        assert.equal(txInfo.currencyType, 'BTC', 'currencyType')
        assert.equal(txInfo.description, 'Buying securities (HTLC #1)', 'description')
        assert.equal(txInfo.fee, 1000, 'fee')
        assert.equal(txInfo.fromAddress, 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ', 'fromAddress')
        assert.equal(txInfo.toAddress, 'mk7KNEW61JGqTiJ7h4vXUAziChW29igyn1', 'toAddress')
        assert.equal(txInfo.type, 'BUY', 'type')
      })
    })

    if (window.Testee) {
      it.skip('skipping builtTransaction HTLC in Testee due to https://github.com/ilyavf/tx-builder/issues/12', function () {})
    } else {
      describe('buildTransaction htlc', function () {
        let tx
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          htlcConfig = prepareHtlcConfig(htlcOfferMock.offer, htlcOfferMock.order, portfolio, changeAddrPair.BTC)
          tx = buildTransaction('BTC')(htlcConfig.buildConfig.vin, htlcConfig.buildConfig.vout)
        })
        it('should return tx hex', function () {
          assert.equal(tx.hex, htlcOfferMock.txHex)
        })
        it('should return txid', function () {
          assert.equal(tx.txId, htlcOfferMock.txId)
        })
      })
    }
    describe('prepareTxData', function () {
      let txData, tx
      before(function () {
        htlcOfferMock = mockHtlcOffer()
        htlcConfig = prepareHtlcConfig(htlcOfferMock.offer, htlcOfferMock.order, portfolio, changeAddrPair.BTC)
        tx = { hex: htlcOfferMock.txHex, txId: htlcOfferMock.txId }
        txData = prepareTxData(htlcConfig, tx, issuance)
      })
      it('should define htlc props', function () {
        assert.equal(txData.hashlock, htlcOfferMock.offer.hashlock, 'hashlock')
        assert.equal(txData.timelock, htlcOfferMock.offer.timelock, 'timelock')
      })
      it('should define tx props', function () {
        assert.equal(txData.hex, tx.hex, 'tx hex')
        assert.equal(txData.txId, tx.txId, 'txId')
      })
      it('should define issuance props', function () {
        assert.equal(txData.issuanceId, issuance._id, 'issuanceId')
        assert.equal(txData.issuanceName, issuance.issuanceName, 'issuanceName')
        assert.equal(txData.issuanceType, issuance.issuanceType, 'issuanceType')
        assert.equal(txData.issuanceUnit, issuance.issuanceUnit, 'issuanceUnit')
        assert.equal(txData.companyName, issuance.companyName, 'companyName')
        assert.equal(txData.companySlug, issuance.companySlug, 'companySlug')
      })
    })
    if (window.Testee) {
      describe.skip('skipping createHtlc1 in Testee due to https://github.com/ilyavf/tx-builder/issues/12', function () {})
    } else {
      describe('createHtlc1', function () {
        let txData, tx
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          tx = { hex: htlcOfferMock.txHex, txId: htlcOfferMock.txId }
          txData = createHtlc1(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair)
        })
        it('should define main props', function () {
          assert.equal(txData.amount, 35000, 'amount')
          assert.equal(txData.issuanceId, issuance._id, 'issuanceId')
        })
        it('should define hashlock', function () {
          assert.equal(txData.hashlock.length, 64)
          assert.equal(txData.hashlock, htlcOfferMock.offer.hashlock)
        })
        it('should define transaction hex and id', function () {
          assert.equal(txData.hex, tx.hex, 'tx hex')
          assert.equal(txData.txId, tx.txId, 'txId')
        })
      })
    }
  })

  describe('HTLC-2', function () {
    const changeAddrPair = { EQB: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ', BTC: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ' }
    let htlcOfferMock, htlcConfig

    describe('prepareHtlcConfig2', function () {
      describe('buildConfig', function () {
        let amount, order, buildConfig
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          htlcConfig = prepareHtlcConfig2(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair.EQB)
          amount = htlcOfferMock.offer.quantity
          order = htlcOfferMock.order
          buildConfig = htlcConfig.buildConfig
        })
        it('should have two vin for issuance and empty EQB', function () {
          assert.equal(buildConfig.vin.length, 2, 'two vins')
        })
        it('should have correct issuance inputs', function () {
          assert.equal(buildConfig.vin[0].txid, issuance.utxo[0].txid, 'issuance txid')
          assert.equal(buildConfig.vin[0].vout, issuance.utxo[0].vout, 'vin.0.vout')
          assert.ok(buildConfig.vin[0].keyPair, 'keyPair')
        })
        it('should have correct empty EQB inputs', function () {
          const utxo = portfolio.utxoByTypeByAddress.EQB.addresses.mjVjVPi7j8CJvqCUzzjigbbqn4GYF7hxMU.txouts
          assert.equal(buildConfig.vin[1].txid, utxo[0].txid, 'txid empty EQB')
          assert.equal(buildConfig.vin[1].vout, utxo[0].vout, 'vin.1.vout empty EQB')
          assert.ok(buildConfig.vin[1].keyPair, 'keyPair empty EQB')
        })
        it('should have 3 outputs', function () {
          assert.equal(buildConfig.vout.length, 3, 'three vouts')
        })
        it('should have correct issuance output (amount, script and issuance txid)', function () {
          assert.equal(buildConfig.vout[0].value, amount, 'amount of 500')
          assert.equal(buildConfig.vout[0].scriptPubKey.toString('hex'), htlcOfferMock.htlcScript2, 'scriptPubKey')
          assert.equal(buildConfig.vout[0].issuanceTxId, '4e7e759e537d87127b2232ce646666e3a71c48f608a43b7d6d9767bfbf92ca50', 'txid of the authorization transaction')
        })
        it('should have correct issuance change output', function () {
          assert.equal(buildConfig.vout[1].value, issuance.utxo[0].amount - amount, 'change for securities of 149999500')
          assert.equal(buildConfig.vout[1].address, order.eqbAddressHolding, 'change address for securities (eqbAddressHolding)')
        })
        it('should have correct empty EQB  change output', function () {
          const utxo = portfolio.utxoByTypeByAddress.EQB.addresses.mjVjVPi7j8CJvqCUzzjigbbqn4GYF7hxMU.txouts
          assert.equal(buildConfig.vout[2].value, utxo[0].amount - 1000, 'change amount empty EQB of 219999000')
          assert.equal(buildConfig.vout[2].address, changeAddrPair.EQB, 'change address for empty EQB')
        })
      })

      describe('txInfo', function () {
        let txInfo, amount, order, offer, buildConfig
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          htlcConfig = prepareHtlcConfig2(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair.EQB)
          amount = htlcOfferMock.offer.quantity
          order = htlcOfferMock.order
          offer = htlcOfferMock.offer
          buildConfig = htlcConfig.buildConfig
          txInfo = htlcConfig.txInfo
        })
        it('should have main address info', function () {
          assert.equal(txInfo.address, order.eqbAddressHolding, 'address = order.eqbAddressHolding')
          assert.equal(txInfo.addressTxid, buildConfig.vin[0].txid, 'addressTxid = vin.0.txid')
          assert.equal(txInfo.addressVout, buildConfig.vin[0].vout, 'addressVout = vin.0.vout')
        })
        it('should have amount, types and desc', function () {
          assert.equal(txInfo.amount, amount, 'amount of 500')
          assert.equal(txInfo.currencyType, 'EQB', 'currencyType')
          assert.equal(txInfo.type, 'SELL', 'type')
          assert.equal(txInfo.description, 'Selling securities (HTLC #2)', 'description')
        })
        it('should have fee and from/to addresses', function () {
          assert.equal(txInfo.fee, 1000, 'fee')
          assert.equal(txInfo.fromAddress, order.eqbAddressHolding, 'fromAddress = order.eqbAddressHolding')
          assert.equal(txInfo.toAddress, offer.eqbAddressTrading, 'toAddress = offer.eqbAddressTrading')
        })
      })
    })

    if (window.Testee) {
      describe.skip('skipping createHtlc2 in Testee due to https://github.com/ilyavf/tx-builder/issues/12', function () {})
    } else {
      describe('createHtlc2', function () {
        let txData, tx
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          tx = { hex: htlcOfferMock.txHex2, txId: htlcOfferMock.txId2 }
          txData = createHtlc2(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair)
        })
        it('should define main props', function () {
          assert.equal(txData.amount, 500, 'amount')
          assert.equal(txData.fee, 1000, 'fee')
          assert.equal(txData.issuanceId, issuance._id, 'issuanceId')
        })
        it('should define hashlock', function () {
          assert.equal(txData.hashlock.length, 64)
          assert.equal(txData.hashlock, htlcOfferMock.offer.hashlock)
        })
        it('should define transaction hex and id', function () {
          assert.equal(txData.hex, tx.hex, 'tx hex')
          assert.equal(txData.txId, tx.txId, 'txId')
        })
      })
    }
  })

  describe.only('HTLC-3', function () {
    const changeAddrPair = { EQB: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ', BTC: 'mvuf7FVBox77vNEYxxNUvvKsrm2Mq5BtZZ' }
    let htlcOfferMock, htlcConfig

    describe('prepareHtlcConfig3', function () {
      describe('buildConfig', function () {
        let amount, order, buildConfig
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          htlcConfig = prepareHtlcConfig3(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair.EQB)
          htlcConfig = prepareHtlcConfig3(order, offer, portfolio, issuance, secret, changeAddr)
          amount = htlcOfferMock.offer.quantity
          order = htlcOfferMock.order
          buildConfig = htlcConfig.buildConfig
        })
        it('should have two vin for issuance and empty EQB', function () {
          assert.equal(buildConfig.vin.length, 2, 'two vins')
        })
        it('should have correct issuance inputs', function () {
          assert.equal(buildConfig.vin[0].txid, issuance.utxo[0].txid, 'issuance txid')
          assert.equal(buildConfig.vin[0].vout, issuance.utxo[0].vout, 'vin.0.vout')
          assert.ok(buildConfig.vin[0].keyPair, 'keyPair')
        })
        it('should have correct empty EQB inputs', function () {
          const utxo = portfolio.utxoByTypeByAddress.EQB.addresses.mjVjVPi7j8CJvqCUzzjigbbqn4GYF7hxMU.txouts
          assert.equal(buildConfig.vin[1].txid, utxo[0].txid, 'txid empty EQB')
          assert.equal(buildConfig.vin[1].vout, utxo[0].vout, 'vin.1.vout empty EQB')
          assert.ok(buildConfig.vin[1].keyPair, 'keyPair empty EQB')
        })
        it('should have 3 outputs', function () {
          assert.equal(buildConfig.vout.length, 3, 'three vouts')
        })
        it('should have correct issuance output (amount, script and issuance txid)', function () {
          assert.equal(buildConfig.vout[0].value, amount, 'amount of 500')
          assert.equal(buildConfig.vout[0].scriptPubKey.toString('hex'), htlcOfferMock.htlcScript2, 'scriptPubKey')
          assert.equal(buildConfig.vout[0].issuanceTxId, '4e7e759e537d87127b2232ce646666e3a71c48f608a43b7d6d9767bfbf92ca50', 'txid of the authorization transaction')
        })
        it('should have correct issuance change output', function () {
          assert.equal(buildConfig.vout[1].value, issuance.utxo[0].amount - amount, 'change for securities of 149999500')
          assert.equal(buildConfig.vout[1].address, order.eqbAddressHolding, 'change address for securities (eqbAddressHolding)')
        })
        it('should have correct empty EQB  change output', function () {
          const utxo = portfolio.utxoByTypeByAddress.EQB.addresses.mjVjVPi7j8CJvqCUzzjigbbqn4GYF7hxMU.txouts
          assert.equal(buildConfig.vout[2].value, utxo[0].amount - 1000, 'change amount empty EQB of 219999000')
          assert.equal(buildConfig.vout[2].address, changeAddrPair.EQB, 'change address for empty EQB')
        })
      })

      describe('txInfo', function () {
        let txInfo, amount, order, offer, buildConfig
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          htlcConfig = prepareHtlcConfig2(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair.EQB)
          amount = htlcOfferMock.offer.quantity
          order = htlcOfferMock.order
          offer = htlcOfferMock.offer
          buildConfig = htlcConfig.buildConfig
          txInfo = htlcConfig.txInfo
        })
        it('should have main address info', function () {
          assert.equal(txInfo.address, order.eqbAddressHolding, 'address = order.eqbAddressHolding')
          assert.equal(txInfo.addressTxid, buildConfig.vin[0].txid, 'addressTxid = vin.0.txid')
          assert.equal(txInfo.addressVout, buildConfig.vin[0].vout, 'addressVout = vin.0.vout')
        })
        it('should have amount, types and desc', function () {
          assert.equal(txInfo.amount, amount, 'amount of 500')
          assert.equal(txInfo.currencyType, 'EQB', 'currencyType')
          assert.equal(txInfo.type, 'SELL', 'type')
          assert.equal(txInfo.description, 'Selling securities (HTLC #2)', 'description')
        })
        it('should have fee and from/to addresses', function () {
          assert.equal(txInfo.fee, 1000, 'fee')
          assert.equal(txInfo.fromAddress, order.eqbAddressHolding, 'fromAddress = order.eqbAddressHolding')
          assert.equal(txInfo.toAddress, offer.eqbAddressTrading, 'toAddress = offer.eqbAddressTrading')
        })
      })
    })

    if (window.Testee) {
      describe.skip('skipping createHtlc2 in Testee due to https://github.com/ilyavf/tx-builder/issues/12', function () {})
    } else {
      describe('createHtlc2', function () {
        let txData, tx
        before(function () {
          htlcOfferMock = mockHtlcOffer()
          tx = { hex: htlcOfferMock.txHex2, txId: htlcOfferMock.txId2 }
          txData = createHtlc2(htlcOfferMock.offer, htlcOfferMock.order, portfolio, issuance, changeAddrPair)
        })
        it('should define main props', function () {
          assert.equal(txData.amount, 500, 'amount')
          assert.equal(txData.fee, 1000, 'fee')
          assert.equal(txData.issuanceId, issuance._id, 'issuanceId')
        })
        it('should define hashlock', function () {
          assert.equal(txData.hashlock.length, 64)
          assert.equal(txData.hashlock, htlcOfferMock.offer.hashlock)
        })
        it('should define transaction hex and id', function () {
          assert.equal(txData.hex, tx.hex, 'tx hex')
          assert.equal(txData.txId, tx.txId, 'txId')
        })
      })
    }
  })
})
