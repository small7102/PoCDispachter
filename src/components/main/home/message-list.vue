<template>
  <div class="message-wrap h100 flex direction-column">
    <div class="no-message" v-if="!messageList.length">
      暂无消息
    </div>
    <div class="message-box scroll-bar h100 flex-item">
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

export default {
  name: 'MessageList',
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
  margin-top 10px
  overflow hidden
  &::after
    content ''
    display block
    height 10px
  .message-box
    overflow scroll
.no-message
  text-align center
  line-height 60px
</style>


