<template>
    <div class="group-member-list">
        <Row v-for="(row, index) in list" :key="index" type="flex" :gutter="gutter">
          <Col :span="24/colNum" v-for="(col, colIndex) in row" :key="colIndex">
            <div class="member-item pr"
                  :class="{active: col.cid===activeCid, myself: col.cid === msId}"
                  @click="creatSingleGroup(col)">
              <Icon type="ios-contact" v-if="col.cid === msId" color="#c77453" size="14" class="myself-icon pa"/>
              <span class="close-icon pa"
                    v-if="tempGroupInfo && tempGroupInfo.creatType !== 'SINGLE_TEMP_GROUP' && type === 'temp'"
                    @click="handleDelMember(col)">
                <Icon type="md-close" color="rgba(255, 255, 255, .8)" size="12"/>
              </span>
              <div class="img-wrap flex align-center justify-center">
                <img :src="iconImg(col)" alt="">
              </div>
            <div class="id" v-html="col.name"></div>
            </div>
          </Col>
        </Row>
    </div>
</template>

<script>
import mixin from '@/store/mixins/mixin'
import * as app from '@/store/types/app'
import * as types from '@/store/types/group'
import {debounce} from '@/utils/utils'
const DEL_MEMBER = 1

export default {
  name: 'GroupMemberList',
  mixins: [mixin],
  props: {
    list: Array,
    type: {
      type: String,
      default: 'normal'
    },
    colNum: {
      type: Number,
      default: 8
    },
    justifyType: {
      type: String,
      default: 'space-between'
    },
    gutter: {
      type: Number,
      default: 16
    },
    msId: String
  },
  computed: {
    activeCid () {
      return this.$store.getters.singleCallActiveCid
    },
    dragingMember: {
      get () {
        return this.$store.state.group.dragingMember
      },
      set (val) {
        this.$store.commit(types.SetDragingMember, val)
      }
    }
  },
  methods: {
    creatSingleGroup (item) {
      if (this.type==='normal') {
        this.$store.commit(app.SetAppLoading, true)
        this.$emit('on-select', item)
      }
    },
    handleDelMember (item) {
      let counts, mids
        this.$store.dispatch(types.EditTempGroup, {type: DEL_MEMBER, counts: 1, mids: item.cid})
        .then((res) => {
          this.messageAlert('success', '移除成功')
          this.getTempGroupInfo(res, 'TEMP_GROUP')
        })
        .catch(error => {
          console.log(error)
          this.messageAlert('warning', '移除失败')
        })
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
      box-shadow 0 0 3px 5px rgba(100, 139, 149, .2)
      border-radius 8px
      background #ffffff
      text-align center
      cursor pointer
      box-sizing border-box
      transition all .3s
      border 1px solid #ffffff
      user-select none
      width 110px
      height 70px
      margin 10px auto
      overflow hidden
      .myself-icon
        right 5px
        top 5px
      .close-icon
        top 0
        right 0
        height 17px
        width 17px
        border-bottom-left-radius 10px
        background rgba(0, 0, 0, .2)
        text-align center
        &:hover
          color rgba(0, 0, 0, .4)
      .img-wrap
        margin 8px auto
        img
          user-select none
          width 28px
      .id
        font-size 10px
        text-align center
      &:hover
        box-shadow 0 0 3px 5px rgba(239, 153, 46, .2)
        border 1px solid $color-sub-theme-border
        box-sizing border-box
        background $color-ssub-theme
        opacity .95
      &.active
        border 1px solid $color-ssub-theme-border
        background $color-sub-theme
        &:hover
          box-shadow 0 0 3px 5px rgba(239, 73, 46, .2)
          opacity .95
      &.myself
        background $color-ssub-theme
        border 1px solid $color-sub-theme-border


  .slider-in-active, .slider-out-active
    transition all 0.8s ease
  .slider-in-enter, .slider-out-active
    transform translateY(300px)
</style>
