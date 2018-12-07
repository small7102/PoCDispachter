import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import * as map from '@/store/types/map'
import mixin from '@/store/mixins/mixin'
import { uniqueArr, debounce, filterObjArrByKey } from '@/utils/utils'
import {TempGroupInfo} from '@/libs/dom'
import Storage from '@/utils/localStorage'

const CREAT_TEMP_BY_MYSELF = 0

export default{
  computed: {
    hasMapTempGroup: {
      get () {
        return this.$store.getters.hasMapTempGroup
      },
      set (val) {
        this.$store.commit(map.SetHasMapTempGroup, val)
      }
    },
    mapTempMemberList: {
      get () {
        return this.$store.getters.mapTempMemberList
      },
      set (val) {
        this.$store.commit(map.SetMapTempMemberList, val)
      }
    },
    singleCallActiveCid: {
      get () {
        return this.$store.getters.singleCallActiveCid
      },
      set (val) {
        this.$store.commit(types.SetSingleCallActiveCid, val)
      }
    },
    treeGroupSelectedList: {
      get () {
        return this.$store.getters.treeGroupSelectedList
      },
      set (val) {
        this.$store.commit(types.SetTreeGroupSelectedList, val)
      }
    },
    tempGroupInfo: {
      get () {
        return this.$store.getters.tempGroupInfo
      },
      set (val) {
        this.$store.commit(types.SetTempGroupInfo, val)
      }
    },
    user () {
      return this.$store.getters.userInfo
    },
    nowStatus: {
      get () {
        return this.$store.getters.nowStatus
      },
      set (val) {
        this.$store.commit(types.SetNowStatus, val)
      }
    }
  },
  mixins: [mixin],
  created() {
    this.debounce = debounce(this.messageAlert.bind(this,'warning', '您不能与自己创建单呼'), 300)
  },
  methods: {
    toCreatTempGroup ({tempInfo, creatType}) {
      if (typeof tempInfo === 'object' && this.tempGroupInfo) { // 判断是否已经有了一样的临时群组
        if (this.tempGroupInfo.id === tempInfo.id) {
          const HAS_TEMPGROUP_TIP = 3
          this.messageNotice(HAS_TEMPGROUP_TIP)
          return
        }
      }
      this.addTempGroup({tempInfo, creatType})
    },
    addTempGroup ({tempInfo, creatType}) { // 创建临时群组
      if (this.singleCallActiveCid === this.user.msId || (this.treeGroupSelectedList.length === 1 && this.treeGroupSelectedList[0] === this.user.msId)) {
        this.$store.commit(app.SetAppLoading, false)
        this.treeGroupSelectedList = []
        this.singleCallActiveCid = ''
        this.debounce()
        return
      }

      this.$store.dispatch(types.CreatTempGroup, this.getCreateTempParam()).then(({code, cids, members}) => {
        this.$store.commit(app.SetAppLoading, false)
        this.messageNotice(code)
        this.successCreat(code, cids, members, tempInfo, creatType)
        this.failureCreat(code)
      })
    },
    successCreat (code, cids, members, info, creatType) {
      let state
      if (code === 2 || code === 1) { // 创建临时群组成功
        let onlineLength = members.filter(item => {return item.online === '1'}).length
        let tempGroupInfo = new TempGroupInfo({
          name: '无',
          type: CREAT_TEMP_BY_MYSELF, // type指谁创建的临时群组, creatType是在页面哪里创建的临时群组
          cids: cids,
          length: members.length,
          creater: this.user.msName,
          onlineLength
        })
        if (typeof info === 'object') {
          this.nowStatus = `${info.name}临时群组`
          tempGroupInfo.name = info.name
          tempGroupInfo.id = info.id
        } else {
          this.nowStatus = '临时群组'
        }
        
        if (code === 1) { // 创建单呼
          state = `与${members[1].name}单呼`
        }
        
        if (creatType === 'SINGLE_TEMP_GROUP') { // 成员页创建的单呼
          tempGroupInfo.creatType = 'SINGLE_TEMP_GROUP'
        } else if (creatType === 'TEMP_GROUP_MAP') {
          this.hasMapTempGroup = true
        }
        this.treeGroupSelectedList = []// 清楚选款的选择
        this.tempGroupInfo = tempGroupInfo
        this.saveRecentTempGroup(tempGroupInfo) // 存储最近一次的临时群组记录到本地
        this.$emit('on-success')
      }
    },
    failureCreat (code) {
      if (code === 4) {
        this.nowGroup()
        this.singleCallActiveCid = ''
        this.treeGroupSelectedList = []// 清楚选款的选择
      }
    },
    handleClose () { // 关闭临时群组
      if (this.tempGroupInfo) {
          this.$store.dispatch(types.RemoveTempGroup, this.tempGroupInfo.type).then(() => {//解散群组指令
            this.$store.commit(app.SetAppLoading, false)
            let state = this.tempGroupInfo.type === CREAT_TEMP_BY_MYSELF ? this.tempGroupInfo.creatType ? '单呼已取消' : '临时群组已取消' : '您已退出临时群组'
            this.messageAlert('success', state)
            this.nowGroup()
            this.$store.commit(types.SetGroupTempList, [])
            this.mapTempMemberList = []
            this.singleCallActiveCid = ''
            this.tempGroupInfo = null
            this.hasMapTempGroup = false
          })
      }
    },
    saveRecentTempGroup (tempGroupInfo) {
      Storage.localRemove('myRecentTempInfo')
      let myRecentTempInfo = {}
      myRecentTempInfo[this.user.msId] = tempGroupInfo
      // 临时群组存到本地
      Storage.localSet('myRecentTempInfo', myRecentTempInfo)
    },
    getCreateTempParam () {
      let list
      if (this.singleCallActiveCid && !this.treeGroupSelectedList.length && !this.mapTempMemberList.length) {
        list = this.singleCallActiveCid
      } else if (!this.mapTempMemberList.length) {
        list = this.treeGroupSelectedList
        this.singleCallActiveCid = ''
        this.mapTempMemberList = []
      } else {
        list = this.mapTempMemberList.map(item => {return item.cid})
      }

      if (list && list.length) {
        let listString = typeof list === 'string' ? list : list.join(',')
        let length = typeof list === 'string' ? 1 : list.length
        return {cids: list, cidsLength: length, cidsString: listString}
      } else {
        this.messageNotice(0)
        return
      }
    },
    messageNotice (res) {
      const message = {
          0: {
            type: 'error',
            info: '请选择临时群组成员'
          },
          1: {
            type: 'success',
            info: '单呼创建成功'
          },
          2: {
            type: 'success',
            info : '创建临时群组成功'
          },
          3: {
            type: 'error',
            info: '该临时群组已存在'
          },
          4: {
            type: 'warning',
            info: '对方正忙'
          }
        }
        this.messageAlert(message[res].type, message[res].info)
    }
  }
}