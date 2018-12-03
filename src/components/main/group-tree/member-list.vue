<template>
  <div class="member-wrap" :style="paddingLeftStyle">
    <CheckboxGroup v-model="selectList">
    <div v-for="(item, index) in memberList" 
          class="item flex align-center" 
          :key="index" 
          :ref="item.cid" 
          :class="getActiveClass(item.cid, selectList)"
          @click="selectItem(item.cid)">
      <Checkbox :label="item.cid" class="label">
      </Checkbox>
        <img :src="iconImg({terminalType: item.type, online: item.online})" alt="" class="img">
        <span class="name">{{item.name}}</span>
    </div>
    </CheckboxGroup>
  </div>
</template>

<script>
import mixin from '@/store/mixins/mixin'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import { uniqueArr, filterArrByKey, filterObjArrByKey } from '@/utils/utils'

export default {
  name: 'MemberList',
  mixins: [mixin],
  props: {
    memberList: {
      type: Array,
      default: () => []
    },
    paddingLeftStyle: {
      type: Object,
      default: () => {
        return {
          paddingLeft: '24px'
        }
      }
    }
  },
  computed: {
    selectList: {
      get () {
        return this.$store.getters.treeGroupSelectedList
      },
      set (val) {
        this.$store.commit(types.SetTreeGroupSelectedList, val)
      }
    }
  },
  data () {
    return {
      tempList: [],
      selectListLength: 0
    }
  },
  methods: {
    hasCid (cid, list) {
      return list.some(item => {
          return item === cid
      })
    },
    getActiveClass (cid, list) {
      let hasCid = this.hasCid(cid, list)
      return hasCid ? 'active' : ''
    },
    getScrollDistance (list) {
      if (list.length === 1 && this.$store.getters.isSearch) {
        let element = this.$refs[list[0]]
        if (element) {
          let ele = element[0]
          let distance = element[0].offsetTop
          this.$emit('on-scroll', distance)
        }
      }
    },
    selectItem(cid) {
      let newArr = [...this.selectList]
      let hasCid = this.hasCid(cid, newArr)
      if (!hasCid) {
        newArr.push(cid)
      } else {
        let index = newArr.indexOf(cid)
        newArr.splice(index, 1)
        console.log(newArr)
      }
      this.$store.commit(types.SetTreeGroupSelectedList, newArr)
    }
  },
  watch: {
    selectList (list) {
      this.getScrollDistance(list)
    }
  }
}
</script>

<style lang="stylus">
  @import './reset.styl'
</style>

<style lang="stylus" scoped>
@import '../../../assets/styles/variable.styl';
.member-wrap
  line-height: 40px
  .item
    padding 0 10px
    text-align left
    cursor pointer
    margin-bottom 3px
    &.active
      background $color-theme-light-l
    &:hover
      background $color-theme-light-ll
    .img
      width 20px
      margin-right 5px
  .label
    font-size 0
</style>
