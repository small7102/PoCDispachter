<template>
  <div class="side-group-wrap">
    <card class="card" :padding="10">
        <p slot="title" class="title">
           {{languageCtx.rightGroup.recentGroup}}
        </p>
        <i-button class="btn btn-item" @click="createRecentTempGroup">
          {{languageCtx.rightGroup.recentGroup}}
        </i-button>
    </card>
    <card class="card" :padding="0">
        <p slot="title" class="title">
           {{languageCtx.rightGroup.quickGroup}}
        </p>
        <template v-if="!tempGroupList || !tempGroupList.length">
          <div class="none quick">{{languageCtx.rightGroup.noGroup}}</div>
        </template>
        <template v-else>
          <div class="temp-list scroll-bar">
            <div class="btn-wrap pr btn-item"
                v-for="(item, index) in tempGroupList"
                :key="item.id"
                @click.stop="selectTempGroup(item)"
                @mouseover="activeIndex = index"
                @mouseout="activeIndex = ''"
                >
              <Button class="mt12 temp-item w100 pr" :key="item.id">
                {{item.name}}
              </Button>
              <Icon
                color="#2d6fad"
                type="ios-close-circle-outline"
                class="pa close-btn"
                @click.stop="deleteTempGroup(item, index)"
                v-if="index === activeIndex"/>
            </div>

          </div>
          <div class="bottom-wrap" @click="deleteAllTempGroup">
            <Icon type="ios-trash-outline" size="20"/>
            {{languageCtx.rightGroup.delBtnText}}
          </div>
        </template>
    </card>
  </div>
</template>

<script>
import { Card, Button } from 'iview'
import Storage from '@/utils/localStorage'
import * as types from '@/store/types/group'
import addTemp from '@/store/mixins/createTempGroup'
import {debounce} from '@/utils/utils'
import language from './mixin'

export default {
  name: 'SideGroup',
  components: {
    'Card': Card,
    'i-button': Button
  },
  mixins: [addTemp, language],
  computed: {
    tempGroupList: {
      get () {
        let list = this.$store.getters.tempGroupList
        return list
      },
      set (val) {
        this.$store.commit(types.SetTempGroupList, val)
      }
    },
    userId () {
      return this.$store.getters.userInfo.msId
    }
  },
  data () {
    return {
      activeIndex: '',
      deleteItem: ''
    }
  },
  created () {
    this.myTempInfo = Storage.localGet('myTempInfo')
    this.myRecentTempInfo = Storage.localGet('myRecentTempInfo')
  },
  mounted () {
    this.tempGroupList = this.myTempInfo && this.myTempInfo[this.userId]
    this.recentGroup = this.myRecentTempInfo && this.myRecentTempInfo[this.userId]
  },
  methods: {
    deleteTempGroup (item, index) {
      this.deleteItem = item
      let list = [...this.tempGroupList]
      list.splice(index, 1)
      this.tempGroupList = list

      this.myTempInfo[this.userId] = list
      Storage.localSet('myTempInfo', this.myTempInfo)
    },
    deleteAllTempGroup () {
      this.tempGroupList = []
      this.myTempInfo[this.userId] = null
      Storage.localSet('myTempInfo', this.myTempInfo)
    },
    selectTempGroup (item) {
      this.toCreatTempGroup({tempInfo: item, creatType: 'QUICK_TEMP_GROUP', cids: item.cids})
    },
    createRecentTempGroup () {
      let myRecentTempInfo = Storage.localGet('myRecentTempInfo')
      let tempInfo = myRecentTempInfo[this.userId]
      if (tempInfo) {
        this.toCreatTempGroup({tempInfo, creatType: 'RECENT_TEMP_GROUP', cids: tempInfo.cids})
      } else {
        this.messageAlert('warning', this.languageCtx.rightGroup.noRecentGroup)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

.card
  width 90%
  margin 36px auto
  .btn-item
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
  .title
    text-align center
  .btn
    width 100%
    background $color-theme-btn
    color #ffffff
  .close-btn
    top 21px
    right 5px
    cursor pointer
  .none
    text-align center
    line-height 40px
    &.quick
     line-height 60px
  .temp-list
    max-height 360px
    overflow-y scroll
    padding 0 10px
  .bottom-wrap
    text-align center
    font-size $font-size-small
    margin 10px auto
    cursor pointer
    transition .2s all
    &:hover
      color #000
</style>
