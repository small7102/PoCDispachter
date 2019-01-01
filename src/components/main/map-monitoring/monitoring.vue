<template>
  <div class="map-wrap h100">
    <g-map-monitoring v-if="isGoogle" ref="gmap" @on-filter="closeTip"/>
    <a-map-monitoring v-else ref="amap" @on-filter="closeTip"/>
    <temp-member ref="tempMember"
               @on-create="handleCreate"
               @on-change="handleChangeMap"
               @on-delete="handleDelete"
               @on-select="handleSelect"
              />
  </div>
</template>

<script>
import GMapMonitoring from './map-monitoring'
import AMapMonitoring from './amap-monitoring'
import TempMember from './temp-member'

export default {
  name: 'MapMonitoring',
  components: {GMapMonitoring, AMapMonitoring, TempMember},
  data () {
    return {
      isGoogle: false
    }
  },
  mounted () {
  },
  methods: {
    closeTip () {
      this.$refs.tempMember.isTipsShow = false
    },
    handleDelete ({mid, type}) {
      this.$refs[type].handleDeleteMember(mid)
    },
    handleSelect(type) {
      // if (this.$store.state.group.tempGroupInfo) return
      const mapType = {
        amap: 'A_FULL',
        gmap: 'G_FULL'
      }
      console.log(type, mapType[type],this.$refs[type])
      this.$refs[type].handleSelectFullScreen(mapType[type])
    },
    handleChangeMap (map) {
      this.isGoogle = map === 'gmap' ? true : false
    },
    handleCreate (type) {
      this.$refs[type].selectMid = []
    }
  }
}
</script>

