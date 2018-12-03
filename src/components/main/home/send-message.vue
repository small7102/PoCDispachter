<template>
  <div class="send-message-wrap flex">
    <Input class="flex-item i-textarea" 
           type="textarea" 
           placeholder="请输入..."
           :autosize="{minRows: 2,maxRows: 2}" 
           @on-keydown.stop="forbidTriggleVoice" 
           v-model="sendingMessage"></Input>
    <Button class="send-btn" size="small" shape="circle" @click="handleSendMessage">发送</Button>
  </div>
</template>

<script>
import mixin from '@/store/mixins/mixin'
import {sendSMS} from '@/libs/webDispatcher-sdk.js'
import * as types from '@/store/types/group'
import {Message} from '@/libs/dom'
import {dateFmt} from '@/utils/utils'

export default {
  name: 'SendMessage',
  mixins: [mixin],
  data () {
    return {
      sendingMessage: ''
    }
  },
  methods: {
    forbidTriggleVoice (ev) {
      if (ev.code === 'Enter') {
        this.handleSendMessage(ev)
        return false
      }
    },
    handleSendMessage (event) {
      this.sendingMessage = this.sendingMessage.replace(/[\r\n]/g,"")
      this.sendingMessage = this.sendingMessage.replace(/\ +/g,"")
      if (!this.sendingMessage) {
        event.cancelBubble=true
        event.preventDefault()
        event.stopPropagation()
        this.messageAlert('warning', '发送信息不能为空')
      } else {
        this.$store.dispatch(types.SendSMS, {mid: '', msName: this.$store.getters.userInfo.msName, msg: this.sendingMessage}).then(() => {
          let message = new Message({
            time: dateFmt("hh:mm:ss", new Date()),
            msName: this.$store.getters.userInfo.msName,
            msg: this.sendingMessage,
            arrow: '>>',
            list: [...this.$store.getters.messageList]
          })

          message.addMessage()
          this.$store.commit(types.SetMessageList, message.list)
          this.sendingMessage = ''
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'
  textarea.ivu-input
    &:focus
      border none

  .send-message-wrap
    width 100%
    background #f3f3f3
    padding 10px 10px 40px
    .i-textarea
      textarea
        &:focus
          border none
    .send-btn
      width 80px
      height 30px
      color #ffffff
      background $color-theme-btn
      margin-left 10px
</style>
