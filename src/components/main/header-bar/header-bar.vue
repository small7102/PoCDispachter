<template>
  <div class="header-bar-wrap">
    <div class="top flex align-center">
      <img src="../../../assets/kirisun.png" alt="Poc语音调度系统" class="logo">
      <span>PoC语音调度系统</span>
    </div>
    <div class="bottom flex align-center">
      <div class="item b-item">
        欢迎{{info}}登陆
      </div>
      <div class="item status flex-item">
        {{status}}
      </div>
      <div class="item b-item">
        时间/信号
      </div>
    </div>
  </div>
</template>

<script>
import * as types from '@/store/types/group'
export default {
  name: 'HeaderBar',
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
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .top
    vertical-align middle
    height 40px
    padding 0 20px
    span
      font-size $font-size-large-x
      color $color-theme-weight
      font-weight bold
      line-height 40px
      padding-left 10px
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
</style>
