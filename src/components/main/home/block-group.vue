<template>
  <div class="block-group-wrap pr">
    <arrow :arrowStyle="arrowLeftStyle" :size="36" @on-scroll="handleScroll(-200)"/>
    <arrow :arrowStyle="arrowRightStyle" :size="36" direction="ios-arrow-forward" @on-scroll="handleScroll(200)"/>
    <div class="container-wrap scroll-bar" ref="scrollBody" @mousewheel="handleScroll">
        <div class="group-container pr" :style="containerStyle" :class="{hasGroup : groupList.length}">
          <transition-group class="clearfix">
            <add-temp-group @on-back="selectTempGroup" @on-success="handleCreatTempSuccess" :tempGroup="tempGroup" key="add-on"></add-temp-group>
            <div class="group-wrap fl" v-for="(item, index) in groupList" :key="index" @click="dispatchSwitchGroup(item)">
              <div class="group-item" :class="{active: item.gid === activeGid}">
                <div class="top">
                    <div class="info-line title">
                      <span>群组:</span>
                      <span class="">{{item.name}}</span>
                    </div>
                    <div class="info-line">
                      <span>群组成员:{{membersList[item.gid].length}}人</span>
                    </div>
                    <div class="info-line">
                      <span>当前在线:</span>
                      <!-- <span v-if="membersList[item.gid].length!==item.all">onlineList</span> -->
                      <span v-html="onlineList[index]"></span>
                    </div>
                </div>

                <div class="bottom flex between align-center">
                    <span class="id">ID: {{item.gid}}</span>
                    <icon type="ios-people" size="40" color="#4990d7"/>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
    </div>
  </div>
</template>

<script>
import * as types from '@/store/types/group'
import * as userTypes from '@/store/types/user'
import * as app from '@/store/types/app'
import { getTreeList, uniqueArr } from '@/utils/utils'
import Storage from '@/utils/localStorage'
import mixin from '@/store/mixins/mixin'
import AddTempGroup from './add-temp-group'
import Arrow from '@/components/base//arrow'
import {debounce} from '@/utils/utils'
const BLOCK_ITEM_WIDTH = 218

