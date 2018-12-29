<template>
  <div class="wrap">
    <Modal
        v-model="isModalShow"
        :title="title"
        width="400"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline">
          <FormItem>
            <RadioGroup v-model="callingStatus">
              <div class="line mt5">
                <Radio label="activation">激活</Radio>
              </div>
              <div class="line mt5">
                <Radio label="noCalling">遥晕</Radio>
              </div>
              <div class="line mt5">
              <Radio label="noListenAndCalling">遥毙</Radio>
              </div>
            </RadioGroup>
          </FormItem>
          <FormItem :style="{textAlign: 'center'}">
            <Button type="primary" class="btn" @click="handleSubmit()">确定</Button>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
import * as group from '@/store/types/group'
import * as log from '@/store/types/log'
import {codeConfig} from '@/libs/codeConfig'
export default {
  name: 'CallingStatus',
  props: {
    member: Object,
  },
  computed: {
    membersObj: {
      get () {
        return this.$store.getters.memberList
      },
      set (val) {
        this.$store.commit(group.SetMemberList, val)
      }
    },
    user () {
      return this.$store.state.user.userInfo
    }
  },
  data () {
    return {
      isModalShow: false,
      callingStatus: '',
      title: ''
    }
  },
  methods: {
    handleSubmit () {
      this.$store.dispatch(group.SetCallSet, {
        gid: this.member.grp,
        mid: this.member.cid,
        type: this.changeKey()
      })
      .then(() => {
        let obj = {...this.member, callset: this.changeKey()}
        let list = this.membersObj[this.member.grp]
        const newList = list.map(item => {
          let value = {...item}
          if (value.cid === obj.cid) value = obj
          return value
        })
        this.membersObj = {item: newList, gid: obj.grp}
        this.isModalShow = false
        this.$store.commit(log.SaveLog, {
          account: this.user.msId,
          name: this.user.msName,
          type: codeConfig.callsetNotice,
          remark: `将${this.member.name}${this.getDescStatus()}`
        })
        this.$emit('on-over')
        this.messageAlert('info', '设置成功')
      })
      .catch(() => {
        this.isModalShow = false
        this.messageAlert('warning', '没有权限设置')
        this.$emit('on-over')
      })
    },
    initInfo () {
      this.callingStatus = this.member.callset === '8' ? 'activation' : this.member.callset === '0' ? 'noListenAndCalling' : 'noCalling'
      this.title = `${this.member.name}通话状态`
    },
    changeKey () {
      return this.callingStatus === 'activation' ? '8' : this.callingStatus === 'noListenAndCalling' ? '0' : '1'
    },
    getDescStatus () {
     return this.member.callset === '8' ? '激活' : this.member.callset === '0' ? '遥毙' : '遥晕' 
    }
  },
  watch: {
    isModalShow (val) {
      val && this.initInfo()
    }
  }
}
</script>

