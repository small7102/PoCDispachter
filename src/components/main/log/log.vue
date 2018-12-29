<template>
<div class="p-lr10 h100 pr">
  <Tabs v-model="selectedTable">
    <TabPane label="操作日志" icon="ios-create-outline" name="operate">
      <log-operate ref="operate"/>
    </TabPane>
    <TabPane label="GPS" icon="ios-pin-outline" name="gps">
      <log-gps ref="gps"/>
    </TabPane>
    <TabPane label="报警记录" icon="md-notifications-outline" name="alarm">
      <log-alarm ref="alarm"/>
    </TabPane>
  </Tabs>
  <Button type="primary" class="excel-btn pa" @click="exportExcel">导出表格</Button>
</div>
</template>

<script>
import LogOperate from './log-operate'
import LogGps from './log-gps'
import LogAlarm from './log-alarm'

export default {
  name: "Log",
  components: {
    LogOperate,
    LogGps,
    LogAlarm
  },
  data() {
    return {
      selectedTable: 'operate'
    }
  },
  methods: {
    exportExcel () {
      let data = this.$refs[this.selectedTable][`${this.selectedTable}LogData`]
      let columns = this.$refs[this.selectedTable].$refs[this.selectedTable].Col

      if (data.length) {
        this.$refs[this.selectedTable].$refs[this.selectedTable].exportCsv({
          onHeader: true,
          columns,
          data
        })
      } else {
        this.messageAlert('warning', '暂无数据')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .p-lr10
    padding 10px 12px 0
    overflow hidden
    .excel-btn
      right 10px
      top 10px
</style>
