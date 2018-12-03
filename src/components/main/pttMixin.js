import * as app from '@/store/types/app'
import {pttStart, isPtting, pttStop} from '@/libs/webDispatcher-sdk.js'

export default {
  data () {
    return {
      isPtting: false,
      pptStartTime: 0,
      pptTriggerTime: 0,
      timer: null,
      duringTime: 200
    }
  },
  mounted() {
    document.onkeydown = (ev) => {
      // console.log(this.$store.getters.settingItems.pttQuickKey, ev)
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
        if (this.pptStartTime === 0) this.pptStartTime = this.getTimeNow()
        this.pptTriggerTime = this.getTimeNow()

        if (ev.type !== 'mousedown') {
          if (this.pptTriggerTime - this.pptStartTime > this.duringTime) this.calling()
        } else {
          this.calling()
        }
    },
    calling() {
      if (!this.$store.getters.isRecording) {
        if (!isPtting()) {
          pttStart()
          this.$store.commit(app.SetRecording, true)
        } else {
          console.log('有人在通信...')
        }
      }
    },
    handleEndPtt () {
      if (this.isRecording) {
        pttStop()
        this.$store.commit(app.SetRecording, false)
        this.pptStartTime = 0
        this.pptTriggerTime = 0
      }
    }
  }
}