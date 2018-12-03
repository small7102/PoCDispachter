import * as types from '../types/group'
import {Message, Notice} from 'iview'
import {getTrees, uniqueArr, upOnline, filterObjArrByKey} from '@/utils/utils'
export default {
  methods: {
    iconImg ({terminalType, online, multiple = 1}) {
      const terminal = {
        '20': 'Dispatcher',
        '10': 'App',
        '6': 'PoC'
      }

      return this.getOnlineImg(terminal[terminalType], online, multiple)
    },
    getOnlineImg (iconName, online) {
      iconName = iconName ? iconName : 'PoC'
      let imgName = online === '1' ? `${iconName}_online_2x` : `${iconName}_offline_2x`
      let url = require(`../../assets/device-icon@1.5/${imgName}.png`)

      return url
    },
    upMyself () {
      let user = this.$store.getters.userInfo
      this.handleSomeoneOnline({gid: user.gId, mid: user.msId})
    },
    getSomeone (list, id, online = true) {
      let obj = {}

      if(!list) return
      list.forEach((value) => {
        if(value.cid === id) {
          obj = online ? {...value, online: '1'} : {...value, online: '0'}
        }
      })

      return obj
    },
    findGidbyMid (mid) {
      let memberObj = this.$store.getters.memberList
      let gid
      for (let key in memberObj) {
        for (let value of memberObj[key]) {
          if (mid === value.cid) gid = key
        }
      }

      return gid
    },
    nowGroup () { // 当前所在群组
      let userInfo = this.$store.getters.userInfo
      this.$store.commit(types.SetNowStatus, `当前所在群组${userInfo.pttGroup}`)
    },
    handleSomeoneOnline ({gid, mid, isOnline = true}) {
      let user = this.$store.getters.userInfo
      let memberObj = this.$store.getters.memberList
      let memberList = [...memberObj[gid]]

      let obj = this.getSomeone(memberList, mid, isOnline)
      let newMemberList = []
      if (mid === user.msId) { //置顶自己
        newMemberList.push(obj)
        newMemberList = newMemberList.concat(memberList)
        newMemberList = uniqueArr(newMemberList, 'cid') || []
      } else {// 前置刚上线的成员
        newMemberList.push(obj)
        if (isOnline) {// 有人上线
          let [frontMember, ...elseMember] = memberList
          gid === user.gId ? newMemberList.unshift(frontMember) : newMemberList.push(frontMember)
          newMemberList = newMemberList.concat(elseMember)
          newMemberList = uniqueArr(newMemberList, 'cid') || []
        } else { //有人xia线
          memberList.unshift(obj)
          newMemberList = uniqueArr(memberList, 'cid') || []
          let [frontMember, ...elseMember] = newMemberList
          elseMember.push(frontMember)
          newMemberList = elseMember
        }
      }
      this.$store.commit(types.SetMemberList, {item: newMemberList, gid})
      this.hasTempGroupHandleSomeoneOnline()
    },
    hasTempGroupHandleSomeoneOnline () { // 有临时群组时有人上线了
      let tempGroupInfo = this.$store.getters.tempGroupInfo
      if (tempGroupInfo) {
        let selectMembers = filterObjArrByKey(tempGroupInfo.cids, this.$store.getters.memberList, 'cid')
        selectMembers.unshift(this.$store.getters.myself)
        selectMembers = uniqueArr(selectMembers, 'cid') || []
        this.$store.commit(types.SetGroupTempList, upOnline(selectMembers))
      }
    },
    switchToOtherGroup ({prevGid, nowGid, type = 'myself', mid}) {
      return new Promise((resolve) => {
        let memberObj = this.$store.getters.memberList
        let newOriginGroupList = []
        let nowMemberList = [...memberObj[nowGid]]
        let oldMemberList = [...memberObj[prevGid]]
        let newMemberList = []
        
        if (type === 'myself') {
          newMemberList = this.myselfSwitchGroup({oldMemberList, nowMemberList, prevGid, nowGid})
          resolve(newMemberList)
        } else {
          this.otherSwitchGroup({oldMemberList, nowMemberList, prevGid, nowGid, mid})
        }
        newOriginGroupList = this.handleNumChange(prevGid, nowGid) // 处理在线人数和总人数       
        // 更新左侧树状群组
        this.$store.commit(types.SetOriginGroupsList, newOriginGroupList)
        let newTreeGroupList = getTrees(newOriginGroupList, newOriginGroupList[0].fid)
        this.$store.commit(types.SetTreeGroupList, newTreeGroupList) 
      })
    },
    myselfSwitchGroup ({oldMemberList, nowMemberList, prevGid, nowGid}) { // 自己切换群组
      let newMemberList = []
      let [myself, ...newOldMemberList] = oldMemberList
      newMemberList.push({...myself, online: '1'})
      newMemberList = newMemberList.concat(nowMemberList)
      newMemberList = upOnline(newMemberList)
      this.$store.commit(types.SetMemberList, {item: newOldMemberList, gid: prevGid})
      this.$store.commit(types.SetMemberList, {item: newMemberList, gid: nowGid})
      return newMemberList
    },
    otherSwitchGroup ({oldMemberList, nowMemberList, prevGid, nowGid, mid}) {
      // 当前的群组中是否包含切到的群组
      let newOldMemberList = []
      let memberObjArr = Object.keys(this.$store.getters.memberList)
      let hasSwitchedGroup = memberObjArr.some(item => {
        return item === nowGid
      })

      let someone = this.getSomeone(oldMemberList, mid, true)
      oldMemberList.unshift(someone)
      newOldMemberList = uniqueArr(oldMemberList, 'cid') || []
      if (newOldMemberList && newOldMemberList.length > 0) {
        newOldMemberList.shift()
        this.$store.commit(types.SetMemberList, {item: newOldMemberList, gid: prevGid})
      }
      if (hasSwitchedGroup) {
        let newMemberList = []
        let [myself, ...elseMember] = nowMemberList
        if (myself) newMemberList.push(myself)
        newMemberList.push(someone)
        newMemberList = newMemberList.concat(elseMember)
        this.$store.commit(types.SetMemberList, {item: newMemberList, gid: nowGid})
      }
    },
    handleNumChange (prevGid, nowGid) {
      let originGroupList = this.$store.getters.originGroupList
      let newOriginGroupList = []
      originGroupList.forEach(value => {
        let item = {...value}
          if (item.gid === nowGid) {
            item.all += 1
            item.onlineNum += 1
          } else if (item.gid === prevGid) {
            item.all -= 1
            if (item.onlineNum) {
              item.onlineNum -= 1
            } 
          }
        newOriginGroupList.push(item)
      })
      return newOriginGroupList
    }
  }
}
