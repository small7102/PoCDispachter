import { getGroupsList, getMemberList, createTempGroup, removeTempGroup, token, queryTempGroup, sendSMS } from '@/libs/webDispatcher-sdk.js'
import * as types from '../types/group'
import * as appTypes from '../types/app'
import {getTrees, uniqueArr, upOnline, filterObjArrByKey} from '@/utils/utils'
import map from './map'
import {Member, TempGroupInfo} from '@/libs/dom'

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
    tempGroupList: [],//右侧临时群组列表
    nowStatus: '',
    myself: {},
    treeGroupSelectedList: [],
    memberlistGetOver: false,
    tempGroupInfo: null,
    singleCallActiveCid: '',
    messageList: []
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
    memberlistGetOver: state => state.memberlistGetOver,
    tempGroupInfo: state => state.tempGroupInfo,
    singleCallActiveCid: state => state.singleCallActiveCid,
    messageList: state => state.messageList
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
    },
    [types.SetMemberlistGetOver] (state, newState) {
      state.memberlistGetOver = newState
    },
    [types.SetTempGroupInfo] (state, bool) {
      state.tempGroupInfo = bool
    },
    [types.SetSingleCallActiveCid] (state, cid) {
      state.singleCallActiveCid = cid
    },
    [types.SetMessageList] (state, list) {
      state.messageList = list
    }
  },
  actions: {
    async [types.GetTreeGroupsList] ({commit, dispatch, state}) {
      commit(appTypes.SetAppLoading, true)
      let result = await getGroupsList()
      if (result.data && result.data.list) {
        let list = result.data.list
        let i = 0
        await dispatch(types.GetMemberList, {list: list, i})

        let newlist = list.map(value => {
          let item = {...value}
          let computedGroup = []
          dispatch(types.FilterUnderGroup, {gid: item.gid, computedGroup, list})
          computedGroup = uniqueArr(computedGroup)
          let all = 0
          let onlineNum = 0
          computedGroup.forEach(item => {
            all += state.memberList[item].length
            const onlineList = state.memberList[item].filter(itemOnline => {
              return itemOnline.online === '1'
            })
            onlineNum += onlineList.length
          })

          item.onlineNum = onlineNum
          item.all = all

          return item
        })

        commit(types.SetOriginGroupsList, newlist)
        newlist = getTrees(newlist, newlist[0].fid)
        commit(types.SetTreeGroupList, newlist)
      }
    },
    async [types.GetMemberList] ({commit, dispatch}, {list, i}) {
      let result = await getMemberList(list[i].gid)
      if (result.data && result.data.list) {
        let gid = result.data.gid
        let filterList = result.data.list.filter(item => {
          return item.grp === gid
        })
        let online = upOnline(filterList)
        commit(types.SetMemberList, {item: online, gid: list[i].gid})
        i++
        if (i >= list.length) {
          commit(types.SetMemberlistGetOver, true)
          return
        }
        await dispatch(types.GetMemberList, {list, i})
      }
    },
    [types.CreatTempGroup] ({commit, state}, {cids, cidsLength, cidsString}) {
      commit(appTypes.SetAppLoading, true)
      return new Promise((resolve, reject) => {
        createTempGroup(cidsLength, cidsString, res => {
          if (res && res.code === 0) {
            let selectMembers = filterObjArrByKey(cids, state.memberList, 'cid')
            selectMembers.unshift(state.myself)
            selectMembers = uniqueArr(selectMembers, 'cid')
            let code = selectMembers.length === 2 ? 1 : 2
            commit(types.SetGroupTempList, upOnline(selectMembers))
            resolve({code: code, cids, members: selectMembers})
            commit(types.SetTempGroupMembers, []) // 清空选择
          } else {
              resolve({code: 4})
            }
        })
      })
    },
    [types.RemoveTempGroup] ({commit}, type) {
      commit(appTypes.SetAppLoading, true)
      let _type = type+''
      return new Promise((resolve, reject) => {
        removeTempGroup(_type, res => {
          if (res && res.code === 0) {
            resolve()
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
    [types.GetTempGroupInfo] ({commit, state}, name) {
      return new Promise((resolve) => {
        queryTempGroup(res => {
          if (res && res.code === 0) {
            commit(types.SetNowStatus, name)
            let cids = []
            let onlineLength = 0
            let newArr = res.data.map(item => {
              let newItem = new Member({
                cid: item.msId,
                name: item.msName,
                online: item.online + '',
                type: item.msType,
                grp: item.CurrGrpId,
                callset: item.callSet
              })
              cids.push(item.msId)
              if (item.online === 1) onlineLength++
              return newItem
            })
            let creater = filterObjArrByKey(res.mid, state.memberList, 'cid')[0].name
            let type = res.mid === state.myself.cid ? 0 : 1 // 判断是自己创建的临时群组还是别人创建的0自己，1别人
            let tempGroupObj = new TempGroupInfo({name, length: res.data.length, type, cids, creater, onlineLength})
            commit(types.SetTempGroupInfo, tempGroupObj)
            commit(types.SetGroupTempList, upOnline(newArr))
            resolve()
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
    }
  }
}
