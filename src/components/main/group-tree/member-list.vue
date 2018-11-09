<template>
  <div class="member-wrap" :style="paddingLeftStyle">
    <CheckboxGroup @on-change="handleSelectMember" v-model="selectList">
    <div v-for="(item, index) in memberList" :key="index" class="item flex align-center">
      <Checkbox :label="item.cid" class="label">
      </Checkbox>
        <img :src="iconImg(item.type, item.online)" alt="">
        <span class="name">{{item.name}}</span>
    </div>
    </CheckboxGroup>
  </div>
</template>

<script>
import mixin from '@/store/mixin'
import * as types from '@/store/types/group'
import { uniqueArr, filterArrByKey } from '@/utils/utils'

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
          paddingLeft: '44px'
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
        console.log(val)
        this.$store.commit(types.SetTreeGroupSelectedList, val)
      }
    }
  },
  data () {
    return {
      tempList: []
      // selectList: []
    }
  },
  methods: {
    handleSelectMember (res) {
      let selectMembers = filterArrByKey(res, this.memberList, 'cid') // 根据cid选出items
      let nowSelectTempMember = this.$store.getters.tempGroupMembers

      if (res.length > nowSelectTempMember.length) { // 同一组选择成员
        nowSelectTempMember = selectMembers
      } else { // 跨群组选择成员
        nowSelectTempMember = nowSelectTempMember.concat(selectMembers)
      }

      let newArr = uniqueArr(nowSelectTempMember)
      this.$store.commit(types.SetTempGroupMembers, newArr)
    }
  }
}
</script>

<style>
  .member-wrap {
    padding: 0 44px;
    line-height: 40px
  }
  .item {
    text-align: left
  }
</style>

<style lang="stylus">
  @import './reset.styl'
</style>

<style lang="stylus" scoped>
  .label
    font-size 0
</style>
