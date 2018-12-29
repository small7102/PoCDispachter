<template>
  <div class="send-message-wrap flex">
    <Input class="flex-item i-textarea" 
           ref="inp"
           type="textarea" 
           :placeholder="languageCtx.sendMessage.placeholder"
           :autosize="{minRows: 2,maxRows: 2}" 
           @on-keydown.stop="forbidTriggleVoice" 
           v-model="sendingMessage"></Input>
    <Button class="send-btn" size="small" shape="circle" @click="handleSendMessage">{{languageCtx.sendMessage.sendBtnText}}</Button>
  </div>
</template>

<script>
import mixin from '@/store/mixins/message'
import {sendSMS} from '@/libs/webDispatcher-sdk.js'
import * as types from '@/store/types/group'
import {Message} from '@/libs/dom'
import {dateFmt} from '@/utils/utils'
import language from './mixin'

export default {
  name: 'SendMessage',
  mixins: [mixin, language]
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
    padding 5px 10px 40px
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
