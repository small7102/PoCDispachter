<template>
  <div class="temp-wrap">
      <Card class="card" shadow>
        <p slot="title" class="title">
           已选成员
        </p>
        <template v-if="!mapTempMemberList.length">
          <div class="none">您还没有选中的成员</div>
          <div class="flex justify-center">
            <Button class="select-btn" @click="selectFullScreen">选择当前屏幕成员</Button>
          </div>
          <div class="flex justify-center">
            <Button class="select-btn" @click="selectPartScreen" :disabled="isDisable">框选局部屏幕成员</Button>
          </div>
        </template>
        <template v-else>
          <div class="member-wrap">
            <div class="member-list scroll-bar">
              <div
                class="member-item flex align-center between"
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
            <div class="btn-wrap flex between">
              <Button class="btn theme-btn" size="small" v-if="!hasMapTempGroup" @click="handleCreateTempGroup">临时群组</Button>
              <Button class="btn cancel" size="small" v-else @click="handleClose">取消</Button>
              <Button class="btn theme-btn" size="small">消息</Button>
            </div>
          </div>
        </template>
      </Card>
    </div>
</template>

<script>
import mixin from '@/store/mixins/createTempGroup'
import * as map from '@/store/types/map'

export default {
  name: 'TempMember',
  mixins: [mixin],
  computed: {
    mapTempMemberList () {
      return this.$store.getters.mapTempMemberList
    },
    hasMapTempGroup: {
      get () {
        return this.$store.getters.hasMapTempGroup
      },
      set (val) {
        this.$store.commit(map.SetHasMapTempGroup, val)
      }
    }
  },
  data () {
    return {
      isDisable: false
    }
  },
  methods: {
    handleDeletMember (item) {
      let list = [...this.mapTempMemberList]
      let itemIndex
      list.forEach((value, index) => {
        if (value.cid === item.cid) itemIndex = index
      })
      list.splice(itemIndex, 1)
      this.$emit('on-delete', item.cid)
      this.$store.commit(map.SetMapTempMemberList, list)
    },
    handleCreateTempGroup () {
      this.toCreatTempGroup({tempInfo: '', creatType: 'TEMP_GROUP_MAP'})
      this.$emit('on-create')
    },
    selectFullScreen () {
      this.$emit('on-select', {type: 'full'})
    },
    selectPartScreen () {
      this.isDisable = true
      this.$emit('on-select', {type: 'part'})
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
  transform translateY(-70%)
  z-index 99999
  .none
    font-size 12px
    color #888
    text-align center
    line-height 30px
  .card
    width 200px
    height 350px
    .title
      text-align center
  .member-list
    height 240px
    overflow scroll
    .member-item
      padding 0 5px
      height 32px
      border-radius 6px
      border 1px solid #eaeaea
      margin-bottom 10px
      .icon-close
        cursor pointer
        &:hover
          color $color-theme
    .img
      width 20px
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
</style>
