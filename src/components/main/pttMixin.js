import * as app from '@/store/types/app'
import * as log from '@/store/types/log'
import { pttStart, isPtting, pttStop, getRecorder } from '@/libs/webDispatcher-sdk.js'
import language from '@/libs/language'
import {codeConfig, noticeCode}  from '@/libs/codeConfig'

export default {
  computed: {
    pttAble: {
      get () {
        return this.$store.state.app.pttAble
      },
      set (val) {
        this.$store.commit(app.SetPttAble, val)
      }
    },
    isRecording: {
      get () {
        return this.$store.state.app.isRecording
      },
      set (val) {
        this.$store.commit(app.SetRecording, val)
      }
    }
  },
  data () {
    return {
      isPtting: false,
      pptStartTime: 0,
      pptTriggerTime: 0,
      timer: null,
      duringTime: 200,
      isTiemout: false
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].main
  },
  mounted () {
    document.onkeydown = (ev) => {
      if (!this.$store.getters.isSettingShow) {
        if (ev.keyCode === this.$store.getters.settingItems.pttQuickKey.keyCode) {
          if (!this.isTiemout) { // 判断按下的时间是否超时, 没有超时
            console.log(this.isTiemout, this.pptStartTime, this.pptTriggerTime, this.pptTriggerTime - this.pptStartTime)
            this.handleStartPtt(ev)
            if (this.isRecording) { // 在录音时才进行时间判断
              if (!this.pptStartTime) this.pptStartTime = this.getTimeNow()
              this.pptTriggerTime = this.getTimeNow()
              if ((this.pptTriggerTime - this.pptStartTime) > 30000) { // 语音超时长~
                this.handleEndPtt()
                this.isTiemout = true
              }
            }
          }
        }
      }
    }
    document.onkeyup = (ev) => {
      this.handleEndPtt()
      this.isTiemout = false // 清除上一次的超时
    }
  },
  methods: {
    getTimeNow () {
      let now = new Date()
      return now.getTime()
    },
    handleStartPtt (ev) {
      if (!this.isRecording) {
        getRecorder().then(() => {
          this.calling()
        }).catch(() => {
          this.$store.commit(app.SetMicroTip, true)
          return false
        })
        // this.calling()
      }
    },
    calling () {
      console.log(777777)
      if (!isPtting()) {
        this.isRecording = true
        this.pttAble = true
        pttStart(res => {
          this.pttAble = false
          return false
        })
        let remark
        if (this.tempGroupInfo) {
          remark = this.tempGroupInfo.cids.map(item => {
            return this.allMembersObj[item].name
          })
          remark = `发送语音 To ${remark.join(',')}`
        } else {
          remark = `发送语音 To ${this.user.pttGroup}`
        }
        this.$store.commit(log.SaveLog, {
          account: this.user.msId,
          name: this.user.msName,
          type: codeConfig.startPttNotice,
          remark
        })
      } else {
        this.messageAlert('warning', this.languageCtx.callingBusy)
      }
    },
    handleEndPtt () {
      this.isRecording = false
      this.pptStartTime = 0
      this.pptTriggerTime = 0
      pttStop()
    }
  }
}
