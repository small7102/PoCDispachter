<template>
  <div class="block-group-wrap scroll-bar">
    <div class="block-container clearfix" :style="containerWidth">
      <div class="group-wrap fl">
        <div class="group-item flex align-center justify-center add-btn" @click="addTempGroup" v-if="!hasTempGroup">
          <icon type="ios-add" size="80"></icon>
        </div>
        <div class="group-item flex temp-group pr" v-else @click="selectTempGroup">
          <Icon type="md-close-circle" class="pa icon-close" size="24" color="red" @click.stop="handleClose"/>
             <div class="flex-item">
              <div class="info-line title">
                <span>群组:</span>
                <span class="">{{tempGroupName}}</span>
              </div>
              <div class="info-line">
                <span>群组成员:{{tempGroupNum}}人</span>
              </div>
             </div>
             <div class="bottom">
               <Button class="btn" @click.stop="isModalShow = !isModalShow" v-if="!hasCreatedTempGroupSuccess">保存记录</Button>
              <div class="bottom flex between align-center" v-else>
                <span class="id">ID: {{tempGroupId}}</span>
                <icon type="ios-people" size="40" color="#4990d7"/>
              </div>
             </div>
        </div>
      </div>
      <div class="clearfix fl">
        <div class="group-wrap fl" v-for="(item, index) in groupList" :key="index" @click="selectGroup(item)">
        <div class="group-item flex" :class="{active: item.gid === activeGid}">
          <div class="top flex flex-item">
            <div class="item-info flex-item">
              <div class="info-line title">
                <span>群组:</span>
                <span class="">{{item.name}}</span>
              </div>
              <div class="info-line">
                <span>群组成员:{{membersList[item.gid].length}}人</span>
              </div>
              <div class="info-line">
                <span>当前在线:</span>
                <span v-html="getOnlinePercent(membersList[item.gid])"></span>
              </div>
            </div>
          </div>

          <div class="bottom flex between align-center">
              <span class="id">ID: {{item.gid}}</span>
              <icon type="ios-people" size="40" color="#4990d7"/>
          </div>
        </div>
        </div>
      </div>
    </div>
    <Modal
        v-model="isModalShow"
        title="临时群组名称"
        width="400"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline" :model="formInline" :rules="ruleInline">
          <FormItem prop="name">
          <Input autofocus placeholder="请输入群名称..." size="large" v-model="formInline.name"/>
          </FormItem>
          <FormItem :style="{textAlign: 'center'}">
            <Button type="primary" @click="handleCommitTempGroup('formInline')" class="btn">确定</Button>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
import * as types from '@/store/types/group'
import * as userTypes from '@/store/types/user'
import { getTreeList } from '@/utils/utils'
import Storage from '@/utils/localStorage'
import mixin from '@/store/mixin'

