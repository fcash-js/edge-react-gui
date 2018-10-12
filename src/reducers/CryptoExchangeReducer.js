// @flow

import type { EdgeExchangeQuote } from 'edge-core-js'
import { type Reducer } from 'redux'

import * as Constants from '../constants/indexConstants'
import s from '../locales/strings.js'
import { type Action } from '../modules/ReduxTypes.js'
import { type GuiCurrencyInfo, type GuiWallet } from '../types.js'

export type CryptoExchangeState = {
  nativeMax: string,
  nativeMin: string,
  reverseNativeMax: string,
  reverseNativeMin: string,
  fromWallet: GuiWallet | null,
  fromCurrencyCode: string | null,
  fromNativeAmount: string,
  fromDisplayAmount: string,
  fromWalletPrimaryInfo: GuiCurrencyInfo, // EdgeCurrencyInfo | null,
  fromCurrencyIcon: string | null,
  fromCurrencyIconDark: string | null,
  toWallet: GuiWallet | null,
  toCurrencyCode: string | null,
  toNativeAmount: string,
  toDisplayAmount: string,
  toWalletPrimaryInfo: GuiCurrencyInfo, // EdgeCurrencyInfo | null,
  toCurrencyIcon: string | null,
  toCurrencyIconDark: string | null,
  insufficientError: boolean,
  feeSetting: 'low' | 'standard' | 'high' | 'custom',
  walletListModalVisible: boolean,
  forceUpdateGuiCounter: number,
  shiftTransactionError: Error | null,
  genericShapeShiftError: Error | null,
  changeWallet: 'none',
  fee: any,
  availableShapeShiftTokens: Object,
  shiftPendingTransaction: boolean,
  quoteExpireDate: Date | null,
  quote: EdgeExchangeQuote | null
}

const dummyCurrencyInfo: GuiCurrencyInfo = {
  displayCurrencyCode: '',
  exchangeCurrencyCode: '',
  displayDenomination: {
    name: '',
    multiplier: '1'
  },
  exchangeDenomination: {
    name: '',
    multiplier: '1'
  }
}

const initialState = {
  nativeMax: '0',
  nativeMin: '0',
  reverseNativeMax: '0',
  reverseNativeMin: '0',

  fromWallet: null,
  fromCurrencyCode: null,
  fromNativeAmount: '0',
  fromDisplayAmount: '0',
  fromWalletPrimaryInfo: dummyCurrencyInfo,
  fromCurrencyIcon: null,
  fromCurrencyIconDark: null,

  toWallet: null,
  toCurrencyCode: null,
  toNativeAmount: '0',
  toDisplayAmount: '0',
  toWalletPrimaryInfo: dummyCurrencyInfo,
  toCurrencyIcon: null,
  toCurrencyIconDark: null,

  fee: 0,
  insufficientError: false,
  feeSetting: Constants.STANDARD_FEE,
  walletListModalVisible: false,
  shiftTransactionError: null,
  genericShapeShiftError: null,
  changeWallet: Constants.NONE,
  forceUpdateGuiCounter: 0,
  availableShapeShiftTokens: {},
  shiftPendingTransaction: false,
  quoteExpireDate: null,
  quote: null
}

