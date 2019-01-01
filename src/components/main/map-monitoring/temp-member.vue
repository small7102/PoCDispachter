<template>
  <div class="temp-wrap pr">
      <div class="notice pa w100 flex" v-if="isTipsShow">
        <div class="flex-item">{{languageCtx.tip}}</div>
        <Icon type="ios-close" size="20" @click="isTipsShow = false"/>
      </div>
      <Card class="card" shadow :padding="10">
        <p slot="title" class="title">
           选择地图
        </p>
        <template>
          <RadioGroup v-model="mapType" class="flex">
            <Radio label="amap" class="flex-item tc">
                <span>高德</span>
            </Radio>
            <Radio label="gmap"  class="flex-item tc">
                <span>谷歌</span>
            </Radio>
        </RadioGroup>
        </template>
      </Card>
      <Card class="card temp-card mt12" shadow :padding="10">
        <p slot="title" class="title">
           {{languageCtx.title}}
        </p>
        <template v-if="!mapTempMemberList.length">
          <div class="none sub-txt">{{languageCtx.noData}}</div>
          <div class="flex justify-center">
            <Button class="select-btn" @click="selectFullScreen">{{languageCtx.selectBtnText}}</Button>
          </div>
        </template>
        <template v-else>
          <div class="member-wrap">
            <div class="member-list scroll-bar" :class="{active: hasMapTempGroup}">
              <div class="flex delete-line sub-txt" v-if="!hasMapTempGroup" @click="handleDeletMember('all')">
                <span class="flex-item mt4">{{languageCtx.delText}}</span>
                <Icon type="ios-trash-outline" size="18" class=""/>
              </div>
              <div
                class="member-item flex align-center between mt10"
                v-for="item in mapTempMemberList"
                :key="item.cid"
                >
                <div class="flex align-center">
                  <img :src="iconImg({terminalType: item.type, online: item.online})" alt="" class="img">
                  <span v-html="item.name"></span>
                </div>
                <Icon type="ios-close" class="icon-close" size="20" @click="handleDeletMember(item)" v-if="!hasMapTempGroup"/>
              </div>
            </div>
            <div class="btn-wrap flex between mt10">
              <Button class="btn theme-btn" size="small" v-if="!hasMapTempGroup" @click="handleCreateTempGroup">临时群组</Button>
              <Button class="btn cancel" size="small" v-else @click="handleCloseTemp">{{languageCtx.cancelBtnText}}</Button>
              <Button class="btn theme-btn" size="small" @click="openMessageModal">{{languageCtx.messageBtnText}}</Button>
            </div>
          </div>
        </template>
      </Card>
      <message ref="message"/>
  </div>
</template>

<script>
import mixin from '@/store/mixins/createTempGroup'
import * as map from '@/store/types/map'
import * as types from '@/store/types/group'
import language from './mixin'
import Message from '@/components/main/message'

export default {
  name: 'TempMember',
  mixins: [mixin, language],
  components: {
    Message
  },
  computed: {
    mapTempMemberList: {
      get () {
        return this.$store.getters.mapTempMemberList
      },
      set (val) {
        this.$store.commit(map.SetMapTempMemberList, val)
      }
    },
    hasMapTempGroup: {
      get () {
        return this.$store.getters.hasMapTempGroup
      },
      set (val) {
        this.$store.commit(map.SetHasMapTempGroup, val)
      }
    },
    tempGroupInfo: {
      get () {
        return this.$store.getters.tempGroupInfo
      },
      set (val) {
        this.$store.commit(types.SetTempGroupInfo, val)
      }
    },
  },
  data () {
    return {
      isDisable: false,
      isTipsShow: true,
      mapType: 'amap'
    }
  },
  methods: {
    handleDeletMember (item) {
      if (item !== 'all') {
        let list = [...this.mapTempMemberList]
        let itemIndex
        list.forEach((value, index) => {
          if (value.cid === item.cid) itemIndex = index
        })
        list.splice(itemIndex, 1)
        this.$emit('on-delete', {mid: item.cid, type: this.mapType})
        this.mapTempMemberList = list
      } else {
        this.$emit('on-delete', {type: this.mapType})
        this.$store.commit(map.SetMapTempMemberList, [])
        this.mapTempMemberList = []
      }
    },
    handleCreateTempGroup () {
      this.$emit('on-create', this.mapType)
      this.toCreatTempGroup({
        creatType: 'MAP_TEMP_GROUP',
        cids: this.mapTempMemberList.map(item => {return item.cid})
      })
    },
    selectFullScreen () {
      this.$emit('on-select', this.mapType)
    },
    handleCloseTemp () {
      this.handleClose()
    },
    openMessageModal () {
      this.$refs.message.isModalShow = true
    }
  },
  watch: {
    mapType (val) {
      this.$emit('on-change', val)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/variable.styl';

.temp-wrap
  position absolute
  right 10px
  top 50%
  transform translateY(-50%)
  z-index 2
  .notice
    top 147px
    left 0
    font-size 12px
    z-index 10
    line-height 16px
    background #ffefe6
    padding 6px 10px
    color #a74e4e
  .sub-txt
    font-size 12px
    color #bbb
  .delete-line
    cursor pointer
    &:hover
      color #999
    span
      text-align right
  .none
    text-align center
    margin-top 50px
    line-height 30px
  .card
    width 200px
    &.temp-card
      height 360px
    .title
      text-align center
  .member-list
    height 240px
    padding 0 5px
    overflow scroll
    .member-item
      padding 0 5px
      height 32px
      border-radius 6px
      border 1px solid #eaeaea
      transition all .2s
      &:hover
        background $color-theme-light-ll
      .icon-close
        cursor pointer
        &:hover
          color $color-theme
    .img
      width 20px
    &.active
      background #f5f5f5
      .member-item
        background #c2edb1
        border 1px solid #b3d4a6
        opacity 1
  .btn
    width 70px
    height 30px
    &.theme-btn
      background $color-theme-btn
      color #ffffff
  .select-btn
    margin-top 12px
    border 1px solid $color-theme
    color  $color-theme-weight
    &:hover
      background $color-theme-light-ll
</style>
