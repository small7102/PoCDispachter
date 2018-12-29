<template>
  <div class="message-wrap">
    <div class="no-message" v-if="!messageList.length">
      {{languageCtx.sendMessage.noMessage}}
    </div>
    <div class="message-box">
      <div v-for="(item, index) in messageList" :key="index">
        <message-item 
          :time="item.time"
          :msName="item.msName"
          :others="item.others"
          :msg="item.msg"
          :arrow="item.arrow"/>
      </div>
    </div>
  </div>
</template>

<script>
import MessageItem from '@/components/base/message-item'
import language from './mixin'

export default {
  name: 'MessageList',
  mixins: [language],
  components: {MessageItem},
  computed: {
    messageList () {
      return this.$store.getters.messageList
    }
  }
}
</script>

<style lang="stylus" scoped>
.message-wrap
  &::after
    content ''
    display block
    height 10px
.no-message
  text-align center
  line-height 60px
</style>