function cryptoExchangeInner (state = initialState, action: Action) {
  let forceUpdateGuiCounter
  switch (action.type) {
    case 'SWAP_FROM_TO_CRYPTO_WALLETS': {
      return deepCopyState(state)
    }

    case 'SELECT_FROM_WALLET_CRYPTO_EXCHANGE': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        fromWallet: action.data.wallet,
        fromWalletPrimaryInfo: action.data.primaryInfo,
        fromCurrencyCode: action.data.currencyCode,
        fromCurrencyIcon: getLogo(action.data.wallet, action.data.currencyCode),
        // $FlowFixMe
        fromCurrencyIconDark: getLogoDark(action.data.wallet, action.data.currencyCode),
        changeWallet: Constants.NONE,
        fromNativeAmount: '0',
        toNativeAmount: '0',
        fromDisplayAmount: '0',
        toDisplayAmount: '0',
        minerFee: '0',
        fee: '',
        exchangeRate: 1,
        quoteExpireDate: null,
        quote: null
      }
    }

    case 'SELECT_TO_WALLET_CRYPTO_EXCHANGE': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        toWallet: action.data.wallet,
        toCurrencyCode: action.data.currencyCode,
        toWalletPrimaryInfo: action.data.primaryInfo,
        toCurrencyIcon: getLogo(action.data.wallet, action.data.currencyCode),
        // $FlowFixMe
        toCurrencyIconDark: getLogoDark(action.data.wallet, action.data.currencyCode),
        changeWallet: Constants.NONE,
        fromNativeAmount: '0',
        toNativeAmount: '0',
        fromDisplayAmount: '0',
        toDisplayAmount: '0',
        minerFee: '0',
        fee: '',
        exchangeRate: 1,
        quote: null,
        quoteExpireDate: null
      }
    }

    case 'DISABLE_WALLET_LIST_MODAL_VISIBILITY': {
      return {
        ...state,
        walletListModalVisible: false
      }
    }

    case 'OPEN_WALLET_SELECTOR_MODAL': {
      return {
        ...state,
        walletListModalVisible: true,
        changeWallet: action.data
      }
    }

    case 'UPDATE_CRYPTO_EXCHANGE_INFO': {
      if (!action.data) throw new Error('Invalid action')
      const result = {
        ...state,
        nativeMin: action.data.nativeMin,
        nativeMax: action.data.nativeMax
      }
      return result
    }

    case 'UPDATE_CRYPTO_REVERSE_EXCHANGE_INFO': {
      if (!action.data) throw new Error('Invalid action')
      const result = {
        ...state,
        reverseNativeMin: action.data.nativeMin,
        reverseNativeMax: action.data.nativeMax
      }
      return result
    }

    case 'UPDATE_SHIFT_TRANSACTION_FEE': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        quote: action.data.quote,
        toNativeAmount: action.data.toNativeAmount,
        toDisplayAmount: action.data.toDisplayAmount,
        fromNativeAmount: action.data.fromNativeAmount,
        fromDisplayAmount: action.data.fromDisplayAmount,
        quoteExpireDate: action.data.quoteExpireDate,
        fee:
          action.data.networkFee && state.fromCurrencyCode
            ? s.strings.string_fee_with_colon + ' ' + action.data.networkFee + ' ' + state.fromWalletPrimaryInfo.displayDenomination.name
            : ' ',
        insufficientError: false,
        genericShapeShiftError: null
      }
    }

    case 'INVALIDATE_SHIFT_TRANSACTION': {
      return {
        ...state,
        quote: null,
        insufficientError: false,
        genericShapeShiftError: null,
        quoteExpireDate: null
      }
    }

    case 'SHIFT_COMPLETE': {
      return {
        ...initialState,
        availableShapeShiftTokens: state.availableShapeShiftTokens
      }
    }

    case 'SHIFT_ERROR': {
      return {
        ...state,
        confirmTransactionModalVisible: false,
        shiftTransactionError: action.data
      }
    }

    case 'CLOSE_CRYPTO_EXEC_CONF_MODAL': {
      return {
        ...state,
        confirmTransactionModalVisible: false
      }
    }

    case 'RECEIVED_INSUFFICENT_FUNDS_ERROR': {
      return {
        ...state,
        quote: null,
        insufficientError: true,
        genericShapeShiftError: null,
        shiftTransactionError: null
      }
    }

    case 'GENERIC_SHAPE_SHIFT_ERROR': {
      return {
        ...state,
        quote: null,
        genericShapeShiftError: action.data,
        shiftTransactionError: null
      }
    }

    case 'ON_AVAILABLE_SHAPE_SHIFT_TOKENS': {
      return {
        ...state,
        availableShapeShiftTokens: action.data
      }
    }

    case 'START_SHIFT_TRANSACTION': {
      return {
        ...state,
        shiftPendingTransaction: true
      }
    }

    case 'DONE_SHIFT_TRANSACTION': {
      return {
        ...state,
        shiftPendingTransaction: false
      }
    }

    case 'SET_FROM_WALLET_MAX': {
      forceUpdateGuiCounter = state.forceUpdateGuiCounter
      forceUpdateGuiCounter++
      return {
        ...state,
        fromNativeAmount: action.data,
        forceUpdateGuiCounter
      }
    }

    default:
      return state
  }
}

function getLogo (wallet, currencyCode) {
  if (currencyCode === wallet.currencyCode) return wallet.symbolImage
  for (let i = 0; i < wallet.metaTokens.length; i++) {
    const obj = wallet.metaTokens[i]
    if (obj.symbolImage && obj.currencyCode === currencyCode) {
      return obj.symbolImage
    }
  }
  return null
}

function getLogoDark (wallet, currencyCode) {
  if (currencyCode === wallet.currencyCode) return wallet.symbolImageDarkMono
  for (let i = 0; i < wallet.metaTokens.length; i++) {
    const obj = wallet.metaTokens[i]
    if (obj.symbolImage && obj.currencyCode === currencyCode) {
      return obj.symbolImage
    }
  }
  return null
}

function deepCopyState (state) {
  const deepCopy = JSON.parse(JSON.stringify(state))
  deepCopy.toWallet = state.fromWallet
  deepCopy.toCurrencyCode = state.fromCurrencyCode
  deepCopy.toNativeAmount = '0'
  deepCopy.toDisplayAmount = '0'
  deepCopy.toWalletPrimaryInfo = state.fromWalletPrimaryInfo
  deepCopy.toCurrencyIcon = state.fromCurrencyIcon
  deepCopy.toCurrencyIconDark = state.fromCurrencyIconDark
  deepCopy.fromWallet = state.toWallet
  deepCopy.fromCurrencyCode = state.toCurrencyCode
  deepCopy.fromNativeAmount = '0'
  deepCopy.fromDisplayAmount = '0'
  deepCopy.fromWalletPrimaryInfo = state.toWalletPrimaryInfo
  deepCopy.fromCurrencyIcon = state.toCurrencyIcon
  deepCopy.fromCurrencyIconDark = state.toCurrencyIconDark

  deepCopy.nativeMin = state.reverseNativeMin
  deepCopy.reverseNativeMin = state.nativeMin

  deepCopy.nativeMax = state.reverseNativeMax
  deepCopy.reverseNativeMax = state.nativeMax

  deepCopy.forceUpdateGuiCounter = state.forceUpdateGuiCounter + 1

  deepCopy.insufficientError = false

  return deepCopy
}

// Nuke the state on logout:
export const cryptoExchange: Reducer<CryptoExchangeState, Action> = (state, action: Action) => {
  if (action.type === 'LOGOUT' || action.type === 'DEEP_LINK_RECEIVED') {
    return cryptoExchangeInner(undefined, { type: 'DUMMY_ACTION_PLEASE_IGNORE' })
  }

  return cryptoExchangeInner(state, action)
}
