<template>
  <div class="tree-wrap h100 scroll-bar pr" ref="scroll" id="treeScroll" @mouseleave="handleMOuseleave">
    <Menu width="auto" :open-names="openGroup" ref="menu" @on-open-change="handleOpenChange" class="h100">
      <template v-for="(item) in treeGroupList">
        <Submenu :name="item.gid" :key="`menu-${item.gid}`">
            <div class="flex group-bar between"
                 slot="title"
                 @mouseover="showSwitchIcon(item)"
                 @mouseout="hideSwitchIcon()">
              <div class="flex-item">
                <Icon type="ios-people" size="20" color="#4990d7"/>
                <span class="name">{{item.name}}</span>
                <span class="online" v-html="`[${getOnline[item.gid].onlineNum}/${getOnline[item.gid].all}]`"></span>
              </div>
              <Icon class="switch-icon"
                    type="md-swap" 
                    size="18" 
                    color="#4990d7" 
                    v-if="switchGid === item.gid"
                    @click.stop="handleSwitchGroup(item)"/>
            </div>
          <template>
            <sub-group :groupList="item.children" 
                       @on-scroll="toScroll" 
                       @on-hover="handleHover"
                       :ref="`group${item.gid}`"/>
            <member-list :gid="item.gid"
                         :paddingLeftStyle="getPaddingLeft(item.deep)" 
                         :ref="`member${item.gid}`"
                         @on-scroll="toScroll"
                         @on-hover="handleHover"
                         />
          </template>
        </Submenu>
      </template>
    </Menu>
    <div class="right-menu"
         :class="{slideToggle: isRightMenuShow}"
         v-show="isRightMenuShow" 
         :style="{top: `${rightMenuTop}`}"
         @mouseleave="handleMOuseleave"
         @click="handleRightEvents"
         >
      <Card class="menu-card" :padding="0">
        <div class="menu-line flex align-center" ref="info">
            <Icon class="icon" type="ios-list" size="22" color="#2682d0"/><span>终端信息</span>
        </div>
        <!-- <div class="menu-line flex align-center" v-if="rightMenuSelectMember && rightMenuSelectMember.type!=='20'">
            轨迹回放
        </div> -->
        <div class="menu-line flex align-center" ref="callset" v-if="rightMenuSelectMember && rightMenuSelectMember.type!=='20'">    
            <Icon class="icon" type="ios-mic-outline" size="20" color="#d6852f"/><span>通话设置</span>
        </div>
        <div class="menu-line flex align-center" ref="messages">
            <Icon class="icon" type="ios-chatbubbles-outline" size="16" color="#2bbd27"/><span>信    息</span>
        </div>
    </Card>
    </div>
    <calling-status ref="callingStatus"
                    @on-over="rightMenuSelectMember=null"
                    :member="rightMenuSelectMember"/>
    <message ref="message"
            :member="rightMenuSelectMember"/>
    <terminal-info ref="terminalInfo"
                   :member="rightMenuSelectMember"/>
  </div>
</template>

<script>

import MemberList from './member-list'
import SubGroup from './sub-group-tree'
import { filterArr, getTreeList, uniqueArr, isInContent } from '@/utils/utils'
import * as types from '@/store/types/group'
import mixin from '@/store/mixins/mixin'
import mx from './mixin'
import CallingStatus from './calling-status'
import Message from '@/components/main/message'
import TerminalInfo from './terminal-info'

export default {
  name: 'GroupTree',
  components: {
    MemberList,
    SubGroup,
    CallingStatus,
    Message,
    TerminalInfo
  },
  mixins: [mixin, mx],
  data () {
    return {
      openedGroup: [],
      isFirstInit: true,
      isRightMenuShow: false,
      rightMenuTop: 0,
      rightMenuSelectMember: null
    }
  },
  computed: {
    treeGroupList () {
      let list = this.$store.getters.treeGroupList
      return list
    },
    openGroup () {
      return this.$store.getters.openGroup
    }
  },
  methods: {
    handleOpenChange (arr) {
      let opened = filterArr(this.openedGroup, arr)
      if (arr.length < this.openedGroup.length) {
        this.openedGroup = arr
        this.$store.commit(types.SetOpenGroup, this.openedGroup)
        return
      }

      this.openedGroup = []
      for (let value of this.originGroupList) {
        if (value.gid === opened[0]) {
          this.commitOpenGroup(this.originGroupList, value, 'select')
        }
      }
    },
    initOpenGroup () { // 初始化打开的群组
      for (let value of this.originGroupList) {
        if (value.gid === this.user.gId) {
          let obj = {...value}
          this.commitOpenGroup(this.originGroupList, obj)
          this.handleSomeoneOnline({gid: this.user.gId, mid: this.user.msId})
        }
      }
    },
    commitOpenGroup (list, item) { // 提交要展示群组的数据
      this.openedGroup.push(item.gid)
      getTreeList(list, item.fid, this.openedGroup) // 得到展开群组的gid与它的父级gid组成的数组
      this.$store.commit(types.SetOpenGroup, this.openedGroup)
    },
    toScroll (distance) {
      this.$refs.scroll.scrollTop = distance
    },
    handleHover ({top, item, show}) {
      this.isRightMenuShow = show
      this.rightMenuTop = `${top + 10}px`
      this.rightMenuSelectMember = item
    },
    handleRightEvents (ev) {
      let actions = this.eventsMap()
      // let targetAction
      let action = [...actions].find(([key, action]) => {
        let parent = this.$refs[key]
        let isInner = isInContent(ev.target, parent)
        isInner && action.call(this)
        return isInner
      })
      action = null
    },
    handleMOuseleave () {
      this.isRightMenuShow = false
    },
    eventsMap () {
      return new Map([
        ['callset', () => {this.$refs.callingStatus.isModalShow = true}],
        ['messages', () => {this.$refs.message.isModalShow = true}],
        ['info', () => {this.$refs.terminalInfo.isModalShow = true}],
      ])
    },
    getRightMenu () {},
  },
  watch: {
    allMembersObj (val) {
      if (this.isFirstInit) {
        this.initOpenGroup()
        this.isFirstInit = false
      }
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
    padding 0 10px
    .group-bar
      padding-left 20px
    .right-menu
      position fixed
      left 150px
      z-index 999
      transition all .1s
    .menu-card
      width 100px
      padding 5px 0
    .menu-line
      line-height 30px
      transition all .2s
      padding-left 10px
      font-size 12px
      cursor pointer
      .icon
        display inline-block
        width 25px
        text-align center
        font-weight 500
      &:hover
        background #f3f3f3
</style>
