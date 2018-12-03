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
    <toast iconType="ios-mic" v-if="isRecording" @on-cancel="handleEndPtt">
      <div class="decorate voiceSignal" slot="decorateIcon">
        <div class="line "></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <div class="describle-text" slot="describle">
        长按按键语音，松开语音取消
      </div>
    </toast>
    <small-loading v-if="isAppLoading"/>
  </div>
</template>

<script>
import HeaderBar from './header-bar'
import GroupTree from './group-tree'
import Tabs from './tabs'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import * as user from '@/store/types/user'
import Toast from '@/components/base/toast'
import {receiveNotice, queryTempGroup, webSocket, receiveVoice, saveVoice, receiveSMS, receiveGPS} from '@/libs/webDispatcher-sdk.js'
import codeConfig  from '@/libs/codeConfig'
import mixin from '@/store/mixins/mixin'
import pttMixin from './pttMixin'
import Loading from '@/components/base/loading'
import SmallLoading from '@/components/base/small-loading'
import {filterObjArrByKey, deepClone, dateFmt, throttle} from '@/utils/utils'
import Storage from '@/utils/localStorage'
import Ptt from './ptt'
import language from '@/libs/language'
import {Member, TempGroupInfo, Message} from '@/libs/dom'
import SearchGroup from './search-group'

const SOMEONE_ELSE = 1
const MYSELF = 0

