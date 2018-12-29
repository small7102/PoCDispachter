<template>
<Table :height="tableHeight" stripe :columns="Col" :data="gpsLogData" no-data-text='暂无数据' ref="gps"></Table>
</template>

<script>
import mixin from './mixin'

export default {
  mixins: [mixin],
  computed: {
    gpsLogData () {
      return this.$store.state.log.gpsLogData
    }
  }
}
</script>
