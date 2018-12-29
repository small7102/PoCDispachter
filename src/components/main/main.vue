<template>
  <div class="main-wrap h100">
    <Layout class="main h100">
      <!-- 顶部 -->
      <Header class="i-header">
        <header-bar />
      </Header>

      <Layout class="flex-item">
        <!-- 侧边 -->
        <Sider :width='270' hide-trigger class="left-side h100">
          <Layout class="h100" :style="{background: '#fff'}">
            <Header class="tab-header">
              <tabs></tabs>
              <search-group/>
            </Header>
            <Content class="flex-item group-wrap scroll-bar">
              <!-- <side-group></side-group> -->
              <group-tree></group-tree>
            </Content>
            <ptt/>
          </Layout>
        </Sider>
        <Content>
          <!-- 路由切换区域 -->
            <keep-alive>
              <router-view/>
            </keep-alive>
        </Content>
      </Layout>
    </Layout>
  
  <div v-if="isRecording">
    <toast iconType="ios-mic" @on-cancel="handleEndPtt" v-if="pttAble">
      <div class="decorate voiceSignal" slot="decorateIcon">
        <div class="line "></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <div class="describle-text" slot="describle">
        {{languageCtx.tip}}
      </div>
    </toast>
    <toast iconType="ios-mic-off" @on-cancel="handleEndPtt" v-else>
      <div class="describle-text" slot="describle">
        禁止呼叫
      </div>
    </toast>
  </div>
    <small-loading v-if="isAppLoading"/>
    <Modal 
      v-model="microTip"
      :mask-closable="false"
      :closable="false"
      width="400"
    >
        <p slot="header">
            <Icon type="ios-information-circle" color="#f60" size="22"></Icon>
            <span class="modal-title">{{languageCtx.modal.title}}</span>
        </p>
        <p class="f-black">{{languageCtx.modal.desc}}</p>
        <div slot="footer">
            <Button type="primary" size="large" @click.stop="microTip=false">{{languageCtx.modal.okBtnText}}</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
import HeaderBar from './header-bar'
import GroupTree from './group-tree'
import Tabs from './tabs'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import * as user from '@/store/types/user'
import * as map from '@/store/types/map'
import * as log from '@/store/types/log'
import Toast from '@/components/base/toast'
import {receiveNotice, queryTempGroup, webSocket, receiveVoice, saveVoice, receiveSMS, receiveGPS, hasRightOfMicro, getRecorder} from '@/libs/webDispatcher-sdk.js'
import {codeConfig, noticeCode}  from '@/libs/codeConfig'
import mixin from '@/store/mixins/mixin'
import pttMixin from './pttMixin'
import Loading from '@/components/base/loading'
import SmallLoading from '@/components/base/small-loading'
import {filterObjArrByKey, deepClone, dateFmt, throttle, uniqueArr, upOnline} from '@/utils/utils'
import Storage from '@/utils/localStorage'
import Ptt from './ptt'
import {Member, TempGroupInfo, Message} from '@/libs/dom'
import SearchGroup from './search-group'
// import {gcj02towgs84, wgs84togcj02} from '@/utils/coordinate'
const coordtransform = require('coordtransform')

const SOMEONE_ELSE = 1
const MYSELF = 0
const DEVICE_MAX_OFFSET = 0.0001

