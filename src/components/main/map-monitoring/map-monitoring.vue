<template>
<div class="map-wrap pr h100">
  <div class="map-container h100" id="map">
  </div>
  <temp-member @on-delete="handleDeleteMember" 
               @on-select="handleSelect"
               @on-create="clearShape"/>
  <right-menu ref="menu" 
              v-if="isMenuShow"
              @on-set-defaut="setDefaultCenter"
              @on-move="moveToDefaultPoint"/>
</div>
</template>

<script>
import {passiveEvent} from '@/utils/compatible'
import TempMember from './temp-member'
import {filterObjArrByKey} from '@/utils/utils'
import * as map from '@/store/types/map'
import * as app from '@/store/types/app'
import RightMenu from './right-menu'
import Storage from '@/utils/localStorage'

export default {
  name: 'MapMonitoring',
  components: {TempMember, RightMenu},
  data () {
    return {
      selectBounds: null,
      shape: null,
      map: null,
      markers: [],
      selectMid: [],
      isMenuShow: false,
      isStartingSelect: false,
      centerPoint: null
    }
  },
  computed: {
    GPSList () {
      return this.$store.getters.GPSList
    },
    tempGroupInfo () {
      return this.$store.getters.tempGroupInfo
    }
  },
  created () {
    this.getCenterPoint()
  },
  mounted() { 
    // let myDefaultCenter = Storage.localGet('myDefaultCenter')
    window.oncontextmenu = (ev) => {
      ev.preventDefault();
    }
    this.initMap()
  },
  methods: {
    initMap () {
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        gestureHandling: 'ok',
        center: this.centerPoint || {lat: 0, lng: 0}
      })
      this.map.addListener('rightclick', (rightEvent) => {
        if (this.map.gestureHandling !== "none") this.getRightMenu(rightEvent)  
      })
      this.map.addListener('click', (ev) => {
        this.isMenuShow = false
        if (this.map.gestureHandling === "none" && !this.isStartingSelect) {
          this.isStartingSelect = true
          this.selectBounds = {north: ev.latLng.lat(), east: ev.latLng.lng(),south: ev.latLng.lat(), west: ev.latLng.lng()}
          this.shape = this.createShape(this.map, this.selectBounds)
        }
      })
    },
    setCenterAndZoom(center, zoom) {
      this.map.setCenter(center)
      this.map.setZoom(zoom)
    },
    setMarkers (map, list) {
      let shape = {
        coords: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'poly'
      }
      for (let point of list) {
        let marker = new google.maps.Marker({
          position: {lat: point.lat, lng: point.lng},
          map: map,
          shape: shape,
          title: point.mid
        })
        this.markers.push(marker)

        let infoWindow = new google.maps.InfoWindow({
          content: point.mid
        })

        infoWindow.open(map, marker)
      }
    },
    setMapOnAll (map) {
      for (let marker of this.markers) {
        marker.setMap(map)
      }
    },
    clearMarkers () {
      this.setMapOnAll(null)
    },
    clearShape () {
      this.shape.setMap(null)
    },
    createShape (map, bounds) {
      return new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.65,
        map: map,
        bounds: bounds || map.getBounds(),
        editable: true,
        draggable: true,
        geodesic: true
      })
    },
    filterDevice () {
      let list = []
      let bounds = this.shape.bounds
      for (let item of this.GPSList) {
        if (item.lat < bounds.l.l && item.lat > bounds.l.j && item.lng < bounds.j.l && item.lng > bounds.j.j) {
          let hasSelected = this.selectMid.some(midItem => {return midItem === item.mid})

          if (!hasSelected) {
            this.selectMid.push(item.mid)
            let result = filterObjArrByKey(item.mid, this.$store.getters.memberList, 'cid')
            let mapTempMemberList = [...this.$store.getters.mapTempMemberList]
            mapTempMemberList = mapTempMemberList.concat(result)
            this.$store.commit(map.SetMapTempMemberList, mapTempMemberList)
          }
        }
      }

      this.shape.setMap(null)
      this.shape = null
    },
    handleDeleteMember (mid) {
      if (this.selectMid.length) {
        let index = this.selectMid.indexOf(mid)
        this.selectMid.splice(index, 1)
      }
    },
    handleSelect ({type}) {
      if (type === 'full') {
        this.handleSelectFullScreen()
      } else {
        this.map.gestureHandling = 'none'
      }
    },
    handleSelectFullScreen () {
      this.shape = this.createShape(this.map)
      console.log(this.shape)
    },
    getRightMenu (rightEvent) {
      this.isMenuShow = true
      this.$nextTick(() => {
        this.$refs.menu.position = {left: `${rightEvent.pixel.x}px`, top: `${rightEvent.pixel.y}px`}
      })
    },
    getCenterPoint () {
      let myDefaultCenter = Storage.localGet('myDefaultCenter')
      let msId = this.$store.getters.userInfo.msId
      if (myDefaultCenter && myDefaultCenter[msId]) {
        this.centerPoint = myDefaultCenter[msId].centerPoint
      } else{
        this.centerPoint = this.GPSList.length ? {lat: this.GPSList[0].lat, lng: this.GPSList[0].lng} : {lat: 0, lng: 0}
      }
    },
    setDefaultCenter () {
      Storage.localRemove('myDefaultCenter')
      let myDefaultCenter = {}
      let msId = this.$store.getters.userInfo.msId
      myDefaultCenter[msId] = {}
      let center = this.getScreenCenterPoint()
      if (center) {
        myDefaultCenter[msId].centerPoint = this.getScreenCenterPoint()
        Storage.localSet('myDefaultCenter', myDefaultCenter)
        this.isMenuShow = false
        this.messageAlert('success', '设置成功')
      }
    },
    getScreenCenterPoint () {
      if (this.map) {
        return {lat: this.map.center.lat(), lng: this.map.center.lng()}
      }
    },
    moveToDefaultPoint () {
      let myDefaultCenter = Storage.localGet('myDefaultCenter')
      let msId = this.$store.getters.userInfo.msId
      if (myDefaultCenter && myDefaultCenter[msId]) {
        this.map.setCenter(myDefaultCenter[msId].centerPoint)
        this.isMenuShow = false
      } 
    }
  },
  watch: {
    shape (val) {
      if (val) {
        this.filterDevice()
      }
    },
    GPSList (list) {
      this.clearMarkers()
      if (this.map) {
        this.map.setCenter({lat: list[0].lat, lng: list[0].lng})
        if (this.map.getZoom() !== 13) this.map.setZoom(13)
        this.setMarkers(this.map, list)
      }
    },
    tempGroupInfo (val) {
      if (!val) {
        this.selectMid = []
        this.hasSelected = false
      }
    },
    centerPoint (val) {
      this.setCenterAndZoom(val, 13)
    }
    // centerPoint (newVal, oldVal) {
    //   if (newVal && !oldVal) {
    //     console.log(newVal)
    //     this.initMap()
    //   }
    // }
  }
}
</script>

<style lang="stylus" scoped>
</style>
