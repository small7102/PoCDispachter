<template>
  <div class="sider-bottom flex align-center">
    <button class="calling flex-item" @mousedown="handleStartPtt" @mouseup="handleEndPtt">PTT[{{settingItems.pttQuickKey.key}}]</button>
  </div>
</template>

<script>
import pttMixin from '../pttMixin'
export default {
  name: 'Ptt',
  mixins: [pttMixin],
  computed: {
    settingItems () {
      return this.$store.state.app.settingItems
    },
    user () {
      return this.$store.state.user.userInfo
    }
  },
  data () {
    return {
      quickKey: 'Space'
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/variable.styl'

.sider-bottom
  position absolute
  bottom 0
  left 0
  width 100%
  cursor pointer
  .b-handle
    width 60px
    height 60px
    background $color-theme-weight
    border 1px solid $color-theme-weight
    border-right 1px solid $color-theme-weight-d
    text-align center
    line-height 60px
  .content
    color #33333
  .calling
    background $color-theme-weight
    border 1px solid $color-theme-weight
    height 50px
    color #ffffff
    cursor pointer
    &:active
      opacity .8
</style>
