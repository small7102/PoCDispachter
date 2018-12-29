import * as types from '../types/user'
import { login, switchGroup, token } from '@/libs/webDispatcher-sdk.js'
import * as appTypes from '../types/app'
import * as log from '../types/log'
import app from './app'
import Storage from '@/utils/localStorage'
import {codeConfig} from '@/libs/codeConfig'
import {dateFmt} from '@/utils/utils'

export default {
  state: {
    userInfo: '',
    mySocket: null,
    token: '',
    language: 'Chinese'
  },
  getters: {
    userInfo: state => state.userInfo,
    mySocket: state => state.mySocket,
    token: state => state.token,
    language: state => state.language
  },
  mutations: {
    [types.SetUserInfo] (state, info) {
      state.userInfo = info
    },
    [types.SetMySocket] (state, newState) {
      state.mySocket = newState
    },
    [types.SetToken] (state, token) {
      state.token = token
    },
    [types.SetLanguage] (state, language) {
      state.language = language
    }
  },
  actions: {
    [types.GetUserInfo] ({commit, state}, {account, password}) {
      return new Promise((resolve, reject) => {
        login(account, password, (res) => {
          if (res && res.code === 0 && res.msType === '20') {
            console.log('登录', res)
            Storage.sessionSet('token', token)
            Storage.sessionSet('user', {account, password})
            commit(types.SetUserInfo, res)
            commit(log.SaveLog, {account: account, name: res.msName, type: codeConfig.loginNotice, remark: ''})
            resolve(0)
          } else if (res && res.code === '503') {
            reject(res.code)
          } else if (res && res.msType !== '20') {
            res.code === 0 ? reject(6) : reject(res.code)
          }
        })
      })
    },
    [types.SwitchGroup] ({commit, state}, item) {
      commit(appTypes.SetAppLoading, true)
      return new Promise((resolve, reject) => {
        switchGroup(item.gid, res => {
          commit(appTypes.SetAppLoading, false)
          if (res && res.code === 0) {
            let userInfo = {...state.userInfo, pttGroup: item.name, gId: item.gid}
            commit(log.SaveLog, {
              account: state.userInfo.msId,
              name: state.userInfo.msName,
              type: codeConfig.switchNotice,
              remark: `[${state.userInfo.pttGroup}] To [${item.name}]`})
            commit(types.SetUserInfo, userInfo)
            resolve(res.code)
          } else {
            reject(new Error('error'))
          }
        })
      })
    }
  }
}