export default {
  name: 'Main',
  mixins: [mixin, pttMixin],
  computed: {
    isAppLoading () {
      return this.$store.getters.isAppLoading
    },
    messageList: {
      get () {
        return this.$store.getters.messageList
      },
      set (val) {
        this.$store.commit(types.SetMessageList, val)
      }
    },
    microTip: {
      get () {
        return this.$store.getters.microTip
      },
      set (val) {
        this.$store.commit(app.SetMicroTip, val)
      }
    },
    gpsLogData: {
      get () {
        return this.$store.state.log.gpsLogData
      },
      set (val) {
        this.$store.commit(log.SetGpsLogData, val)
      }
    }
  },
  components: {
    HeaderBar,
    GroupTree,
    Tabs,
    Toast,
    Loading,
    SmallLoading,
    Ptt,
    SearchGroup
  },
  data () {
    return {
      saveVoiceType: MYSELF,
      lastTime: 0,
      callingUser: '',
      isResizeable: true,
      loadingTimer: null,
      languageCtx: null,
      isCalling: false
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.$store.dispatch(types.GetTreeGroupsList)
      .then(() => {
        this.getAllGroupsObj()
        this.getAllMembersObj()
      })
      .then(() => {
        getRecorder().then(() => {
        }).catch((res) => {
          this.microTip = true
        })
        receiveVoice(res => {
          this.isCalling = true
          if (this.isCalling) {
            this.receiveVoiceCallback(res)
          }
        })
        receiveNotice(res => {
          this.noticeCallback(res)
        })
        saveVoice(res => {
          this.saveVoiceCallback(res)
        })
        receiveSMS(res => {
          this.receiveSMSCallback(res)
        })
        receiveGPS(res => {
          this.receiveGPSCallback(res)
        })
        this.initRightTempGroupList()
        this.dispatchGetTempGroupInfo()
        this.$store.commit(app.SetAppLoading, false)
      })
    },
    dispatchGetTempGroupInfo () {
      this.$store.dispatch(types.GetTempGroupInfo).then((res) => {
        this.getTempGroupInfo(res)
      })
    },
    saveVoiceCallback (res) {
      if (res && res.voice) {
        if (parseFloat((((res.voice.byteLength / 320) * 20) / 1000).toFixed(2)) < 0.5) return
        let obj = {...res}
        obj.type = this.saveVoiceType
        obj.time = dateFmt("hh:mm:ss", new Date())
        if (this.saveVoiceType === 'SOMEONE_ELSE') {
          obj.name = this.callingUser
          this.saveVoiceType = 'MYSELF'
        } else {
          obj.name = this.user.msName
        }
        this.storageVoice(obj)
      }
    },
    receiveVoiceCallback (res) {
      if (res) {
        this.$store.commit(types.SetNowStatus, `${res} ${this.languageCtx.calling}`)
        this.saveVoiceType = 'SOMEONE_ELSE'
        this.callingUser = res
        this.isCalling = false
      }
    },
    receiveSMSCallback (res) {
      if (res) {
        let messageList = [...this.messageList]
        let {mid, time, mName, msg} = res
        time = dateFmt("hh:mm:ss", new Date())
        let message = new Message({
          time,
          msName: this.user.msName,
          others: mName,
          msg,
          arrow: '<<',
          list: messageList
        })
        message.addMessage()
        this.messageList = messageList

        this.$store.commit(log.SaveLog, {
          account: mid,
          name: mName,
          type: codeConfig.messageNotice,
          remark: `短信内容: (${msg})`
        })
      }
    },
    noticeCallback (res) {
      if (res) {
        console.log(res)
        let gid = this.allMembersObj[res.mid].grp
        let name = this.allMembersObj[res.mid].name
        this.$store.commit(log.SaveLog, {account: res.mid, name, type: res.type, remark: this.getRemark(res)})
        this.isReciveNotice(res, name)
        switch (res.type) {
          case codeConfig.onlineNotice: // 上线通知
            this.handleSomeoneOnline({gid, mid: res.mid, online: '1'})
            break
          case codeConfig.offlineNotice: // 下线通知
            this.handleSomeoneOnline({gid, mid: res.mid, online: '0'})
            this.handleGPSOffline(res.mid)
            break
          case codeConfig.switchNotice: // 切换群组通知      
            this.switchToOtherGroup({prevGid: gid, nowGid: res.gid, type: 'someone-else', mid: res.mid, res})
            break
          case codeConfig.repeatLoginNotice: // 重复登录
            webSocket.close()
            this.$router.replace({name: 'login'})
            break
          case codeConfig.creatTempGroupNotice: // 创建临时群组
            this.dispatchGetTempGroupInfo()
            break
          case codeConfig.cancelTempGroupNotice: // 取消临时群组
            this.handleCancelTempGroup()
            break
          case codeConfig.quitTempGroupNotice: // 退出临时群组
            this.quitTempGroup(res, name)
            break
          case codeConfig.callsetNotice: //通话设置
            // this.handleCallseted(res, name)
            break
          default:
            break
        }
      }
    },
    isReciveNotice (res, name) {
      let notices = this.$store.getters.settingItems.openNotice
      if (res.type=== codeConfig.repeatLoginNotice) {
        this.messageAlert('warning', `${this.languageCtx.repeatLoginNotice}`)
        return
      }
      
      if (notices && Array.isArray(notices)) {
        notices.forEach(notice => {
          if (notice.key === noticeCode[res.type] && notice.val) {
            console.log(notice.key)
            if (res.type === codeConfig.callsetNotice) {
              this.noticeAlert('info', `${name}${this.languageCtx.message[res.type][res.mName]}`)
            } else {
              this.noticeAlert('info', `${name}${this.languageCtx.message[res.type]}`)
            }
          }
        })
      }
    },
    receiveGPSCallback (res) {
      console.log(res)
      if (res) {
      let {lat, lng, mid} = res
      let gpsLatLng = coordtransform.wgs84togcj02(lng, lat)
      let name = this.allMembersObj[mid].name
      let GPSList = [...this.$store.getters.GPSList]
      res = {...res, lat: gpsLatLng[1],lng: gpsLatLng[0]}
      this.$store.commit(map.SetGpsPoint, res)
      this.saveAlarmNotice(res, name)
      if (this.gpsLogData && this.gpsLogData.length !== 0) {
        setTimeout(() => {
          // GPSList.unshift(res)
          // GPSList = uniqueArr(GPSList, 'mid')
          this.$store.commit(map.SetGPSList, GPSList)
          this.$store.commit(log.SaveLog, {
            account: mid,
            name,
            type: codeConfig.GPSNotice,
            remark: `(${this.languageCtx.lat}:${lat};${this.languageCtx.lng}:${lng})`
          })
        }, 5000)
        if (this.gpsLogData.length > 300) {
          let list = [...this.gpsLogData]
          list.pop()
          this.gpsLogData = list
        }
      } else {
        // GPSList.unshift(res)
        // this.$store.commit(map.SetGPSList, GPSList)
        this.$store.commit(log.SaveLog, {
          account: mid,
          name,
          type: codeConfig.GPSNotice,
          remark: `(${this.languageCtx.lat}:${lat};${this.languageCtx.lng}:${lng})`
        })
      }
      // res = {...res, lat: gpsLatLng[1],lng: gpsLatLng[0]}
      //   let itemIndex
      //   let GPSList = [...this.$store.getters.GPSList]
      //   let hasItem = GPSList.some((item, index) => {
      //     return res.mid === item.mid && Math.abs(res.lat - item.lat) < DEVICE_MAX_OFFSET && Math.abs(res.lng - item.lng) < DEVICE_MAX_OFFSET
      //   })

      //   if (!hasItem) {
      //     GPSList.unshift(res)
      //     GPSList = uniqueArr(GPSList, 'mid')
      //     this.$store.commit(map.SetGPSList, GPSList)
      //   }
      }
    },
    saveAlarmNotice (gps, name) {
      if (gps.alarm) {
        for (let key in gps.alarm) {
          if (gps.alarm[key] === 1) {
            this.$store.commit(log.SaveLog, {
              account: gps.mid,
              name,
              type: codeConfig.alarmNotice,
              remark: `(${this.languageCtx.lat}:${gps.lat};${this.languageCtx.lng}:${gps.lng})紧急报警`
            })
          }
        }
      }
    },
    handleCancelTempGroup () {
      this.$store.commit(map.SetMapTempMemberList, [])
      this.$store.commit(types.SetSingleCallActiveCid, '')
      this.$store.commit(map.SetHasMapTempGroup, false)
      this.groupTempList = []
      this.tempGroupInfo = null
      this.nowGroup()
    },
    handleGPSOffline (mid) {
      let GPSList = [...this.$store.getters.GPSList]
      GPSList = GPSList.filter(item => {
        return item.mid !== mid
      })
      this.$store.commit(map.SetGPSList, GPSList)
    },
    storageVoice (voice) {
      this.voiceList = [...this.$store.getters.voiceList]
      this.voiceList.unshift(voice)
      this.$store.commit(app.SetVoiceList, this.voiceList)
    },
    initRightTempGroupList () {
      if (this.hasLocalItems('myTempInfo')) {
        this.tempGroupList = Storage.localGet('myTempInfo')[this.user.msId]
      }
    },
    hasLocalItems (item) {   
      if (Storage.localGet(item) && Storage.localGet(item)[this.user.msId]) {
        return true
      } else {
        return false
      }
    },
    getSendVoiceTime () {
      let sendTime
      let list = this.$store.getters.voiceList

      if (new Date().getTime() - this.lastTime > 36000 || !list.length) {
        sendTime = dateFmt("hh:mm:ss", new Date())
        this.lastTime = new Date().getTime()
      }
      return sendTime
    },
    quitTempGroup (res) {
      this.$store.commit(types.SetSingleCallActiveCid, '')
      this.groupTempList.forEach((temp, index) => {
        if (temp.cid === res.mid) {
          let newTempList = [...this.groupTempList]
          newTempList.splice(index, 1)
          this.groupTempList = newTempList
          this.$store.commit(map.SetMapTempMemberList, newTempList)

          let tempGroupInfo = {...this.tempGroupInfo}
          tempGroupInfo.length -= 1

          tempGroupInfo.onlineLength = newTempList.filter(item => {return item.online === '1'}).length
          this.tempGroupInfo = tempGroupInfo

        }
      })
    },
    getRemark (res) {
      let remark
      if (res.type === 8) {
        remark = `To ${res.gName}`
      } else if (res.type === 9) {
        remark = `${this.getDescStatus(res.setType)}`
      } else {
        remark = `${this.languageCtx.message[res.type]}`
      }
      return remark
    },
    getDescStatus (callset) {
     return this.languageCtx.message[codeConfig][callset] 
    },
    throttleResize () {
      if (document.body.clientWidth < 1200 || document.body.clientHeight < 600) this.isResizeable = false
    },
  },
  watch: {
    isAppLoading (val) {
      if (val) {
        document.disabled = 'disabled'
        this.loadingTimer = setTimeout(() => {
          this.$store.commit(app.SetAppLoading, false)
          // this.$router.replace({name: 'login'})
          // window.location.reload()
        }, 8000)
      } else {
        clearTimeout(this.loadingTimer)
        document.disabled = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../assets/styles/variable.styl'

  .main-wrap
    overflow hidden
    .i-header
      background: #fff
      boxShadow: 0 2px 3px 2px rgba(0,0,0,.02)
      padding: 0
      height: 80px
      marginBottom: 5px
    .left-side
      position relative
      padding-bottom 60px
      background #ffffff
      .tab-header
        height auto
        padding 0
        background $color-theme-weight
      .search-wrap
        padding 8px 12px 20px
        line-height 34px !important
      .group-wrap
        height 100%
        overflow hidden
  .describle-text
    color #ffffff
    text-align center
    padding 30px 0
  .decorate
    width 50px
    padding-top 50px
    .line
      height 4px
      background #ffffff
      width 30px
      margin 10px
      &:nth-child(2)
        width 20px
      &:nth-child(3)
        width 10px
</style>
