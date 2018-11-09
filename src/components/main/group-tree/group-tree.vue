<template>
  <div class="tree-wrap h100 scroll-bar">
    <Menu width="auto" :open-names="openGroup" ref="menu" @on-open-change="handleOpenChange" class="h100">
      <template v-for="(item) in treeGroupList">
        <Submenu :name="item.gid" :key="`menu-${item.gid}`">
          <template slot="title">
            <Icon type="ios-people" size="24" color="#4990d7"/>
            <span class="name">{{item.name}}</span>
            <span class="name" v-html="getOnline(item.gid)"></span>
          </template>
          <template>
            <sub-group :groupList=" item.children"/>
            <member-list :memberList="memberObj[item.gid]"></member-list>
          </template>
        </Submenu>
      </template>
    </Menu>
  </div>
</template>

<script>
// import {getTrees} from '@/utils/utils'
import MemberList from './member-list'
import SubGroup from './sub-group-tree'
import { filterArr, getTreeList } from '@/utils/utils'
import * as types from '@/store/types/group'
import mixin from '@/store/mixin'

export default {
  name: 'GroupTree',
  components: {
    MemberList,
    SubGroup
  },
  mixins: [mixin],
  data () {
    return {
      openedGroup: []
    }
  },
  computed: {
    treeGroupList () {
      let list = this.$store.getters.treeGroupList
      return list
    },
    memberObj () {
      let memberObj = this.$store.getters.memberList
      return memberObj
    },
    openGroup () {
      return this.$store.getters.openGroup
    }
  },
  methods: {
    handleOpenChange (arr) {
      let list = this.$store.getters.originGroupList
      let opened = filterArr(this.openedGroup, arr)
      if (arr.length < this.openedGroup.length) {
        this.openedGroup = arr
        this.$store.commit(types.SetOpenGroup, this.openedGroup)
        return
      }

      this.openedGroup = []
      for (let value of list) {
        if (value.gid === opened[0]) {
          this.commitOpenGroup(list, value, 'select')
        }
      }
    },
    getOnline (gid) {
      let list = this.$store.getters.memberList[gid]
      let online = list.filter((item) => {
        return item.online === '1'
      })
      return `[${online.length}/${list.length}]`
    },
    initOpenGroup () { // 初始化打开的群组
      let list = this.$store.getters.originGroupList
      let nowOpening = this.$store.getters.userInfo.gId

      for (let value of list) {
        if (value.gid === nowOpening) {
          this.commitOpenGroup(list, value)
          this.upMyself()
        }
      }
    },
    commitOpenGroup (list, item) { // 提交要展示群组的数据
      this.openedGroup.push(item.gid)
      getTreeList(list, item.fid, this.openedGroup) // 得到展开群组的gid与它的父级gid组成的数组
      this.$store.commit(types.SetOpenGroup, this.openedGroup)
    }
  },
  watch: {
    treeGroupList (val) {
      this.initOpenGroup()
    },
    openGroup (val) {
      this.openedGroup = val
      this.$nextTick(() => {
        this.$refs.menu.updateOpened()
      })
    }
  }
}
</script>

<style lang="stylus">
  @import './reset.styl'
</style>

<style lang="stylus" scoped>
  .tree-wrap
    overflow auto
</style>
