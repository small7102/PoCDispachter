<template>
  <transition name="fade">
    <div class="toast-wrap" @mouseup="handleMouseUp">
      <div class="toast flex direction-column" :style="{width: width, height: height, borderRadius: borderRadius}">
        <div class="top flex justify-center flex-item align-center">
          <Icon :type="iconType" :size="iconSize" :color="color"></Icon>
          <slot name="micIcon"></slot>
          <slot name="decorateIcon"></slot>
        </div>
        <slot name="describle"></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    width: {
      type: String,
      default: '300px'
    },
    height: {
      type: String,
      default: '300px'
    },
    borderRadius: {
      type: String,
      default: '12px'
    },
    iconType: String,
    iconSize: {
      type: Number,
      default: 100
    },
    color: {
      type: String,
      default: '#ffffff'
    }
  },
  methods: {
    handleMouseUp () {
      this.$emit('on-cancel')
    }
  }
}
</script>

<style lang="stylus" scoped>
.toast-wrap
  position fixed
  top 0
  bottom 0
  width 100%
  z-index 10
  display flex
  align-items center
  justify-content center
  background rgba(255, 255, 255, .3)
  .toast
    background rgba(0, 0, 0, .6)
    .top
      padding 20px 0
.fade-in-active, .fade-out-active
  transition all 0.3s ease 
.fade-in-enter, .fade-out-active
  opacity 0 
</style>


