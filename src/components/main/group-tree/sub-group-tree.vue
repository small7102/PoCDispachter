<template>
  <div class="sider-group" :style="paddingLeftStyle">
    <template v-for="item in groupList">
      <Submenu :key="item.gid" :name="item.gid">
        <template slot="title" :style="paddingLeftStyle">
          <Icon type="ios-people" size="24" color="#4990d7"/>
          <div class="name">{{item.name}}</div>
          <span>{{`[${item.onlineNum}/${item.all}]`}}</span>
        </template>
        <template v-if="item.children && item.children.length > 0">
          <sub-group :groupList="item.children"></sub-group>
        </template>
        <member-list :memberList="memberObj[item.gid]" @on-scroll="toScroll"/>
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
          paddingLeft: '24px'
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
      let memberObj = this.$store.getters.memberList
      return memberObj
    }
  },
  mounted () {
  },
  methods: {
    getOnline (gid) {
      let list = this.$store.getters.memberList[gid]
      let online = list.filter((item) => {
        return item.online === '1'
      })
      return `[${online.length}/${list.length}]`
    },
    toScroll (distance) {
      this.$emit('on-scroll', distance)
    }
  }
}
</script>

<style lang="stylus">
  @import './reset.styl'
</style>
