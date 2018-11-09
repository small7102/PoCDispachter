<template>
  <div class="tabs">
    <router-link tag="a" to="/home"
                class="link-item flex align-items"
                v-for="(item, index) in tabsList"
                :class="{active: item.active}"
                :key="index"
                >
      <i-icon :style="iconWidth" :type="item.iconType" :size="item.iconSize"/>
      <span v-html="item.name"></span>
      <div class="right-arrow"><i-icon type="ios-arrow-forward" /></div>
    </router-link>
  </div>
</template>

<script>
import { Icon } from 'iview'
export default {
  name: 'Tabs',
  components: {
    'i-icon': Icon
  },
  props: {
    iconWidth: {
      type: Object,
      default: () => {
        return {
          width: '25px',
          marginRight: '4px',
          lineHeight: '50px'
        }
      }
    }
  },
  data () {
    return {
      tabsList: [
        {
          name: '语音调度',
          active: true,
          iconType: 'ios-mic-outline',
          iconSize: 24
        },
        {
          name: '定位监控',
          active: false,
          iconType: 'ios-pin-outline',
          iconSize: 24
        },
        {
          name: '轨迹回放',
          active: false,
          iconType: 'ios-sync',
          iconSize: 22
        },
        {
          name: '日&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;志',
          active: false,
          iconType: 'ios-paper-outline',
          iconSize: 22
        }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .link-item
    height 50px
    line-height 50px
    color rgba(255, 255, 255, .8)
    background $color-theme-weight
    padding 0 15px
    line-height 50px
    transition all .2s
    overflow hidden
    span
      width 180px
    &.active
      background $color-theme-weight-d
      color #ffffff
    .right-arrow
      transform translateY(30px)
      transition all .1s
    &:hover
      color rgba(255, 255, 255, .9)
      background #3361a4
      .right-arrow
        transform translateY(0)
</style>
