<template>
  <div class="send-message-wrap flex">
    <i-input type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入..." class="flex-item i-textarea"/>
    <i-button class="send-btn" size="small">发送</i-button>
  </div>
</template>

<script>
import { Input, Button } from 'iview'

export default {
  name: 'SendMessage',
  components: {
    'i-input': Input,
    'i-button': Button
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
