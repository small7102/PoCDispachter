<template>
  <div class="member-wrap" :style="paddingLeftStyle">
    <CheckboxGroup v-model="selectList">
    <div v-for="(item, index) in memberList" 
          class="item flex align-center between" 
          :key="index" 
          :id="item.cid"
          :class="getActiveClass(item.cid, selectList)"
          :draggable="draggable"
          @click="selectItem(item.cid)"
          @dragstart="handleDragstart(item)"
          @dragend="handleDragend"
          >
          <div class="left flex align-center">
            <Checkbox :label="item.cid" class="label">
            </Checkbox>
            <img :src="iconImg(item)" alt="" class="img">
            <span class="name">{{item.name}}</span>
          </div>
          <div class="right" @click.stop=""
                             @mouseover="selectMember = item"
                             >
              <Icon type="md-mic-off" size="13" color="#ff633e" class="status" v-show="item.callset==='1'"/>
              <Icon type="ios-remove-circle-outline" size="13" class="status no-calling-listening" color="#ff633e" v-show="item.callset==='0'"/>
              <span @mouseover="handleMouseover">
                <Icon type="md-more"/>
              </span>
          </div>
    </div>
    </CheckboxGroup>
  </div>
</template>

<script>
import mixin from '@/store/mixins/mixin'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import { uniqueArr, filterArrByKey, filterObjArrByKey } from '@/utils/utils'
const ADD_MEMBER = 0

export default {
  name: 'MemberList',
  mixins: [mixin],
  props: {
    gid: String,
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
    },
    draggable () {
      return this.tempGroupInfo && this.tempGroupInfo.creatType !== 'SINGLE_TEMP_GROUP'
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
  mounted () {
    let membersWrap = document.getElementById('membersWrap')
    if (membersWrap) {
      membersWrap.ondrop = (ev) => {
        this.editingTempGroup()
      }
      membersWrap.ondragover = ev => {
        ev.preventDefault()
      }
    }
  },
  data () {
    return {
      tempList: [],
      selectListLength: 0,
      selectMember: null,
      memberList: []
    }
  },
  methods: {
    hasCid (cid, list) {
      return list.some(item => {
          return item === cid
      })
    },
    getActiveClass (cid, list) {
      if (list) {
        let hasCid = this.hasCid(cid, list)
        return hasCid ? 'active' : ''
      } else {
        return true
      }
    },
    getScrollDistance (list) {
      if (list.length && this.$store.getters.isSearch) {
        let element = document.getElementById(list[0])
        let distance = 0
        while (element && element.offsetParent && element.offsetParent.id !== 'treeScroll') {
          distance += element.offsetTop
          element = element.offsetParent
        }
        this.$emit('on-scroll', distance)
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
      }
      this.$store.commit(types.SetTreeGroupSelectedList, newArr)
    },
    handleMouseover (ev) {
      this.$emit('on-hover', {top: ev.y, item: this.selectMember, show: true})
    },
    handleDragstart (item) {
      console.log(this.selectList)
      if (!this.selectList.length) {
        this.dragingMember = item
        console.log(this.dragingMember)
      } else {
        // this.dragMembers = this.selectList
      }
    },
    handleDragend () {
      this.dragingMember = null
    },
    editingTempGroup () {
      let counts, mids
      if (this.dragingMember) {
        if (!Array.isArray(this.dragingMember)) {
          counts = 1,
          mids = this.dragingMember.cid
        }
        this.$store.dispatch(types.EditTempGroup, {type: ADD_MEMBER, counts, mids})
        .then((res) => {
          this.messageAlert('success', '添加成功')
          this.getTempGroupInfo(res, 'TEMP_GROUP')
          this.dragingMember = null
        })
        .catch(error => {
          console.log(error)
          this.messageAlert('warning', '对方正忙')
          this.dragingMember = null
        })
      }
    }
  },
  watch: {
    selectList (list) {
      this.getScrollDistance(list)
    },
    memberObj (list) {
      this.memberList = this.memberObj[this.gid]
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
  .right-menu
    right 0
    top 50px
    height 300px
    width 100px
  .item
    padding 0 10px
    text-align left
    cursor pointer
    margin-bottom 3px
    .left 
      width 140px
      overflow hidden
      text-overflow ellipsis
      white-space nowrap     
    &.active
      background $color-theme-light-l
    &:hover
      background $color-theme-light-ll
    .img
      width 20px
      margin-right 5px
    .status
      cursor default
    .no-calling-listening
      font-weight bold !important
  .label
    font-size 0
</style>
