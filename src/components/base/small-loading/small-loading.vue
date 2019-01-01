<template>
  <div class="loading-wrap flex align-center justify-center" :style="bgStyle">
    <div class="loading">
      <div class="rect1"></div>
      <div class="rect2"></div>
      <div class="rect3"></div>
      <div class="rect4"></div>
      <div class="rect5"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmallLoading',
  computed: {
    bgStyle () {
      let allMembersObj = this.$store.state.group.allMembersObj
      if (!allMembersObj) {
        return {
          background: 'rgba(255, 255, 255, .9)'
        }
      }
    }
  }
}
</script>

<style lang="stylus">
@import '../../../assets/styles/variable.styl';
.loading-wrap
  position fixed
  width 100%
  bottom 0
  top 0
  z-index 9999
.loading
  width 140px
  padding 30px
  border-radius  10px
  background rgba(255, 255, 255, .8)
  text-align center
  div
    background-color $color-theme-weight
    height 40px
    width 5px
    border-radius 2px
    display inline-block
    animation stretchdelay 1.2s infinite ease-in-out
  .rect2
    animation-delay -1.1s
  .rect3
    animation-delay -1s
  .rect4
    animation-delay -0.9s
  .rect5
    animation-delay -0.8s
.fade-in-active
  transition all 0.3s ease
.fade-out-active
  transition all 0
.fade-in-enter, .fade-out-active
  opacity 0

@keyframes stretchdelay
  0%, 40%, 100%
    transform scaleY(0.4)
    -webkit-transform scaleY(0.4)
  20%
    transform scaleY(1.0)
    -webkit-transform scaleY(1.0)
</style>

