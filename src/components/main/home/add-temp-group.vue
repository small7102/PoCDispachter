<template>
  <div class="group-wrap fl" key="add">
      <div class="group-item flex align-center justify-center add-btn" @click="handleSelectTempGroup()" v-if="!tempGroupInfo || tempGroupInfo.creatType">
        <icon type="ios-add" size="80"></icon>
      </div>
      <div class="group-item temp-group pr" v-else @click="selectTempGroup">
        <Icon type="md-close-circle" class="pa icon-close" size="24" color="red" @click.stop="handleClose"/>
            <div class="top">
              <div class="info-line title">
                <span>临时群组</span>
              </div>
              <div class="info-line">
                <span>名称:</span>
                <span class="">{{tempGroupInfo.name}}</span>
              </div>
              <div class="info-line">
                <span>创建人:</span>
                <span class="">{{tempGroupInfo.creater}}</span>
              </div>
              <div class="info-line">
                <span>群组成员:{{tempGroupInfo.length}}人</span>
              </div>
              <div class="info-line">
                <span>当前在线:{{tempGroupInfo.onlineLength}}人</span>
              </div>
            </div>
            <div class="bottom">
              <Button class="btn" @click.stop="isModalShow = !isModalShow" v-if="!tempGroupInfo.id">保存记录</Button>
            <div class="bottom flex between align-center" v-else>
              <span class="id">ID: {{tempGroupInfo.id}}</span>
              <icon type="ios-people" size="40" color="#4990d7"/>
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
          <Input autofocus placeholder="请输入群名称..." size="large" v-model="formInline.name"  @on-keydown.stop="handleKeyDown"/>
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
import * as app from '@/store/types/app'
import mixin from '@/store/mixins/mixin'
import Storage from '@/utils/localStorage'
import mx from './mixin'
import { token } from '@/libs/webDispatcher-sdk.js'

export default {
  name: 'AddTempGroup',
  mixins: [mixin, mx],
  props: {
    tempGroup: Object
  },
  computed: {
    tempGroupInfo () {
      console.log(this.$store.getters.tempGroupInfo)
      return this.$store.getters.tempGroupInfo
    }
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('名称不能为空'))
      } else if (value.length > 10) {
        return callback(new Error('不能大于10个字符'))
      } else {
        let myTempGroupList = this.getMyTempGroupList() || []
        console.log(myTempGroupList)
        let hasSameName = myTempGroupList.some(item => {
          return item.name === value
        })
        if (hasSameName) {
          return callback(new Error('改名称已存在'))
        } else {
          callback ()
        }
      }
    }
    return {
      isModalShow: false,
      hasCreatedTempGroupSuccess: false,
      tempGroupName: '临时群组',
      formInline: {
        name: ''
      },
      ruleInline: {
        name: [
          { validator: validateName, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleCommitTempGroup (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let myTempInfo = Storage.localGet('myTempInfo') || {}
          let user = this.$store.getters.userInfo.msId
          if (!myTempInfo[user]) myTempInfo[user] = []
          let obj = {...this.$store.getters.tempGroupInfo, name: this.formInline.name, id: (new Date()).valueOf()}
          myTempInfo[user].push(obj)

          // 临时群组存到本地
          Storage.localSet('myTempInfo', myTempInfo)
          // 修改展示数据
          this.$store.commit(types.SetNowStatus, `当前在${obj.name}临时群组`)
          this.$store.commit(types.SetTempGroupList, myTempInfo[user])
          this.$store.commit(types.SetTempGroupInfo, obj)
          this.isModalShow = false
          this.hasCreatedTempGroupSuccess = true
          this.formInline.name = ''
        }
      })
    },
    handleKeyDown (ev) {
      if (ev.code === 'Enter') {
        this.handleCommitTempGroup('formInline')
      }
    },
    selectTempGroup () {
      this.$emit('on-back')
    },
    getMyTempGroupList () {
      let myTempInfo = Storage.localGet('myTempInfo')
      let user = this.$store.getters.userInfo.msId
      return myTempInfo ? myTempInfo[user] : [] 
    },
    handleSelectTempGroup () {
      this.toCreatTempGroup({tempInfo: '', creatType: 'TEMP_GROUP'})
    },
    forbidTriggleVoice () {}
  }
}
</script>

<style lang="stylus" scoped>
  @import './block.styl'
  .btn
    width 100px
    background $color-theme-btn
    color #ffffff
    margin 20px auto 0
</style>


