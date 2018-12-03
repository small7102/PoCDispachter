<template>
  <div class="arrow-wrap flex align-center justify-center" :style="arrowStyle" @click="handleClick">
    <Icon :type="direction" :color="color" :size="size" class="icon"></Icon>
  </div>
</template>

<script>
export default {
  name: 'Arrow',
  props: {
    direction: {
      type: String,
      default: 'ios-arrow-back'
    },
    color: {
      type: String,
      default: '#ffffff'
    },
    size: {
      type: Number,
      size: 30
    },
    arrowStyle: Object
  },
  methods: {
    handleClick () {
      if (this.direction === 'ios-arrow-back') {
        this.$emit('on-scroll', 200)
        return
      }
      this.$emit('on-scroll', -200)
    }
  }
}
</script>

<style lang="stylus" scoped>
.arrow-wrap
  cursor pointer
  background rgba(0, 0, 0, .1)
  transition all .2s
  .icon
    opacity .4
    transition all .2s
  &:hover
    background rgba(0, 0, 0, .4)
    .icon
      opacity 1

</style>


