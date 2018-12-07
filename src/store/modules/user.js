import * as types from '../types/user'
import { login, switchGroup, token } from '@/libs/webDispatcher-sdk.js'
import * as appTypes from '../types/app'
import Storage from '@/utils/localStorage'

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
      return new Promise((resolve) => {
        login(account, password, (res) => {
          if (res && res.code === 0 && res.msType === '20') {
            Storage.sessionSet('token', token)
            Storage.sessionSet('user', {account, password})
            commit(types.SetUserInfo, res)
            resolve(0)
          } else{
            res.code === 0 ? resolve(6) : resolve(res.code)
          }
        })
      })
    },
    [types.SwitchGroup] ({commit, state}, item) {
      commit(appTypes.SetAppLoading, true)
      return new Promise((resolve, reject) => {
        switchGroup(item.gid, res => {
          if (res && res.code === 0) {
            let userInfo = {...state.userInfo}
            userInfo.pttGroup = item.name
            userInfo.gId = item.gid
            commit(types.SetUserInfo, userInfo)
          }
          resolve(res.code)
        })
      })
    }
  }
}
