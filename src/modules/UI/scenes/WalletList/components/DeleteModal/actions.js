// @flow

import { createYesNoModal } from 'edge-components'
import React from 'react'

import * as Constants from '../../../../../../constants/indexConstants.js'
import s from '../../../../../../locales/strings.js'
import { deleteWalletRequest } from '../../../../../Core/Account/api.js'
import { getAccount, getWalletName } from '../../../../../Core/selectors.js'
import { showModal } from '../../../../../ModalManager.js'
import type { Dispatch, GetState } from '../../../../../ReduxTypes.js'
import Text from '../../../../components/FormattedText'
import OptionIcon from '../../../../components/OptionIcon/OptionIcon.ui'

export const showDeleteWalletModal = (walletId: string) => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const walletName = getWalletName(state, walletId)
  const account = getAccount(state)

  // Use `showModal` to put the modal component on screen:
  const modal = createYesNoModal({
    title: s.strings.fragment_wallets_delete_wallet,
    message: (
      <Text style={{ textAlign: 'center' }}>
        {s.strings.fragmet_wallets_delete_wallet_first_confirm_message_mobile}
        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{`${walletName}?`}</Text>
      </Text>
    ),
    icon: <OptionIcon iconName={Constants.DELETE} />,
    noButtonText: s.strings.string_cancel_cap,
    yesButtonText: s.strings.string_delete
  })

  const resolveValue = await showModal(modal)

  if (resolveValue) {
    try {
      deleteWalletRequest(account, walletId)
    } catch (e) {
      throw new Error(e)
    }
  }
}

export type OpenDeleteWalletModalAction = {
  type: 'OPEN_DELETE_WALLET_MODAL',
  data: { walletId: string }
}

export type CloseDeleteWalletModalAction = {
  type: 'CLOSE_DELETE_WALLET_MODAL'
}

export type DeleteWalletModalAction = OpenDeleteWalletModalAction | CloseDeleteWalletModalAction