export default {
  name: 'BlockGroup',
  components: {AddTempGroup, Arrow},
  computed: {
    tempGroupInfo () {
      return this.$store.getters.tempGroupInfo
    }
  },
  props: {
    tempGroup: Object,
    isRemoving: Boolean
  },
  mixins: [mixin],
  data () {
    return {
      slectedGroup: '',
      activeGid: '',
      openedGroup: [],
      arrowLeftStyle: null,
      arrowRightStyle: null,
      tagBodyLeft: 40,
      speed: 20,
      isFirstInit: true
    }
  },
  computed: {
    groupList () {
      let groupList = this.$store.getters.originGroupList
      return groupList
    },
    membersList () {
      let memberList = this.$store.getters.memberList
      return memberList
    },
    onlineList () {
      let memberObj = this.$store.getters.memberList
      if (!Object.keys(memberObj).length) return

      let arr = []
      for (key in memberObj) {
        if (!memberObj[key] || memberObj[key].length === 0) {
          arr.push(0)
        } else {
          const online = memberObj[key].filter(item => {
            return item.online === '1'
          })
        arr.push(online.length)
        }
      }
      return arr
    },
    containerStyle () {
      return this.getContainerStyle()
    }
  },
  created() {
    this.debounce = debounce(this.messageAlert.bind(this, 'warning', '您已在当前群组'), 300)
  },
  mounted () {
    this.setLeftArrowStyle()
    this.setRightArrowStyle()
  },
  methods: {
    getContainerStyle () {
      let len = this.groupList.length
      this.containerWidth = (len + 1) * BLOCK_ITEM_WIDTH
      return {
        marginLeft: `${this.tagBodyLeft}px`,
        width: `${this.containerWidth}px`
      }
    },
    selectGroup (item) {
      this.debounce(item)
    },
    dispatchSwitchGroup (item) {
      let tempGroupInfo = this.$store.getters.tempGroupInfo
      if (this.activeGid === item.gid) {
        if (!tempGroupInfo || this.$store.getters.singleCallActiveCid) { // 没有临时群组或者在当前组有单呼
          this.debounce()
        } else {
          let memberObj = this.$store.getters.memberList
          if (memberObj && memberObj[item.gid]) {
            this.$emit('on-init', memberObj[item.gid])
            this.$store.commit(types.SetNowStatus, `正在与${tempGroupInfo.name}通信...`)
          }
        }
      } else {
        this.$store.dispatch(userTypes.SwitchGroup, item).then(res => {
          this.messageNotice(res)
          if (!res) {
            this.switchToOtherGroup({prevGid: this.activeGid, nowGid: item.gid}).then((memberList) => {
              this.$store.commit(app.SetAppLoading, false)
              this.activeGid = item.gid
              // this.initMemberList() // 变化成员列表
              this.$emit('on-init', memberList)
  
              if (tempGroupInfo) this.$store.commit(types.SetNowStatus, `与${tempGroupInfo.name}通信...`)
              this.handleReactiveOpenGroup(item)
            }) 
          }
        })
      }
    },
    handleReactiveOpenGroup (item) {
      let opened = item.gid
      let list = this.$store.getters.originGroupList

      let openedIndex = this.openedGroup.indexOf(opened)
      if (openedIndex > -1) { // 点击deep值比上次deep小
        this.openedGroup = this.openedGroup.slice(openedIndex)
        this.commitOpenGroup(this.openedGroup)
        return
      }
      this.openedGroup = []
      this.openedGroup.push(opened)
      getTreeList(list, item.fid, this.openedGroup)
      this.commitOpenGroup(this.openedGroup)
    },
    messageNotice (res) {
      const message = {
          0: {
            type: 'success',
            info: '成功切换群组'
          },
          1: {
            type: 'info',
            info: '此群组ID不存在'
          },
          2: {
            type: 'info',
            info : '不再此群组'
          }
        }

        this.messageAlert(message[res].type, message[res].info)
    },
    selectTempGroup () {
      this.$emit('on-back')
    },
    commitOpenGroup (openedGroup) {
      this.activeGid = openedGroup[0]
      this.$store.commit(types.SetOpenGroup, openedGroup)
    },
    initMemberList () { // 初始化groupMember
      let memberList = this.$store.getters.memberList[this.activeGid]
      memberList = uniqueArr(memberList, 'cid') || []
      this.$store.commit(types.SetMemberList, {item: memberList, gid: this.activeGid})
      this.$emit('on-init', memberList)
    },
    setArrowCommonStyle () {
      return {
        width: '40px',
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 10
      }
    },
    setLeftArrowStyle () {
      this.arrowLeftStyle = this.setArrowCommonStyle()
      this.arrowLeftStyle.left = 0
    },
    setRightArrowStyle () {
      this.arrowRightStyle = this.setArrowCommonStyle()
      this.arrowRightStyle.right = 0
    },
    handleScroll (e) {
      let offset = typeof e === 'number' ? e : e.deltaY
      let scrollWidth = this.$refs.scrollBody.offsetWidth
      if (offset < 0 && this.tagBodyLeft >= 0) {
        this.tagBodyLeft = 40
        return
      } else if (offset > 0 && this.tagBodyLeft <= scrollWidth - this.containerWidth) {
        this.tagBodyLeft = scrollWidth - this.containerWidth - 40
        return
      } else {
        this.tagBodyLeft -= offset
      }
    },
    handleCreatTempSuccess () {
      this.$emit('on-init', [])
    },
  },
  watch: {
    groupList () {
      let openGroup = this.$store.getters.openGroup
      this.openedGroup = [...openGroup]
      this.activeGid = openGroup[0]
      if (this.isFirstInit) this.isFirstInit = false
      this.initMemberList()
    },
    isRemoving (val) {
      this.$store.commit(types.SetTempGroupInfo, null)
    },
    membersList (val) { // 有人上下线通知变更
      if (!this.isFirstInit) {
        this.$emit('on-init', val[this.activeGid])
      }
    }
  }
}
</script>

<style lang="stylus">
  .block-group-wrap.ivu-icon-ios-checkmark-circle
    font-size 20px
</style>

<style lang="stylus" scoped>
  @import './block.styl'

  .block-group-wrap
    background $color-theme
    height 308px
    margin-bottom 3px
    .container-wrap
      width 100%
      overflow auto
      padding 32px 0
      overflow hidden
      transition all .3s
    .block-container
      width auto
    .group-container
      transition margin-left .3s
      &.hasGroup
        &::after
          display block
          width 300px
          content 'no more...'
          color $color-theme-weight
          line-height 15px
          text-align center
          position absolute
          right 10px
          top 0
          transform rotate(90deg) translate(100px, -150px)
  .v-enter,.v-leave-to
      transform translateY(80px)
  .v-enter-active,
  .v-leave-active
      transition all 0.4s ease
</style>
