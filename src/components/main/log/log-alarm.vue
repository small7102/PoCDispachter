<template>
<Table :height="tableHeight" stripe :columns="Col" :data="alarmLogData" no-data-text='暂无数据' ref="alarm"></Table>
</template>

<script>
import mixin from './mixin'

export default {
  mixins: [mixin],
  computed: {
    alarmLogData () {
      return this.$store.state.log.alarmLogData
    }
  }
}
</script>
