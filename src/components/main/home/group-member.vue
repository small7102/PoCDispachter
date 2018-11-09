<template>
  <div class="group-member-wrap scroll-bar">
      <ul class="clearfix" v-if="memberListShow">
        <li class="member-item fl pr"
            v-for="(item, index) in memberList"
            :key="item.cid"
            :class="{active: index===activeIndex, myself: item.cid === msId}"
            @click="creatSingleGroup(item, index)"
            >
          <Icon type="ios-contact" v-if="item.cid === msId" color="#c77453" size="16" class="myself-icon pa"/>
          <div class="img-wrap flex align-center justify-center">
            <img :src="iconImg(item.type, item.online)" alt="">
          </div>
          <div class="id" v-html="item.name">
          </div>
        </li>
      </ul>
      <ul class="clearfix" v-else>
        <li class="member-item fl pr"
            v-for="(item, index) in tempList"
            :key="item.cid"
            :class="{active: index===activeIndex, myself: item.cid === msId}"
            >
            <Icon type="ios-contact" v-if="item.cid === msId" color="#c77453" size="16" class="myself-icon pa"/>
          <div class="img-wrap flex align-center justify-center">
            <img :src="iconImg(item.type, item.online)" alt="">
          </div>
          <div class="id" v-html="item.name">
          </div>
        </li>
      </ul>
  </div>
</template>

<script>
import mixin from '@/store/mixin'
import * as types from '@/store/types/group'
// import { createTempGroup } from '@/libs/webDispatcher-sdk.js'
// import {Message} from 'iview'

export default {
  name: 'BlockGroup',
  mixins: [ mixin ],
  props: {
    memberList: Array
  },
  data () {
    return {
      activeIndex: '',
      msId: '',
      memberListShow: true,
      isSingleCalling: false
    }
  },
  computed: {
    selectedMemberList () {
      let memberList = this.$store.getters.memberList
      let selectedId = this.$store.getters.openGroup[0]
      return memberList[selectedId]
    },
    tempList () {
      let list = this.$store.getters.groupTempList
      return list
    }
  },
  methods: {
    creatSingleGroup (item, index) {
      this.activeIndex = index
      let groupName = this.$store.getters.userInfo.pttGroup
      if (this.msId === item.cid) {
        this.messageAlert('error', '您不能与自己创建单呼')
        this.$store.commit(types.SetNowStatus, `当前所在群组${groupName}`)
      } else {
          if (!this.isSingleCalling) {
            this.isSingleCalling = true
            this.$store.dispatch(types.CreatTempGroup).then(() => {
              this.$store.commit(types.SetNowStatus, `当前所在群组${groupName}&&正在与${item.name}创建单呼...`)
              this.messageAlert('success', '创建单呼成功')
              this.$emit('on-single-call', item.name)
              // 如果有临时群组发解除临时群组指令
              if (this.$store.getters.groupTempList.length) {
                this.$store.dispatch(types.RemoveTempGroup).then(() => {
                  this.$emit('on-quit')
              })
            }
          })
        } else {
          this.activeIndex = ''
          this.$store.dispatch(types.RemoveTempGroup).then(() => {
            this.$store.commit(types.SetNowStatus, `当前所在群组${groupName}`)
            this.messageAlert('success', '单呼取消成功')
          })
        }
      }
    },
    myselfStyl () {
      let id = this.$store.getters.userInfo.msId
      this.msId = id
    }
  },
  watch: {
    selectedMemberList () {
      this.myselfStyl()
    },
    memberList (val) {
      if (!val.length) {
        this.memberListShow = false
      } else {
        this.memberListShow = true
        this.activeIndex = ''
      }
    },
    tempList (val) {
      if (val.length > 0) {
        this.activeIndex = ''
        this.memberListShow = false
        this.myselfStyl()
      } else {
        this.memberListShow = true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .group-member-wrap
    background $color-theme
    height 100%
    padding 36px 26px
    overflow-y auto
    .member-item
      width 110px
      height 74px
      box-shadow 0 0 3px 5px rgba(100, 139, 149, .2)
      border-radius 8px
      background #ffffff
      margin-right 20px
      margin-bottom 20px
      text-align center
      cursor pointer
      .myself-icon
        top 6px
        right 10px
      .img-wrap
        margin 14px auto
      .id
        font-size 10px
        text-align center
      &.active
        background $color-ssub-theme
        border 1px solid $color-ssub-theme-border
      &.myself
        background $color-sub-theme
        border 1px solid $color-sub-theme-border
</style>
