import * as types from '../types/user'
import { switchGroup } from '@/libs/webDispatcher-sdk.js'

export default {
  state: {
    userInfo: '',
    mySocket: null
  },
  getters: {
    userInfo: state => state.userInfo,
    mySocket: state => state.mySocket
  },
  mutations: {
    [types.SetUserInfo] (state, info) {
      state.userInfo = info
    },
    [types.SetMySocket] (state, newState) {
      state.mySocket = newState
      console.log(state.mySocket)
    }
  },
  actions: {
    [types.SwitchGroup] ({commit, state}, item) {
      return new Promise((resolve, reject) => {
        switchGroup(item.gid, res => {
          if (res && res.code === 0) {
            let userInfo = {...state.userInfo}
            userInfo.pttGroup = item.name
            userInfo.gId = item.gid
            commit(types.SetUserInfo, userInfo)
          }
          console.log(res.code)
          resolve(res.code)
        })
      })
    }
  }
}
