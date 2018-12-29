<template>
  <div class="sider-group" :style="paddingLeftStyle" ref="subGroup">
    <template v-for="item in groupList">
      <Submenu :key="item.gid" :name="item.gid">
        <div class="flex group-bar between" 
             slot="title" 
             :style="paddingLeftStyle" 
             @mouseover="showSwitchIcon(item)"
             @mouseout="hideSwitchIcon()">
          <div class="flex-item">
            <Icon type="ios-people" size="20" color="#4990d7"/>
            <div class="name">{{item.name}}</div>
            <span class="online" v-html="`[${getOnline[item.gid].onlineNum}/${getOnline[item.gid].all}]`"></span>
          </div>
          <Icon
            class="switch-icon"
            type="md-swap"
            size="18" 
            color="#4990d7" 
            v-if="switchGid === item.gid"
            @click.stop="handleSwitchGroup(item)"/>
        </div>
        <template v-if="item.children && item.children.length > 0">
          <sub-group :groupList="item.children"></sub-group>
        </template>
        <member-list :gid="item.gid" @on-scroll="toScroll" :style="getPaddingLeft()" @on-hover="handleHover"/>
        <!-- <member-list :memberList="memberObj[item.gid]" @on-scroll="toScroll" :style="getPaddingLeft()"/> -->
      </Submenu>
    </template>
    <slot></slot>
  </div>
</template>

<script>
import MemberList from './member-list'
import mixin from './mixin'

export default {
  name: 'SubGroupTree',
  props: {
    groupList: Array,
    paddingLeftStyle: {
      type: Object,
      default: () => {
        return {
          paddingLeft: '18px'
        }
      }
    }
  },
  mixins: [mixin],
  components: {
    MemberList
  },
  computed: {
    memberObj () {
      console.log('我也变化了')
      let memberObj = this.$store.getters.memberList
      return memberObj
    }
  },
  mounted () {
  },
  methods: {
    // getOnline (gid) {
    //   let list = this.$store.getters.memberList[gid]
    //   let online = list.filter((item) => {
    //     return item.online === '1'
    //   })
    //   return `[${online.length}/${list.length}]`
    // },
    toScroll (distance) {
      this.$emit('on-scroll', distance)
    },
    handleHover ({top, item, show}) {
      this.$emit('on-hover', {top, item, show})
    }
  }
}
</script>

<style lang="stylus">
  @import './reset.styl'
</style>
