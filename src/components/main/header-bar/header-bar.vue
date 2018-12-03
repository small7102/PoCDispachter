<template>
  <div class="header-bar-wrap">
    <div class="top flex align-center between">
      <div class="left flex align-center">
        <img src="../../../assets/kirisun.png" alt="Poc语音调度系统" class="logo">
        <h1>PoC语音调度系统</h1>
      </div>
      <div class="right">
        <span class="quit" @click="quitLogin">[退出]</span>
        <Icon type="ios-settings-outline" size="20" class="setting" @click="openSettingModal"/>
      </div>
    </div>
    <div class="bottom flex align-center">
      <div class="item b-item">
        欢迎{{info}}登陆
      </div>
      <div class="item status flex-item">
        {{status}}
      </div>
      <div class="item b-item time-wrap">
        <span v-html="nowTime" class="time"></span>
        <span class="signal">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </span>
      </div>
    </div>
    <settings/>
  </div>
</template>

<script>
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import {dateFmt} from '@/utils/utils'
import Settings from '../settings'
import Storage from '@/utils/localStorage'

export default {
  name: 'HeaderBar',
  components: {Settings},
  computed: {
    info () {
      let userInfo = this.$store.getters.userInfo
      let info = `${userInfo.msName}[${userInfo.pttGroup}]`
      let state = `当前所在群组${userInfo.pttGroup}`
      this.$store.commit(types.SetNowStatus, state)
      return info
    },
    status () {
      let state = this.$store.getters.nowStatus
      return state
    }
  },
  data () {
    return {
      nowTime: ''
    }
  },
  mounted () {
    this.nowTime = dateFmt("yyyy/MM/dd hh:mm:ss", new Date())
    setInterval(() => {
      this.nowTime = dateFmt("yyyy/MM/dd hh:mm:ss", new Date())
    }, 1000)
  },
  methods: {
    quitLogin () {
      Storage.localRemove('token')
      window.location.reload()
    },
    openSettingModal () {
      this.$store.commit(app.SetSettingShow, true)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .top
    vertical-align middle
    height 40px
    padding 0 20px
    h1
      font-size $font-size-large-x
      color $color-theme-weight
      font-weight bold
      line-height 40px
      padding-left 10px
    .quit
      font-size 14px
      color #999
      padding-right 5px
      cursor pointer
    .setting
      cursor 
      &:hover
        opacity .9
  .bottom
    padding 0 20px
    height 40px
    line-height 40px
    overflow hidden
    background $color-theme-light
    color #0b247c
    .status
      text-align center
    .item
      font-size 18px
      color $color-theme-weight
    .b-item
      font-size 14px
      width 250px
      overflow hidden
      &.time-wrap
        width auto
      .time
        width 132px
      .signal
        display inline-block
        font-size 0
        margin-left 5px
        i
          display inline-block
          width 3px
          background $color-theme
          font-size 0
          height 15px
          margin-right 2px
          &:nth-child(1)
            height 3px
          &:nth-child(2)
            height 6px
          &:nth-child(3)
            height 9px
          &:nth-child(4)
            height 12px
</style>
