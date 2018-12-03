<template>
  <div class="map-container h100 w100">
    <gmap-map :center="{lat:1.38, lng:103.8}" :zoom="12" class="h100">
      <gmap-marker :position="{lat:1.38, lng:103.8}">
      </gmap-marker>
      <gmap-info-window :position="{lat:1.38, lng:103.8}">
        Hello world!
      </gmap-info-window>
    </gmap-map>
  </div>
</template>

<script>
// import { lazyAMapApiLoaderInstance } from 'vue-amap'
import { Map } from 'vue2-google-maps'
export default {
  name: 'MapMonitoring',
  created () {

  },
  mounted() {

    }
}
</script>

