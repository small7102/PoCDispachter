<template>
  <div class="voice-box-wrap">
    <div class="voice-item flex align-center between" @click="playVoice">
      <div class="flex-item flex align-center">
        <time class="col">{{sendTime}}</time>
        <span class="col name">{{name}}</span>
        <span class="col">{{duringTime}}s</span>
      </div>
      <!-- <Icon type="ios-wifi" class="icon-voice" size="18"/> -->
      <div class="icon-voice-wrap">
        <div class="voice-icon">
          <Icon type="ios-wifi" class="icon-voice" size="16"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceBox',
  props: {
    sendTime: String,
    duringTime: Number,
    name: String
  },
  methods: {
    playVoice () {
      this.$emit('on-play')
    }
  }
}
</script>

<style lang="stylus" scoped>
 @import '../../../assets/styles/variable';
.voice-box-wrap
  padding 0 20px
  .voice-item
    padding 0 6px
    border-radius 6px
    height 30px
    background $color-theme-btn
    color #ffffff
    line-height 30px
    margin 10px auto 10px
    font-size 12px
    cursor pointer
    transition all .3s
    &:hover
      opacity .9
    .name
      max-width 60px
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
    .col
      margin-right 5px
    .icon-voice-wrap
      width 20px
      height 34px
      .voice-icon
        overflow hidden
      vertical-align middle
    .icon-voice
      transform rotate(90deg)

.active .voice-item
  background #888888
  .voice-icon
    animation voicePlaying 1.4s linear infinite

@keyframes voicePlaying
  from
    width: 6px
  33%
    width 6px
  33.333%
    width 9px
  66%
    width 9px
  66.666%
    width 15px
  99.999%
    width 15px
  to
    width: 6px
</style>