export default {
  name: 'BlockGroup',
  props: {
    tempGroup: Object,
    isRemoving: Boolean,
    singleName: {
      type: String,
      default: ''
    }
  },
  mixins: [mixin],
  data () {
    return {
      slectedGroup: '',
      hasTempGroup: false,
      spinShow: false,
      activeGid: '',
      openedGroup: [],
      hasCreatedTempGroupSuccess: false,
      tempGroupName: '临时群组',
      tempGroupId: '',
      tempGroupNum: 0,
      temGroupMember: [],
      isModalShow: false,
      formInline: {
        name: ''
      },
      ruleInline: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { type: 'string', max: 14, message: '名字长度不大于14', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    groupList () {
      let groupList = this.$store.getters.originGroupList
      return groupList
    },
    membersList () {
      let memberList = this.$store.getters.memberList
      return memberList
    },
    containerWidth () {
      return this.getContainerWidth()
    }
  },
  methods: {
    getOnlinePercent (membersListItem) {
      if (!membersListItem) return

      let onlineList = membersListItem.filter(item => {
        return item.online === '1'
      })

      let onlineNum = onlineList.length
      return `${onlineNum}人`
    },
    getContainerWidth () {
      let len = this.groupList.length
      return {
        width: `${(len + 1) * 224}px`
      }
    },
    selectGroup (item) {
      this.$store.dispatch(userTypes.SwitchGroup, item).then(res => {
        switch (res) {
          case 0:
            this.messageAlert('success', `您已成功切换群组至${item.name}`)
            this.upMyself('switch')
            this.activeGid = item.gid
            console.log(`${item.name}的gid${item.gid}???${this.activeGid}`)
            this.initMemberList() // 变化成员列表

            if (this.hasTempGroup) this.$store.commit(types.SetNowStatus, `当前处于群组${item.name}&&正在与${this.tempGroupName}通信...`)
            if (this.singleName) this.$store.commit(types.SetNowStatus, `当前处于群组${item.name}&&正在与${this.singleName}通信...`)
            let opened = item.gid
            let list = this.$store.getters.originGroupList

            let openedIndex = this.openedGroup.indexOf(opened)
            if (openedIndex > -1) { // 点击deep值比上次deep小
              this.openedGroup = this.openedGroup.slice(openedIndex)
              this.commitOpenGroup(this.openedGroup)
              return
            }
            this.openedGroup = []
            this.openedGroup.push(opened)
            getTreeList(list, item.fid, this.openedGroup)
            this.commitOpenGroup(this.openedGroup)
            break
          case 1:
            this.messageAlert('info', '此群组ID不存在')
            break
          default:
            this.messageAlert('info', '不再此群组')
        }
      })
    },
    selectTempGroup () {
      let list = this.$store.getters.tempGroupMembers
      this.$emit('on-back', list)
    },
    commitOpenGroup (openedGroup) {
      this.activeGid = openedGroup[0]
      this.$store.commit(types.SetOpenGroup, openedGroup)
    },
    addTempGroup () { // 创建临时群组
      this.$store.dispatch(types.CreatTempGroup).then(len => {
        console.log(len)
        switch (len) {
          case 0:
            this.messageAlert('error', '请选择临时群组成员')
            break
          case 1:
            this.messageAlert('error', '您不能与自己创建单呼')
            break
          default:
            this.messageAlert('success', '创建临时群组成功')
            this.$store.commit(types.SetNowStatus, '创建了临时群组')
            this.activeGid = ''
            this.tempGroupNum = len
            this.hasTempGroup = true
        }
      })
    },
    handleClose () { // 关闭临时群组
      this.hasTempGroup = false
      this.$store.dispatch(types.RemoveTempGroup, '0').then(() => {
        this.messageAlert('success', '解散临时群组成功')
        let groupName = ''
        let groupList = this.$store.getters.originGroupList
        for (let value of groupList) {
          if (value.gid === this.activeGid) {
            groupName = value.name
          }
        }
        this.$store.commit(types.SetNowStatus, `当前所在群组${groupName}`)
        this.$emit('on-quit')
      })
    },
    handleCommitTempGroup (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let obj = {}
          obj.name = this.formInline.name
          obj.membersList = this.temGroupMember
          obj.id = (new Date()).valueOf()

          this.toSetStorage('tempGroup', obj)
          // 修改展示数据
          this.tempGroupName = obj.name
          this.tempGroupId = obj.id
          this.isModalShow = false
          this.hasCreatedTempGroupSuccess = true
          this.formInline.name = ''
        }
      })
    },
    toSetStorage (key, value) {
      let keyItem = Storage.localGet(key)
      keyItem = !keyItem ? [] : keyItem
      keyItem.push(value)

      this.$store.commit(types.SetTempGroupList, keyItem)
      Storage.localSet(key, keyItem)
    },
    initMemberList () { // 初始化groupMember
      let memberList = this.$store.getters.memberList
      console.log(this.activeGid)
      console.log(memberList[this.activeGid])
      this.$emit('on-init', memberList[this.activeGid])
    }
  },
  watch: {
    groupList () {
      let openGroup = this.$store.getters.openGroup
      this.openedGroup = [...openGroup]
      this.activeGid = openGroup[0]
      this.initMemberList()
    },
    tempGroup (val) { // 检测切换临时群组
      this.addTempGroup()
      this.hasCreatedTempGroupSuccess = true
      this.tempGroupName = val.name
      this.tempGroupId = val.id
    },
    isRemoving (val) {
      this.hasTempGroup = false
    }
  }
}
</script>

<style lang="stylus">
  .block-group-wrap.ivu-icon-ios-checkmark-circle
    font-size 20px
</style>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .btn
    width 100px
    background $color-theme-btn
    color #ffffff
    margin 20px auto 0
  .block-group-wrap
    background $color-theme
    height 308px
    margin-bottom 3px
    padding-left 26px
    overflow auto
    .block-container
      width auto
    .group-item
      height 240px
      width 202px
      border-radius 12px
      background #ffffff
      margin 36px 22px 0 0
      box-shadow 0 0 3px 5px rgba(100, 139, 149, .2)
      padding 20px
      cursor pointer
      flex-direction column
      transition all .3s
      .item-info
        width 100%
      .info-line
        height 30px
        text-align left
      .title
        font-size 16px
        color #000000
        overflow hidden
        text-overflow ellipsis
        white-space nowrap
        height 40px
      .bottom
        height 80px
        .id
          font-size 12px
      .label
        font-size 0
      &.active
        border 2px solid rgb(73, 144, 215)
        box-shadow 0 0 3px 5px rgba(73, 144, 215, .35)
        background $color-sub-theme
    .add-btn
      transition all .3s
      &:hover
        border 1px solid $color-theme
        i
          color $color-theme
    .temp-group
      background #b7f5a8
      text-align center
      .icon-close
        top -8px
        right -8px
</style>
