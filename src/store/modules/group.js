import { getGroupsList, getMemberList, createTempGroup, removeTempGroup } from '@/libs/webDispatcher-sdk.js'
import * as types from '../types/group'
import {getTrees, uniqueArr} from '@/utils/utils'
import Storage from '@/utils/localStorage'

export default {
  state: {
    treeGroupList: [],
    originGroupList: [],
    memberList: {},
    homeSelectedGroupId: '',
    openGroup: [],
    tempGroupMembers: [], // 多选框选择是的临时群组成员
    groupTempList: [], // block-member组件要显示的临时群组成员
    selectMemberList: [],
    tempGroupList: Storage.localGet('tempGroup'),
    nowStatus: '',
    myself: {},
    treeGroupSelectedList: []
  },
  getters: {
    originGroupList: state => state.originGroupList,
    memberList: state => state.memberList,
    selectMemberList: state => {
      return state.memberList[state.openGroup[0]]
    },
    treeGroupList: state => state.treeGroupList,
    openGroup: state => state.openGroup,
    tempGroupList: state => {
      return !state.tempGroupList ? [] : state.tempGroupList
    },
    tempGroupMembers: state => state.tempGroupMembers,
    nowStatus: state => state.nowStatus,
    myself: state => state.myself,
    treeGroupSelectedList: state => state.treeGroupSelectedList,
    groupTempList: state => state.groupTempList,

  },
  mutations: {
    [types.SetOriginGroupsList] (state, list) {
      state.originGroupList = list
    },
    [types.SetMemberList] (state, newState) {
      if (newState) {
        state.memberList[newState.gid] = newState.item
      }
      state.memberList = Object.assign({}, state.memberList)
    },
    [types.SetTreeGroupList] (state, list) {
      state.treeGroupList = list
    },
    [types.SetOpenGroup] (state, list) {
      state.openGroup = list
    },
    [types.SetTempGroupMembers] (state, newState) {
      state.tempGroupMembers = newState
    },
    [types.SetSelectedMemberList] (state, newState) {
      state.selectMemberList = newState
    },
    [types.SetTempGroupList] (state, newState) {
      state.tempGroupList = newState
    },
    [types.SetNowStatus] (state, newState) {
      state.nowStatus = newState
    },
    [types.SetMyself] (state, newState) {
      state.myself = newState
    },
    [types.SetTreeGroupSelectedList] (state, newState) {
      state.treeGroupSelectedList = newState
    },
    [types.SetGroupTempList] (state, newState) {
      state.groupTempList = newState
      console.log(newState)
    }
  },
  actions: {
    async [types.GetTreeGroupsList] ({commit, dispatch}) {
      let result = await getGroupsList()
      console.log(result)
      if (result.data && result.data.list) {
        let list = result.data.list
        let i = 0
        await dispatch(types.GetMemberList, {list: list, i})
        commit(types.SetOriginGroupsList, list)
        list = getTrees(list, '0')
        commit(types.SetTreeGroupList, list)
      }
    },
    async [types.GetMemberList] ({commit, dispatch}, {list, i}) {
      let result = await getMemberList(list[i].gid)
      if (result.data && result.data.list) {
        commit(types.SetMemberList, {item: result.data.list, gid: list[i].gid})
        i++
        if (i >= list.length) return
        await dispatch(types.GetMemberList, {list, i})
      }
    },
    [types.CreatTempGroup] ({commit, state}) {
      let list = state.tempGroupMembers
      return new Promise((resolve, reject) => {
        if (list.length === 0) {
          resolve(0)
          return
        }
        createTempGroup(list.length, list, res => {
          if (res && res.code === 1) {
            let newArr = []
            newArr.push(state.myself)
            newArr = newArr.concat(list)
            newArr = uniqueArr(newArr)

            const len = newArr.length
            resolve(len)
            if (len > 1) commit(types.SetGroupTempList, newArr)
            commit(types.SetTempGroupMembers, []) // 清空选择
            commit(types.SetTreeGroupSelectedList, []) // 清楚选款的选择
          }
        })
      })
    },
    [types.RemoveTempGroup] ({commit}, type = 0) {
      return new Promise((resolve, reject) => {
        removeTempGroup(type, res => {
          if (res && res.code === 0) {
            resolve()
            commit(types.SetTempGroupMembers, []) // 清空选择
          }
        })
      })
    }
  }
}
