<template>
  <div class="sider-group">
    <template v-for="item in groupList">
      <Submenu :key="item.gid" :name="item.gid">
        <template slot="title">
          <Icon type="ios-people" size="24" color="#4990d7"/>
          <div class="name">{{item.name}}</div>
          <span v-html="getOnline(item.gid)"></span>
        </template>
        <template v-if="item.children && item.children.length > 0">
          <sub-group :groupList="item.children"></sub-group>
        </template>
        <member-list :memberList="memberObj[item.gid]" :paddingLeftStyle="getPaddingLeft(item.deep)"/>
      </Submenu>
    </template>
    <slot></slot>
  </div>
</template>

<script>
import MemberList from './member-list'

export default {
  name: 'SubGroupTree',
  props: {
    groupList: Array
  },
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
    getPaddingLeft (deep) {
      return {
        paddingLeft: `${(deep + 1) * 36}px`
      }
    },
    getOnline (gid) {
      let list = this.$store.getters.memberList[gid]
      let online = list.filter((item) => {
        return item.online === '1'
      })
      return `[${online.length}/${list.length}]`
    }
  }
}
</script>

<style lang="stylus">
  @import './reset.styl'
</style>
