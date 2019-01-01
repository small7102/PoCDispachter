import * as types from '../types/group'
import * as map from '../types/map'
import { Member } from '@/libs/dom'
import { uniqueArr, upOnline } from '@/utils/utils'
import language from '@/libs/language'
import Storage from '@/utils/localStorage'
const ONLINE = '1'

export default {
  computed: {
    user () {
      return this.$store.getters.userInfo
    },
    memberObj () {
      return this.$store.getters.memberList
    },
    originGroupList () {
      return this.$store.getters.originGroupList
    },
    groupTempList: {
      get () {
        return this.$store.getters.groupTempList
      },
      set (val) {
        this.$store.commit(types.SetGroupTempList, val)
      }
    },
    nowStatus: {
      get () {
        return this.$store.getters.nowStatus
      },
      set (val) {
        this.$store.commit(types.SetNowStatus, val)
      }
    },
    originMembersObj () {
      return this.$store.state.group.originMembersObj
    },
    allMembersObj: {
      get () {
        return this.$store.state.group.allMembersObj
      },
      set (val) {
        this.$store.commit(types.SetAllMembersObj, val)
      }
    },
    tempGroupInfo: {
      get () {
        return this.$store.getters.tempGroupInfo
      },
      set (val) {
        this.$store.commit(types.SetTempGroupInfo, val)
      }
    }
  },
  data () {
    return {
    }
  },
  created () {
    this.language = this.$store.getters.language
    this.languageContext = language[this.language].store.mixin
  },
  methods: {
    iconImg (item) {
      const terminal = {
        '20': 'Dispatcher',
        '10': 'App',
        '6': 'PoC'
      }
      return this.getOnlineImg(terminal[item.type], item.online, item.model)
    },
    getOnlineImg (iconName, online, model) {
      iconName = iconName ? iconName : 'PoC'
      if (model && model === 'M50') iconName = 'M50'
      let imgName = online === '1' ? `${iconName}_online_2x` : `${iconName}_offline_2x`
      let url = require(`../../assets/device-icon@1.5/${imgName}.png`)
      return url
    },
    getAllMembersObj () {
      return new Promise((resolve, reject) => {
        let obj = {}
        for (let key in this.originMembersObj) {
          for (let item of this.originMembersObj[key]) {
            if (!obj[item.cid]) obj[item.cid] = item
          }
        }
        this.allMembersObj = obj
        resolve()
      })
    },
    getAllGroupsObj () {
      let obj = {}
      for (let item of this.originGroupList) {
        if (!obj[item.gid]) obj[item.gid] = item
      }
      this.$store.commit(types.SetAllGroupsObj, obj)
    },
    nowGroup () { // 当前所在群组
      this.nowStatus = `当前所在群组${this.user.pttGroup}`
    },
    handleSomeoneOnline ({gid, mid, online = ONLINE}) {
      let memberList = [...this.memberObj[gid]]

      let obj = this.getMemberAndChange({grp: gid, online, mid})
      if (mid === this.user.msId) { // 置顶自己
        obj = {...obj, online: ONLINE, name: this.user.msName}
        memberList = memberList.filter(item => {
          return item.cid !== mid
        })
        memberList.unshift(obj)
      } else { // 前置刚上线的成员
        if (online === ONLINE) { // 有人上线
          gid === this.user.gId ? memberList.splice(1, 0, obj) : memberList.unshift(obj)
        } else { // 有人xia线
          let index = memberList.findIndex(item => {
            return item.cid === obj.cid
          })
          memberList.splice(index, 1)
          memberList.push(obj)
        }
      }
      memberList = uniqueArr(memberList, 'cid') || []
      this.$store.commit(types.SetMemberList, {item: memberList, gid})
      this.hasTempGroupHandleSomeoneOnline(online)
    },
    hasTempGroupHandleSomeoneOnline (online) { // 有临时群组时有人上线了
      if (this.tempGroupInfo) {
        let selectMembers = this.tempGroupInfo.cids.map(cid => {
          return this.allMembersObj[cid]
        })
        selectMembers = upOnline(selectMembers)
        this.groupTempList = selectMembers
        this.$store.commit(map.SetMapTempMemberList, selectMembers)
        let tempGroupInfo = {...this.tempGroupInfo}
        this.tempGroupInfo = this.getOnlineNum({obj: tempGroupInfo, key: 'onlineLength', online})
      }
    },
    handleOnllineNum (gid, online) {
      return this.originGroupList.map(item => {
        let obj = {...item}
        if (obj.gid === gid) {
          obj = this.getOnlineNum({obj, key: 'onlineNum', online})
        }
        return obj
      })
    },
    getOnlineNum ({obj, key, online}) {
      obj[key] = online === ONLINE ? obj[key] + 1 : obj[key] - 1
      return obj
    },
    switchToOtherGroup ({prevGid, nowGid, type = 'myself', mid, res}) {
      return new Promise((resolve) => {
        let newMemberList = []

        if (type === 'myself') {
          let nowMemberList = [...this.memberObj[nowGid]]
          let oldMemberList = [...this.memberObj[prevGid]]
          newMemberList = this.myselfSwitchGroup({oldMemberList, nowMemberList, prevGid, nowGid})
          resolve(newMemberList)
        } else {
          this.otherSwitchGroup({prevGid, nowGid, mid, res})
          resolve()
        }
      })
    },
    myselfSwitchGroup ({oldMemberList, nowMemberList, prevGid, nowGid}) { // 自己切换群组
      let newMemberList = []
      let [myself, ...newOldMemberList] = oldMemberList
      newMemberList.push({...myself, online: '1'})
      newMemberList = newMemberList.concat(nowMemberList)
      this.$store.commit(types.SetMemberList, {item: newOldMemberList, gid: prevGid})
      this.$store.commit(types.SetMemberList, {item: newMemberList, gid: nowGid})
      return newMemberList
    },
    otherSwitchGroup ({prevGid, nowGid, mid, res}) {
      // 当前的群组中是否包含切到的群组
      let hasPrevGroup = this.hasGid(prevGid)
      let hasNowGroup = this.hasGid(nowGid)

      let oldMemberList = hasPrevGroup && [...this.memberObj[prevGid]]
      let nowMemberList = hasNowGroup && [...this.memberObj[nowGid]]
      let someone = this.getMemberAndChange({grp: nowGid, mid})

      hasPrevGroup && this.updateOldGroup(oldMemberList, prevGid, someone, res)
      hasNowGroup && this.updateNewGroup(nowMemberList, nowGid, someone, res)
    },
    getMemberAndChange ({grp, online = '1', mid}) {
      let allMembersObj = {...this.allMembersObj}
      let someone = {...this.allMembersObj[mid], grp, online}
      allMembersObj[mid] = someone
      this.allMembersObj = allMembersObj
      return someone
    },
    hasGid (gid) {
      let memberObjArr = Object.keys(this.memberObj)
      return memberObjArr.some(item => {
        return item === gid
      })
    },
    updateOldGroup (oldMemberList, gid, someone) {
      let result = []
      result = oldMemberList.filter(item => {
        return item.cid !== someone.cid
      })
      this.$store.commit(types.SetMemberList, {item: result, gid})
    },
    updateNewGroup (nowMemberList, gid, someone) {
      gid === this.user.gId ? nowMemberList.splice(1, 0, someone) : nowMemberList.unshift(someone)
      this.$store.commit(types.SetMemberList, {item: nowMemberList, gid})
    },
    getTempGroupInfo (data, creatType, tempInfo) {
      let tempGroupList = []
      let cids = []
      let onlineLength = 0
      let creater, type, length, name, id

      if (data.data && data.data.length) {
        length = data.data.length - 1
        if (data.mid === this.user.msId) {
          creater = this.user.msName
          type = 0
        } else {
          creater = this.allMembersObj[data.mid].name
          type = 1
        }
        for (let item of data.data) {
          if (item.msId !== this.user.msId) {
            cids.push(item.msId)
            if (item.online === 1) onlineLength++
            item = new Member({
              cid: item.msId,
              name: item.msName,
              online: item.online + '',
              type: item.msType,
              grp: item.CurrGrpId,
              callset: item.callSet
            })
            tempGroupList.push(item)
          }
        }
      }
      if (creatType === 'MAP_TEMP_GROUP') this.hasMapTempGroup = true
      console.log(this.hasMapTempGroup)
      if (creatType === 'SINGLE_TEMP_GROUP') {
        let state = data.data.find(item => {
          return item.msId !== this.user.msId
        })
        this.nowStatus = `${state.msName}单呼`
      } else {
        this.nowStatus = this.languageContext.tempGroup
      }
      if (tempInfo && tempInfo.id) id = tempInfo.id
      this.tempGroupInfo = {creater, type, onlineLength, cids, length, name, id, creatType}
      this.groupTempList = upOnline(tempGroupList)
      this.saveRecentGroup(this.tempGroupInfo)
    },
    saveRecentGroup (tempGroupInfo) {
      if (tempGroupInfo && tempGroupInfo.creatType !== 'SINGLE_TEMP_GROUP') {
        let myRecentTempInfo = Storage.localGet('myRecentTempInfo')
        if (myRecentTempInfo) {
          myRecentTempInfo[this.user.msId] = tempGroupInfo
          Storage.localSet('myRecentTempInfo', myRecentTempInfo)
        }
      }
    }
  }
}
