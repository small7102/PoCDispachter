<template>
  <div>
    <slot name="time"></slot>
    <div class="item-wrap flex" :class="getClass('item')">
      <Avatar :class="getClass('avatar')" icon="ios-person" shape="square"/>
      <div class="flex-item">
        <slot name="name"></slot>
        <div class="voice-box-wrap flex" :class="getClass('voice-box')">
          <div class="voice-box pr" :class="getClass('voice')"  @click="playVoice" :style="getVoiceBoxWidth">
            <div class="icon-voice-wrap" :class="getClass('icon-wrap')">
              <Icon type="ios-wifi" class="icon-voice" size="18" :class="getClass('icon')"/>
            </div>
            <div class="ivu-poptip-arrow"></div>
          </div>
          <span class="timelong">{{during}}''</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceItem',
  props: {
    isMyself: {
      type: Boolean,
      default: true
    },
    during: Number
  },
  computed: {
    getVoiceBoxWidth() {
      let width = 0
      if (this.during < 1) {
        width = 40
      } else if (this.during >=1 && this.during < 2) {
        width = 60
      } else if(this.during >= 2 && this.during < 3){
        width = 80
      } else if (this.during >= 3 && this.during < 5){
        width = 95
      } else {
        width = 100
      }
      return {
        width: `${width}px`
      }
    }
  },
  methods: {
    getClass (name) {
      return this.isMyself ? `${name}-myself` : `${name}-other`
    },
    playVoice () {
      this.$emit('on-play')
    }
  }
}
</script>

<style lang="stylus" scoped>
  .item-myself, .voice-box-myself
    flex-direction row-reverse
  
  .avatar-myself
    background lightblue
  .avatar-other
    background lightpink
  
  .voice-box-wrap
    padding 0 15px
    align-items center
  .voice-box
    padding 0 10px
    border 1px solid #ddd
    display inline-block
    height 36px
    border-radius 6px
    width 100px
    line-height 34px
    cursor pointer
    .ivu-poptip-arrow
      top 8px
    .icon-voice-wrap
      width 20px
      height 34px
      border-radius 50%
      overflow hidden
    .icon-voice
      transform rotate(90deg)
  .timelong
    font-size 10px
    padding 0 4px
    color #bbbbbb
  .voice-myself
    background rgb(73, 144, 215)
    &:hover
      opacity .8
      transition all .3s
    .ivu-poptip-arrow
      right -7px
      border-width 7px 0 7px 7px
      border-left-color hsla(0,0%,85%,.5)
      &::after
        content: " "
        right 1px
        bottom -7px
        border-right-width 0
        border-left-width 7px
        border-left-color rgb(73, 144, 215)
  .voice-other
    background #ffffff
    .ivu-poptip-arrow
      left -7px
      border-width 7px 7px 7px 0
      border-right-color hsla(0,0%,85%,.9)
      &::after
        content: " "
        left 1px
        bottom -7px
        border-left-width 0
        border-right-width 7px
        border-right-color #fff
    &:hover
      background #f5f5f5
      transition all .3s
      .ivu-poptip-arrow
        &::after
          border-right-color #f5f5f5
  .icon-myself
    color rgba(255, 255, 255, .6)
  .icon-other
    color #bbbbbb
  .icon-wrap-myself
    float right
    transform rotate(180deg)

.active .voice-box-wrap .voice-box .icon-voice-wrap
  animation voicePlaying 1.4s linear infinite

@keyframes voicePlaying
  from
    width: 6px
  33%
    width 6px
  33.333%
    width 10px
  66%
    width 10px
  66.666%
    width 15px
  99.999%
    width 15px
  to
    width: 6px
</style>
