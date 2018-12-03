<template>
  <transition name="fade">
    <div class="loading-wrap flex align-center justify-center">
      <div class="content">
        <div class="top b-bor">
          <div class="slider"></div>
        </div>
        <p>LOADING...</p>
        <div class="bottom b-bor">
          <div class="slider"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable';
  .loading-wrap
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background rgba(255, 255, 255, .95)
    z-index 999
    .b-bor
      width 250px
      position relative
      height 30px
      .slider
        position absolute
        left 0
        top 0
        height 20px
        width 20px
        animation: loading .4s infinite alternate ease-in-out
        background $color-theme
      &.bottom
        .slider
          top auto
          bottom 0
    p
      color  $color-theme
      text-align center
      font-family helvetica, arial, sans-serif
      letter-spacing: 0.2em
      font-weight bold


  @keyframes loading
    from
      left 0
      width 20px
      height 25px
    50%
      width 40px
      height 8px
    to
      left 230px
      width 20px
      height 25px
</style>

