import * as app from '@/store/types/app'
import * as log from '@/store/types/log'
import { pttStart, isPtting, pttStop, getRecorder } from '@/libs/webDispatcher-sdk.js'
import language from '@/libs/language'

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
      duringTime: 200
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].main
  },
  mounted () {
    document.onkeydown = (ev) => {
      if (!this.$store.getters.isSettingShow) {
        if (ev.keyCode === this.$store.getters.settingItems.pttQuickKey.keyCode) this.handleStartPtt(ev)
      }
    }
    document.onkeyup = (ev) => {
      this.handleEndPtt()
    }
  },
  methods: {
    getTimeNow () {
      let now = new Date()
      return now.getTime()
    },
    handleStartPtt (ev) {
      if (!this.isRecording) {
        // getRecorder().then(() => {
        //   this.calling()
        // }).catch(() => {
        //   this.$store.commit(app.SetMicroTip, true)
        //   return false
        // })
        this.calling()
      }
    },
    calling () {
      if (!isPtting()) {
        this.isRecording = true
        this.pttAble = true
        pttStart(res => {
          this.pttAble = false
          return false
        })
        this.$store.commit(log.SaveLog, {
          account: this.user.msId,
          name: this.user.msName,
          type: codeConfig.GPSNotice,
          remark: `(${this.languageCtx.lat}:${lat};${this.languageCtx.lng}:${lng})`
        })
      } else {
        this.messageAlert('warning', this.languageCtx.callingBusy)
      }
    },
    handleEndPtt () {
      this.isRecording = false
      pttStop()
    }
  }
}
