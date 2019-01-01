import { getGroupsList, getMemberList, createTempGroup, removeTempGroup, queryTempGroup, sendSMS, callSet, editTempGroup } from '@/libs/webDispatcher-sdk.js'
import * as types from '../types/group'
import * as appTypes from '../types/app'
import {getTrees, uniqueArr, upOnline} from '@/utils/utils'

export default {
  state: {
    treeGroupList: [],
    originGroupList: [],
    memberList: {},
    originMembersObj: {},
    homeSelectedGroupId: '',
    openGroup: [],
    tempGroupMembers: [], // 多选框选择是的临时群组成员
    groupTempList: [], // block-member组件要显示的临时群组成员
    selectMemberList: [],
    tempGroupList: [], // 右侧临时群组列表
    nowStatus: '',
    treeGroupSelectedList: [],
    tempGroupInfo: null,
    singleCallActiveCid: '',
    messageList: [],
    switchingGroup: null,
    allMembersObj: null,
    allGroupsObj: null,
    dragingMember: null
  },
  getters: {
    originGroupList: state => state.originGroupList,
    memberList: state => state.memberList,
    originMembersObj: state => state.originMembersObj,
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
    treeGroupSelectedList: state => state.treeGroupSelectedList,
    groupTempList: state => state.groupTempList,
    tempGroupInfo: state => state.tempGroupInfo,
    singleCallActiveCid: state => state.singleCallActiveCid,
    messageList: state => state.messageList
  },
  mutations: {
    [types.SetOriginGroupsList] (state, list) {
      state.originGroupList = list
    },
    [types.SetOriginMembersObj] (state, newState) {
      if (newState) {
        state.originMembersObj[newState.gid] = newState.item
      }
      state.originMembersObj = Object.assign({}, state.originMembersObj)
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
    [types.SetTreeGroupSelectedList] (state, newState) {
      state.treeGroupSelectedList = newState
    },
    [types.SetGroupTempList] (state, newState) {
      state.groupTempList = newState
    },
    [types.SetTempGroupInfo] (state, bool) {
      state.tempGroupInfo = bool
    },
    [types.SetSingleCallActiveCid] (state, cid) {
      state.singleCallActiveCid = cid
    },
    [types.SetMessageList] (state, list) {
      state.messageList = list
    },
    [types.SetSwitchingGroup] (state, item) {
      state.switchingGroup = item
    },
    [types.SetAllMembersObj] (state, obj) {
      state.allMembersObj = obj
    },
    [types.SetAllGroupsObj] (state, obj) {
      state.allGroupsObj = obj
    },
    [types.SetDragingMember] (state, newState) {
      state.dragingMember = newState
    }
  },
  actions: {
    async [types.GetTreeGroupsList] ({commit, dispatch, state}) {
      commit(appTypes.SetAppLoading, true)
      let result = await getGroupsList()
      if (result.data && result.data.list) {
        let list = result.data.list
        let i = 0
        await dispatch(types.GetOriginMembersObj, {list: list, i})

        let newlist = list.map(value => {
          let item = {...value}
          let computedGroup = []
          dispatch(types.FilterUnderGroup, {gid: item.gid, computedGroup, list})
          computedGroup = uniqueArr(computedGroup)
          return item
        })

        commit(types.SetOriginGroupsList, newlist)
        newlist = getTrees(newlist, newlist[0].fid)
        commit(types.SetTreeGroupList, newlist)
      }
    },
    async [types.GetOriginMembersObj] ({commit, dispatch}, {list, i}) {
      let result = await getMemberList(list[i].gid)
      if (result.data && result.data.list) {
        let gid = result.data.gid
        let filterList = result.data.list.filter(item => {
          return item.grp === gid
        })
        let online = upOnline(filterList)
        commit(types.SetOriginMembersObj, {item: result.data.list, gid: list[i].gid})
        commit(types.SetMemberList, {item: online, gid: list[i].gid})
        i++
        if (i >= list.length) return
        await dispatch(types.GetOriginMembersObj, {list, i})
      }
    },
    [types.CreatTempGroup] ({commit, dispatch}, { cidsLength, cidsString }) {
      commit(appTypes.SetAppLoading, true)
      return new Promise((resolve, reject) => {
        createTempGroup(cidsLength, cidsString, res => {
          commit(appTypes.SetAppLoading, false)
          if (res && res.code === 0) {
            dispatch(types.GetTempGroupInfo).then((tempInfo) => {
              console.log(tempInfo)
              resolve(tempInfo)
            })
          } else {
            reject(new Error('error'))
          }
          commit(types.SetTempGroupMembers, []) // 清空选择
          commit(types.SetTreeGroupSelectedList, [])
        })
      })
    },
    [types.RemoveTempGroup] ({commit}, type) {
      commit(appTypes.SetAppLoading, true)
      let _type = type + ''
      return new Promise((resolve, reject) => {
        removeTempGroup(_type, res => {
          if (res && res.code === 0) {
            resolve()
          } else {
            reject(new Error('error'))
          }
        })
      })
    },
    [types.FilterUnderGroup] ({dispatch}, {gid, computedGroup, list}) {
      computedGroup.push(gid)
      for (let item of list) {
        if (item.fid === gid) {
          computedGroup.push(item.gid)
          dispatch(types.FilterUnderGroup, {gid: item.gid, computedGroup, list})
        }
      }
    },
    [types.GetTempGroupInfo] () {
      return new Promise((resolve) => {
        queryTempGroup(res => {
          if (res && res.code === 0) {
            resolve(res)
          }
        })
      })
    },
    [types.SendSMS] ({commit, state}, {mid, msName, msg}) {
      return new Promise((resolve) => {
        sendSMS(mid, msName, msg, res => {
          console.log(res)
        })
        resolve()
      })
    },
    [types.SetCallSet] ({commit, state}, {gid, mid, type}) {
      console.log(gid, mid, type)
      return new Promise((resolve, reject) => {
        callSet(gid, mid, type, res => {
          if (res && res.code === 0) {
            resolve()
          } else {
            reject(new Error('error'))
          }
        })
      })
    },
    [types.EditTempGroup] ({commit, dispatch}, {type, counts, mids}) {
      commit(appTypes.SetAppLoading, true)
      return new Promise((resolve, reject) => {
        editTempGroup(type, counts, mids, res => {
          console.log(res)
          commit(appTypes.SetAppLoading, false)
          if (res && res.code === 0) {
            dispatch(types.GetTempGroupInfo).then((tempInfo) => {
              console.log(tempInfo)
              resolve(tempInfo)
            })
          } else {
            reject(new Error('error'))
          }
        })
      })
    }
  }
}
