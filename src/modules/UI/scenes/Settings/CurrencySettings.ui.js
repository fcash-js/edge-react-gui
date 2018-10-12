// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import s from '../../../../locales/strings.js'
import type { GuiDenomination } from '../../../../types'
import T from '../../components/FormattedText'
import Gradient from '../../components/Gradient/Gradient.ui'
import SafeAreaView from '../../components/SafeAreaView'
import RadioRows from './components/RadioRows.ui.js'
import Row from './components/Row.ui.js'
import ModalRow from './components/RowModal.ui.js'
import SwitchRow from './components/RowSwitch.ui.js'
import { SetCustomNodesModal } from './components/SetCustomNodesModal.ui.js'
import styles from './style'

const SETTINGS_DENOMINATION_TEXT = s.strings.settings_denominations_title
const CUSTOM_NODES_TEXT = s.strings.settings_custom_nodes_title

type Props = {
  denominations: Array<GuiDenomination>,
  logo: string,
  selectDenomination: string => void,
  selectedDenominationKey: string,
  isCustomNodesEnabled?: boolean,
  customNodesList: Array<string>,
  saveCustomNodesList: (Array<string>) => void,
  setCustomNodesModalVisibility: (visibility: boolean | null) => void,
  enableCustomNodes: () => void,
  disableCustomNodes: () => void,
  logo: string,
  defaultElectrumServer: string
}

type State = {
  isSetCustomNodesModalVisible: boolean,
  activatedBy: string | null
}

export default class CurrencySettings extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      isSetCustomNodesModalVisible: false,
      activatedBy: null
    }
  }

  header (title: string) {
    return (
      <Gradient style={[styles.headerRow]}>
        <View style={[styles.headerTextWrap]}>
          <View style={styles.leftArea}>
            <T style={styles.headerText}>{SETTINGS_DENOMINATION_TEXT}</T>
          </View>
        </View>
      </Gradient>
    )
  }

  subHeader (title: string) {
    return (
      <Gradient style={[styles.headerRow]}>
        <View style={[styles.headerTextWrap]}>
          <View style={styles.leftArea}>
            <T style={styles.headerText}>{title}</T>
          </View>
        </View>
      </Gradient>
    )
  }

  selectDenomination = (key: string) => () => {
    return this.props.selectDenomination(key)
  }

  closeSetCustomNodesModal = (callback: () => mixed) => {
    this.setState(
      {
        isSetCustomNodesModalVisible: false
      },
      callback
    )
  }

  openSetCustomNodesModal = (activatedBy: string) => {
    this.setState({
      isSetCustomNodesModalVisible: true,
      activatedBy
    })
  }

  enableSetCustomNodes = () => {
    this.props.enableCustomNodes()
  }

  disableSetCustomNodes = () => {
    this.props.disableCustomNodes()
  }

  onChangeEnableCustomNodes = () => {
    if (!this.props.isCustomNodesEnabled) {
      this.setState(
        {
          isSetCustomNodesModalVisible: true
        },
        this.enableSetCustomNodes
      )
      this.openSetCustomNodesModal('switch')
    } else {
      this.disableSetCustomNodes()
    }
  }

  render () {
    return (
      <SafeAreaView>
        <View style={[styles.ethereumSettings]}>
          <Gradient style={styles.gradient} />
          <View style={styles.container}>
            {this.props.defaultElectrumServer && (
              <SetCustomNodesModal
                isActive={this.state.isSetCustomNodesModalVisible}
                onExit={this.closeSetCustomNodesModal}
                customNodesList={this.props.customNodesList}
                saveCustomNodesList={this.props.saveCustomNodesList}
                defaultElectrumServer={this.props.defaultElectrumServer}
                disableCustomNodes={this.props.disableCustomNodes}
                isCustomNodesEnabled={this.props.isCustomNodesEnabled}
                activatedBy={this.state.activatedBy}
              />
            )}
            {this.header(SETTINGS_DENOMINATION_TEXT)}
            <RadioRows style={{}}>
              {this.props.denominations.map(denomination => {
                const key = denomination.multiplier
                const left = (
                  <View style={{ flexDirection: 'row' }}>
                    <T style={styles.symbol}>{denomination.symbol}</T>
                    <T> - {denomination.name}</T>
                  </View>
                )
                const isSelected = key === this.props.selectedDenominationKey
                const onPress = this.selectDenomination(key)
                return <Row key={denomination.multiplier} denomination={denomination} left={left} isSelected={isSelected} onPress={onPress} />
              })}
            </RadioRows>
            {this.props.defaultElectrumServer && (
              <View>
                {this.subHeader(CUSTOM_NODES_TEXT)}
                <SwitchRow
                  leftText={s.strings.settings_enable_custom_nodes}
                  onToggle={this.onChangeEnableCustomNodes}
                  value={this.props.isCustomNodesEnabled}
                  onSaveCustomNodesList={this.props.saveCustomNodesList}
                />
                <ModalRow
                  onPress={() => this.openSetCustomNodesModal('row')}
                  leftText={s.strings.settings_set_custom_nodes_modal_title}
                  disabled={!this.props.isCustomNodesEnabled}
                />
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    )
  }
}
