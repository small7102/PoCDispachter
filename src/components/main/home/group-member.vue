<template>
    <div class="group-member-wrap scroll-bar pr" id="membersWrap">
      <member-list :list="rowMemberList" 
                  v-if="memberListShow" 
                  @on-select="creatSingleGroup"
                  :msId="msId"
                  :colNum="colNum"
                  />
      <member-list v-else
                  type="temp"
                  :list="rowTempMemberList"
                  :msId="msId"
                  :colNum="colNum"
                  />
      <div class="add-mask pa w100 h100 flex align-center justify-center" v-if="dragingMember">
        <div class="content flex shine">
          <Icon type="ios-add-circle-outline" color="rgba(255, 255, 255, .8)" size="60"/>
          <div class="text">在此添加</div>
        </div>
      </div>
    </div>
</template>
<script>
import mixin from '@/store/mixins/mixin'
import addTemp from '@/store/mixins/createTempGroup'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import {sliceArr, uniqueArr} from '@/utils/utils'
import {Row, Col} from 'iview'
import MemberList from './member-list'

export default {
  name: 'GroupMemberWrap',
  mixins: [ mixin, addTemp ],
  components: {
    MemberList
  },
  props: {
    memberList: Array
  },
  data () {
    return {
      msId: '',
      memberListShow: true,
      nowSelectedSingleCallGid: '',
      rowMemberList: [],
      rowTempMemberList: [],
      colNum: 8,
      gutter: 16
    }
  },
  computed: {
    tempList () {
      let list = this.$store.getters.groupTempList
      return list
    },
    tempGroupInfo: {
      get () {
        return this.$store.getters.tempGroupInfo
      },
      set (val) {
        this.$store.commit(types.SetTempGroupInfo, val)
      }
    },
    singleCallActiveCid: {
      get () {
        return this.$store.getters.singleCallActiveCid
      },
      set (val) {
        this.$store.commit(types.SetSingleCallActiveCid, val)
      }
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
  mounted() {
    this.setColNum()

    window.addEventListener('resize', () => {
      this.setColNum()
    })
  },
  methods: {
    setColNum () {
      if (document.body.clientWidth <= 1500) {
        this.colNum = 4
      } else if (document.body.clientWidth > 1500 && document.body.clientWidth <= 1800) {
        this.colNum = 6
      } else {
        this.colNum = 8
      }
    },
    creatSingleGroup (item) {
      if (this.singleCallActiveCid !== item.cid) {
        this.singleCallActiveCid = item.cid
        this.toCreatTempGroup({tempInfo: '', creatType: 'SINGLE_TEMP_GROUP', cids: item.cid})
      } else {
        this.handleClose()
      }
    },
    myselfStyl () {
      let id = this.$store.getters.userInfo.msId
      this.msId = id
    },
    justifyType (index) {
     return index === (this.rowMemberList.length - 1) ? 'start' : 'space-between'
    },
    initMemberList (list, bool) {
      this.memberListShow = bool
      this.myselfStyl()
      return sliceArr(list, this.colNum) 
    },
    renderMemberList ({memberList, isMemberListShow, type}) {
      if (!memberList || !memberList.length) {
        this.memberListShow = isMemberListShow
      } else {
        if (type === 'temp') {
          this.rowTempMemberList = this.initMemberList(memberList, !isMemberListShow)
        } else {
          this.rowMemberList = this.initMemberList(memberList, !isMemberListShow)
        }
      }
    }
  },
  watch: {
    memberList (val) {
      let list = uniqueArr(val, 'cid')
      this.renderMemberList({memberList: list, isMemberListShow: false})
    },
    tempList (newList, oldList) {
      if (!this.singleCallActiveCid || !this.singleCallActiveCid.length) {
        this.renderMemberList({memberList: newList, isMemberListShow: true, type: 'temp'})
      }
    },
    colNum (val) {
      if (this.memberListShow) {
        this.renderMemberList({memberList: this.memberList, isMemberListShow: false})
      } else {
        this.renderMemberList({memberList: this.tempList, isMemberListShow: true, type: 'temp'})
      }
    },
    tempGroupInfo (newVal, oldVal) {
      if (!newVal && oldVal.type !== 0) {
        this.renderMemberList({memberList: this.memberList, isMemberListShow: false})
      } 
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .group-member-wrap
    background $color-theme
    height 100%
    padding 36px 40px
    overflow-y auto
    .add-mask
      top 0
      left 0
      z-index 10
      background rgba(0, 0, 0, .35)
      .content
        color #ffffff
        text-align center
        height 150px
        width 300px
        border 2px dashed rgba(255, 255, 255, .6)
        flex-direction column
        justify-content space-around
      .text
        font-size 20px  
    .member-item
      box-shadow 0 0 3px 5px rgba(100, 139, 149, .2)
      border-radius 8px
      background #ffffff
      margin-bottom 20px
      padding-bottom 14px
      text-align center
      cursor pointer
      overflow hidden
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
        background $color-ssub-theme
        border 1px solid $color-sub-theme
  .slider-in-active, .slider-out-active
    transition all 0.8s ease 
  .slider-in-enter, .slider-out-active
    transform translateY(300px)
</style>
