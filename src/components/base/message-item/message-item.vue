<template>
  <div class="message-item-wrap">
    <div class="top-info flex align-items mt10">
      <span class="time" v-html="time"></span>
      <Tooltip placement="bottom-end" :content="others" theme="light" max-width="180" class="flex-item">
        <div class="right flex align-items">
          <span v-html="msName"></span>
          <span>{{arrow}}</span>
            <span v-html="others" class="names"></span>
        </div>
      </Tooltip>
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
    .right
      font-size 12px
      color #777
    .time
      padding-right 5px
    .names
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
      width 60px
      display inline-block
      cursor default
  .message
    background #ececec
    border-radius 6px
    border 1px solid #eaeaea
    padding 8px
    margin 5px 0 10px
    line-height 1.62
</style>

