<template>
  <div class="message-item-wrap">
    <div class="top-info flex align-items">
      <span class="time" v-html="time"></span>
      <div class="flex-item">
        <span v-html="msName"></span>
        <span>{{arrow}}</span>
        <span v-html="others"></span>
      </div>
    </div>

    <div class="message" v-html="msg"></div>
  </div>
</template>

<script>
export default {
  name: 'MessageItem',
  props: {
    time: String,
    msName: String,
    others: String,
    msg: String,
    arrow: String
  }
}
</script>

<style lang="stylus" scoped>
.message-item-wrap
  padding 0 20px
  .top-info
    color #6c6c6c
    .time
      padding-right 5px
  .message
    background #f3f3f3
    border-radius 6px
    border 1px solid #eaeaea
    padding 8px
    margin 5px 0 10px
    line-height 1.62
</style>

