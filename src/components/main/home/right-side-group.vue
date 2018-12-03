<template>
  <div class="side-group-wrap">
    <card class="card">
        <p slot="title" class="title">
           最近群组
        </p>
        <i-button class="btn btn-item">
          最近群组
        </i-button>
    </card>
    <card class="card">
        <p slot="title" class="title">
           快捷群组
        </p>
        <template v-if="!tempGroupList.length">
          <div class="none">暂无快捷群组记录</div>
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

            <div class="bottom-wrap" @click="deleteAllTempGroup">
              <Icon type="ios-trash-outline" size="20"/>
              删除所有
            </div>
          </div>
        </template>
    </card>
  </div>
</template>

<script>
import { Card, Button } from 'iview'
import Storage from '@/utils/localStorage'
import * as types from '@/store/types/group'
import mx from './mixin'
import {debounce} from '@/utils/utils'

export default {
  name: 'SideGroup',
  components: {
    'Card': Card,
    'i-button': Button
  },
  mixins: [mx],
  computed: {
    tempGroupList () {
      let list = this.$store.getters.tempGroupList
      return list
    }
  },
  data () {
    return {
      activeIndex: '',
      deleteItem: ''
    }
  },
  methods: {
    deleteTempGroup (item, index) {
      this.deleteItem = item
      let list = [...this.$store.getters.tempGroupList]
      list.splice(index, 1)
      this.$store.commit(types.SetTempGroupList, list)
      let myTempInfo = Storage.localGet('myTempInfo')
      let user = this.$store.getters.userInfo.msId

      myTempInfo[user] = list
      Storage.localSet('myTempInfo', myTempInfo)
    },
    deleteAllTempGroup () {
      this.$store.commit(types.SetTempGroupList, [])
      Storage.localSet('myTempInfo', null)
    },
    selectTempGroup (item) {
      this.$store.commit(types.SetTreeGroupSelectedList, item.cids)
      this.toCreatTempGroup({tempInfo: item, creatType: 'TEMP_GROUP'})
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
  .temp-list
    max-height 400px
  .bottom-wrap
    text-align center
    font-size $font-size-small
    margin-top 20px
    cursor pointer
    transition .2s all
    &:hover
      color #000
</style>
