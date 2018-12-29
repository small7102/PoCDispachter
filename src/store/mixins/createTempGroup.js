import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import * as map from '@/store/types/map'
import * as log from '@/store/types/log'
import mixin from './mixin'
import { debounce, getTreeList } from '@/utils/utils'
import Storage from '@/utils/localStorage'
import {codeConfig} from '../../libs/codeConfig'

const CREAT_TEMP_BY_MYSELF = 0
const HAS_SAME_GROUP = 3
const HAS_NO_MEMBER = 0
const SUCCESS_CREATE_TEMPGROUP = 2
const SUCCESS_CREATE_SINGLEGROUP = 1
const BUSYING = 4
const DONT_CALLING_SLEF = 5

export default {
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
    user () {
      return this.$store.getters.userInfo
    }
  },
  mixins: [mixin],
  data () {
    return {
      message: null
    }
  },
  created () {
    this.message = this.languageContext.message
    this.debounceAlert = debounce(this.messageNotice.bind(this), 300)
  },
  methods: {
    toCreatTempGroup ({
      tempInfo,
      creatType,
      cids
    }) {
      if (typeof tempInfo === 'object' && this.tempGroupInfo) { // 判断是否已经有了一样的临时群组
        if (this.tempGroupInfo.id === tempInfo.id && !this.singleCallActiveCid) {
          this.debounceAlert(HAS_SAME_GROUP) // 临时群组已存在
          return
        }
      }

      if (creatType === 'TEMP_GROUP' && !this.treeGroupSelectedList.length) {
        this.debounceAlert(HAS_NO_MEMBER) // 请选择临时群组成员
        return
      }

      if (this.singleCallActiveCid === this.user.msId || (this.treeGroupSelectedList.length === 1 && this.treeGroupSelectedList[0] === this.user.msId)) {
        this.$store.commit(app.SetAppLoading, false)
        this.treeGroupSelectedList = []
        this.singleCallActiveCid = ''
        this.debounceAlert(DONT_CALLING_SLEF) // 您不能与自己创建单呼
        return
      }

      this.addTempGroup({
        tempInfo,
        creatType,
        cids
      })
    },
    addTempGroup ({
      tempInfo,
      creatType,
      cids: Cids
    }) { // 创建临时群组
      this.$store.dispatch(types.CreatTempGroup, this.getCreateTempParam(Cids))
        .then((res) => {
          console.log(res)
          let remark = []
          this.locationGroup()
          // creatType !== 'SINGLE_TEMP_GROUP' ? this.messageNotice(SUCCESS_CREATE_TEMPGROUP) : this.messageNotice(SUCCESS_CREATE_SINGLEGROUP)
          this.getTempGroupInfo(res, creatType, tempInfo)
          this.tempGroupInfo.cids.forEach(item => {
            let name = this.allMembersObj[item]
            remark.push(name)
          })
          if (creatType !== 'SINGLE_TEMP_GROUP') {
            this.messageNotice(SUCCESS_CREATE_TEMPGROUP)
            remark = `与(${remark.toString()})创建临时群组`
          } else {
            this.messageNotice(SUCCESS_CREATE_SINGLEGROUP)
            remark = `与(${remark.toString()})创建单呼`
          }
          this.$store.commit(log.SaveLog, {account: this.user.msId, name: this.user.msName, type: 0, remark})
        })
        .catch((code) => {
          console.log(code)
          this.locationGroup()
          this.failureCreat()
          !this.tempGroupInfo && this.messageNotice(BUSYING)
        })
    },
    failureCreat () {
      this.nowGroup()
      this.singleCallActiveCid = ''
      this.treeGroupSelectedList = [] // 清楚选款的选择
    },
    handleClose () { // 关闭临时群组
      console.log(this.tempGroupInfo)
      if (this.tempGroupInfo) {
        this.$store.dispatch(types.RemoveTempGroup, this.tempGroupInfo.type).then(() => { // 解散群组指令
          this.$store.commit(app.SetAppLoading, false)
          let state = this.tempGroupInfo.type === CREAT_TEMP_BY_MYSELF ? this.tempGroupInfo.creatType === 'SINGLE_TEMP_GROUP' ? this.languageContext.brokenSingleCalling : this.languageContext.brokenTempGroup : this.languageContext.quitTempGroup
          this.messageAlert('success', state)
          this.nowGroup()
          this.$store.commit(types.SetGroupTempList, [])
          this.$store.commit(log.SaveLog, {account: this.user.msId, name: this.user.msName, type: codeConfig.cancelTempGroupNotice, remark: this.languageContext.breakTempGroup})
          this.mapTempMemberList = []
          this.singleCallActiveCid = ''
          this.tempGroupInfo = null
          this.hasMapTempGroup = false
        }).catch(() => {
          this.$store.commit(app.SetAppLoading, false)
        })
      }
    },
    saveRecentTempGroup (tempGroupInfo) {
      let myRecentTempInfo = {}
      myRecentTempInfo[this.user.msId] = tempGroupInfo
      // 临时群组存到本地
      Storage.localSet('myRecentTempInfo', myRecentTempInfo)
    },
    getCreateTempParam (cids, creatType) {
      let cidsString = typeof cids === 'string' ? cids : cids.join(',')
      let cidsLength = typeof cids === 'string' ? 1 : cids.length
      return { cids, cidsLength, cidsString, creatType }
    },
    locationGroup () {
      let openGroup = []
      let fid
      this.originGroupList.forEach(item => {
        if (item.gid === this.user.gId) {
          openGroup.push(item.gid)
          fid = item.fid
        }
      })
      getTreeList(this.originGroupList, fid, openGroup) // 得到展开群组的gid与它的父级gid组成的数组
      this.$store.commit(types.SetOpenGroup, openGroup)
      let treeScroll = document.getElementById('treeScroll')
      treeScroll.scrollTop = 0
    },
    messageNotice (res) {
      this.messageAlert(this.message[res].type, this.message[res].info)
    }
  }
}
