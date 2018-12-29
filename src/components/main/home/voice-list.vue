<template>
  <div class="voice-wrap pr direction-column" ref="scroll">
      <div class="no-voice" v-if="!voiceList.length">
        {{languageCtx.voiceList.noData}}
      </div>
      <div>
        <voice-box
          v-for="(item, index) in voiceList"
          :class="{active: index === playingVoice}"
          :key="index"
          :sendTime="item.time"
          :name="item.name"
          :duringTime="getDuring(item.voice)"
          @on-play="playVoice(item, index)"
        />
      </div>
      <!-- <div class="btn-wrap pr">
        <Button size="small" class="more-btn" shape="circle"><span>{{languageCtx.voiceList.moreData}}</span></Button>
      </div> -->
  </div>
</template>

<script>
import VoiceItem from '@/components/base/voice-item'
import VoiceBox from '@/components/base/voice-item'
import * as app from '@/store/types/app'
import * as types from '@/store/types/group'
import {dateFmt} from '@/utils/utils'
import language from './mixin'

export default {
  name: 'VoiceList',
  mixins: [language],
  components: {VoiceItem, VoiceBox},
  computed: {
    voiceList () {
      let list = this.$store.getters.voiceList
      return list
    }
  },
  data () {
    return {
      playingVoice: '',
      playingVoiceTimeDuring: '',
      audioContext: null
    }
  },
  methods: {
    playVoice (item, index) {
      // this.stopPlayVoice(() => {
      //   if (this.playingVoice !== index) { // 点击播放语音
      //     this.startPlayVoice(item, index)
      //   } else { // 再次点击取消播放
      //     this.stopPlayVoice()
      //   }
      // })
      console.log(this.playingVoice)
      if (this.playingVoice !== index) {
        if (this.playingVoice !== null) {
          this.stopPlayVoice (() => {
            this.startPlayVoice(item, index)
          })
        } else {
          this.startPlayVoice(item, index)
        }
      } else {
        this.stopPlayVoice ()
      }
    },
    stopPlayVoice (callback) {
      this.playingVoice = ''
      if (!this.audioContext) {
        callback()
      } else {
        console.log('关闭语音')
        this.audioContext.close().then(() => {
          this.audioContext = null
          console.log('关闭了')
          if (callback) callback()
        })
      }
    },
    startPlayVoice (item, index) {
      this.playingVoice = index
      this.playingVoiceTimeDuring = (item.voice.byteLength / 320) * 20
      this.playWav(item.voice)
      setTimeout(() => {
        this.playingVoice = ''
      }, this.playingVoiceTimeDuring)
    },
    getDuring (voice) {
      let byteLength = voice.byteLength
      return parseFloat((((byteLength / 320) * 20) / 1000).toFixed(2))
    },
    playWav (data) {
        let AaudioContext = window.AudioContext || window.webkitAudioContext;
        let reader = new FileReader()
        let audioContext = this.audioContext = new AaudioContext()
        reader.readAsArrayBuffer(new Blob([data], {
            type: 'audio/wav'
        }));
        reader.onload = (e) => {
          this.audioContext.decodeAudioData(reader.result, (buffer) => {
            let audioBufferSouceNode = this.audioContext.createBufferSource()
            audioBufferSouceNode.buffer = buffer
            audioBufferSouceNode.connect(this.audioContext.destination)
            audioBufferSouceNode.start(0)
          }, function (e) {
            console.log("Failed to decode the file")
          })
        }
    },
    getTime (time) {
      dateFmt("yyyy-MM-dd hh:mm:ss", time)
    }
  },
  updated() {
    let pttGroup = this.$store.getters.userInfo.pttGroup
    this.$store.commit(types.SetNowStatus, `${this.languageCtx.voiceList.nowAt}${pttGroup}`)
  }
}
</script>

<style lang="stylus">
 @import '../../../assets/styles/variable';
.voice-wrap
  width 100%
  .item
    padding 0 10px
    margin-bottom 12px
  .no-voice
    text-align center
    line-height 60px
  .time-wrap
    text-align center
    margin-bottom 10px
  .time
    padding 2px 5px
    font-size 10px
    background #dadada
    color #ffffff
    text-align center
  .voice-name
    font-size 12px
    padding 0 15px 5px
  .btn-wrap
    height 40px
  .more-btn
    background $color-theme-btn
    position absolute
    bottom 5px
    left 50%
    transform translate(-50%)
    width 80px
    height 30px
    color #ffffff
</style>


