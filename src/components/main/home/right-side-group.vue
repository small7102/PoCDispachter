<template>
  <div class="side-group-wrap">
    <card :style="{width: '180px', margin: '36px auto'}">
        <p slot="title" class="title">
           最近群组
        </p>
        <i-button class="btn">
          Recent Group
        </i-button>
    </card>
    <card :style="{width: '180px', margin: '36px auto'}">
        <p slot="title" class="title">
           快捷群组
        </p>
        <template v-if="!tempGroupList.length">
          <div class="none">暂无快捷群组记录</div>
        </template>
        <template v-else>
          <div class="temp-list scroll-bar">
            <div class="btn-wrap pr"
                v-for="(item, index) in tempGroupList"
                :key="item.id"
                @mouseover="activeIndex = index"
                @mouseout="activeIndex = ''"
                >
              <Button class="mt12 temp-item w100 pr" @click.stop="handleSelectTempGroup(item)">
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
              删除所有记录
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

export default {
  name: 'SideGroup',
  components: {
    'Card': Card,
    'i-button': Button
  },
  computed: {
    tempGroupList () {
      let list = this.$store.getters.tempGroupList
      console.log(list)
      return list
    }
  },
  data () {
    return {
      activeIndex: '',
      isModalShow: false,
      deleteItem: ''
    }
  },
  methods: {
    handleSelectTempGroup (item) {
      this.$store.commit(types.SetTempGroupMembers, item.membersList)
      this.$emit('on-select', item)
    },
    deleteTempGroup (item, index) {
      this.isModalShow = true
      this.deleteItem = item
      let list = this.$store.getters.tempGroupList
      list.splice(index, 1)
      this.$store.commit(types.SetTempGroupList, list)
      Storage.localSet('tempGroup', list)
    },
    deleteAllTempGroup () {
      this.$store.commit(types.SetTempGroupList, [])
      Storage.localSet('tempGroup', [])
    }
  },
  watch: {
    tempGroupList (val) {
      console.log(val)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

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
