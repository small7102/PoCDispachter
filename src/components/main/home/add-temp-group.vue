<template>
  <div class="group-wrap fl" key="add">
      <div class="group-item flex align-center justify-center add-btn" @click="handleSelectTempGroup()" v-if="!tempGroupInfo || tempGroupInfo.creatType === 'SINGLE_TEMP_GROUP'">
        <icon type="ios-add" size="80"></icon>
      </div>
      <div class="group-item temp-group pr" v-else @click="selectTempGroup">
          <div  class="pa icon-close"  @click.stop="handleClose">
              <Icon type="md-close" size="16" color="rgba(255,255,255,.8)"/>
          </div>
            <div class="top">
              <div class="info-line title">
                <span>{{languageCtx.addTempGroup.title}}</span>
              </div>
              <div class="info-line">
                <span>{{languageCtx.addTempGroup.name}}:</span>
                <span class="">{{tempGroupInfo.name}}</span>
              </div>
              <div class="info-line">
                <span>{{languageCtx.addTempGroup.creater}}:</span>
                <span class="">{{tempGroupInfo.creater}}</span>
              </div>
              <div class="info-line">
                <span>{{languageCtx.addTempGroup.memberLength}}:{{tempGroupInfo.length}}人</span>
              </div>
              <div class="info-line">
                <span>{{languageCtx.addTempGroup.onlineLength}}:{{tempGroupInfo.onlineLength}}人</span>
              </div>
            </div>
            <div class="bottom">
              <Button class="btn" @click.stop="isModalShow = !isModalShow" v-if="!tempGroupInfo.id">{{languageCtx.addTempGroup.saveBtnText}}</Button>
            <div class="bottom flex between align-center" v-else>
              <span class="id">ID: {{tempGroupInfo.id}}</span>
              <icon type="ios-people" size="40" color="#4990d7"/>
            </div>
            </div>
      </div>

      <Modal
        v-model="isModalShow"
        :title="languageCtx.addTempGroup.tempGroupTitle"
        width="400"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline" :model="formInline" :rules="ruleInline">
          <FormItem prop="name">
          <Input autofocus :placeholder="languageCtx.addTempGroup.placeholder" size="large" v-model="formInline.name"  @on-keydown.stop="handleKeyDown"/>
          </FormItem>
          <FormItem :style="{textAlign: 'center'}">
            <Button type="primary" @click="handleCommitTempGroup('formInline')" class="btn">{{languageCtx.addTempGroup.submitText}}</Button>
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
import addTemp from '@/store/mixins/createTempGroup'
import { token } from '@/libs/webDispatcher-sdk.js'
import language from './mixin'

export default {
  name: 'AddTempGroup',
  mixins: [mixin, addTemp, language],
  props: {
    tempGroup: Object
  },
  computed: {
    tempGroupInfo: {
      get () {
        return this.$store.getters.tempGroupInfo
      },
      set (val) {
        this.$store.commit(types.SetTempGroupInfo, val)
      }
    }
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.languageCtx.addTempGroup.noNameAlert))
      } else if (value.length > 10) {
        return callback(new Error(this.languageCtx.addTempGroup.nameLengthAlert))
      } else {
        let myTempGroupList = this.getMyTempGroupList() || []
        let hasSameName = myTempGroupList.some(item => {
          return item.name === value
        })
        if (hasSameName) {
          return callback(new Error(this.languageCtx.addTempGroup.repeatNameAlert))
        } else {
          callback ()
        }
      }
    }
    return {
      isModalShow: false,
      hasCreatedTempGroupSuccess: false,
      tempGroupName: '',
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
          let obj = {...this.tempGroupInfo, name: this.formInline.name, id: (new Date()).valueOf()}
          myTempInfo[user].unshift(obj)

          // 临时群组存到本地
          Storage.localSet('myTempInfo', myTempInfo)
          // 修改展示数据
          this.tempGroupInfo = obj
          this.$store.commit(types.SetNowStatus, `${obj.name}${this.languageCtx.addTempGroup.title}`)
          this.$store.commit(types.SetTempGroupList, myTempInfo[user])
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
      this.toCreatTempGroup({tempInfo: '', creatType: 'TEMP_GROUP',cids: this.$store.getters.treeGroupSelectedList})
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