export default {
  name: 'Main',
  mixins: [mixin, pttMixin],
  computed: {
    memberlistGetOver () {
      return this.$store.getters.memberlistGetOver
    },
    isAppLoading () {
      return this.$store.getters.isAppLoading
    },
    isRecording () {
      return this.$store.getters.isRecording
    },
    isRefreshPage () {
      console.log(this.$store.getters.isRefreshPage)
      return this.$store.getters.isRefreshPage
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
      isResizeable: true
    }
  },
  created() {
    this.languageType = this.$store.getters.language
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.$store.dispatch(types.GetTreeGroupsList).then(() => {
        receiveVoice(res => {
          this.receiveVoiceCallback(res)
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
          console.log(res)
        })

        this.storeMyself()
        this.initRightTempGroupList()
        this.$store.commit(app.SetAppLoading, false)
        this.$store.commit(app.SetReFreshPage, false)
      })
      this.$store.dispatch(types.GetTempGroupInfo, '临时群组')
    },
    storeMyself () { // 存储自己的信息
      let user = this.$store.getters.userInfo
      let memberObj = this.$store.getters.memberList
      let myself = this.getSomeone(memberObj[user.gId], user.msId)
      this.$store.commit(types.SetMyself, myself)
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
          obj.name = this.$store.getters.userInfo.msName
        }
        this.storageVoice(obj)
      }
    },
    receiveVoiceCallback (res) {
      if (res) {
        this.$store.commit(types.SetNowStatus, `${res} ${language[this.languageType].main.calling}`)
        this.saveVoiceType = 'SOMEONE_ELSE'
        this.callingUser = res
      }
    },
    receiveSMSCallback (res) {
      if (res) {
        let messageList = [...this.$store.getters.messageList]
        let {time, mName, msg} = res
        time = time.substr(6)
        let message = new Message({
          time,
          msName: this.$store.getters.userInfo.msName,
          others: mName,
          msg,
          arrow: '<<',
          list: messageList
        })
        message.addMessage()
        this.$store.commit(types.SetMessageList, messageList)
      }
    },
    noticeCallback (res) {
      if (res) {
        console.log('我是通知',res)
        let gid = this.findGidbyMid(res.mid)
        let name = this.getSomeoneName(gid, res.mid)
        let settingItems = this.$store.getters.settingItems
        switch (res.type) {
          case codeConfig.onlineNotice: // 上线通知
            this.handleSomeoneOnline({gid, mid: res.mid})
            if (settingItems.isReceiveOnlineNotice){
              this.noticeAlert('info', `${name}${language[this.languageType].main.onlineNotice}`)
            }
            break
          case codeConfig.offlineNotice: // 下线通知
            this.handleSomeoneOnline({gid, mid: res.mid, isOnline: false})
            if (settingItems.isReceiveOnlineNotice){
              this.noticeAlert('info', `${name}${language[this.languageType].main.outlineNotice}`)
            }
            break
          case codeConfig.switchNotice: // 切换群组通知      
            this.switchToOtherGroup({prevGid: gid, nowGid: res.gid, type: 'someone-else', mid: res.mid})
            if (settingItems.isReceiveSwitchGroupNotice){
              this.noticeAlert('info', `${name}${language[this.languageType].main.switchGroupNotice}`)
            }
            break
          case codeConfig.repeatLoginNotice: // 重复登录
            this.messageAlert('warning', `${language[this.languageType].main.repeatLoginNotice}`)
            window.location.reload()
            break
          case codeConfig.creatTempGroupNotice: // 创建临时群组
            this.$store.dispatch(types.GetTempGroupInfo, '临时群组')
            break
          case codeConfig.cancelTempGroupNotice: // 取消临时群组
            this.$store.commit(types.SetSingleCallActiveCid, '')
            this.$store.commit(types.SetGroupTempList, [])
            if (settingItems.isReceiveCancelGroupNotice){
              this.noticeAlert('info', `${name}${language[this.languageType].main.cancelTempGroupNotice}`)
            }
            this.$store.commit(types.SetTempGroupInfo, null)
            this.nowGroup()
            break
          case codeConfig.quitTempGroupNotice: // 退出临时群组
            this.quitTempGroup(res, name, settingItems)
            break
          default:
            break
        }
      }
    },
    getSomeoneName (gid, mid) {
      let memberObj = this.$store.getters.memberList
      let someone = this.getSomeone(memberObj[gid], mid)

      let name = someone ? someone.name : ''
      return name
    },
    storageVoice (voice) {
      this.voiceList = [...this.$store.getters.voiceList]
      this.voiceList.unshift(voice)
      this.$store.commit(app.SetVoiceList, this.voiceList)
    },
    initRightTempGroupList () {
      let user = this.$store.getters.userInfo.msId
      if (this.hasLocalItems('myTempInfo')) {
        this.$store.commit(types.SetTempGroupList, Storage.localGet('myTempInfo')[user])
      }
    },
    hasLocalItems (item) {
      let user = this.$store.getters.userInfo.msId
      
      if (Storage.localGet(item) && Storage.localGet(item)[user]) {
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
    quitTempGroup (res, name, settingItems) {
      this.$store.commit(types.SetSingleCallActiveCid, '')
      let tempList = this.$store.getters.groupTempList
      tempList.forEach((temp, index) => {
        if (temp.cid === res.mid) {
          let newTempList = [...tempList]
          newTempList.splice(index, 1)
          this.$store.commit(types.SetGroupTempList, newTempList)
          if (settingItems.isReceiveQuitGroupNotice) {
            this.noticeAlert('info', `${name}${language[this.languageType].main.quitTempGroupNotice}`)
          }

          let tempGroupInfo = {...this.$store.getters.tempGroupInfo}
          tempGroupInfo.length -= 1

          if (tempGroupInfo.length === 1) {
            this.$store.commit(types.SetTempGroupInfo, null)
            this.$store.commit(types.SetGroupTempList, [])
          } else {
            tempGroupInfo.onlineLength = newTempList.filter(item => {return item.online === '1'}).length
            this.$store.commit(types.SetTempGroupInfo, tempGroupInfo)
          }
        }
      })
    },
    throttleResize () {
      if (document.body.clientWidth < 1200 || document.body.clientHeight < 600) this.isResizeable = false
    },
  },
  watch: {
    isAppLoading (val) {
      let timer
      if (val) {
        document.disabled = 'disabled'
        timer = setTimeout(() => {
          this.$store.commit(app.SetAppLoading, false)
        }, 8000)
      } else {
        clearTimeout(timer)
        document.disabled = false
      }
    },
    isRefreshPage (newVal, oldVal) {
      console.log(newVal, oldVal)
      if (newVal && !oldVal) {
        this.initData()
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
        padding 8px 12px
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
