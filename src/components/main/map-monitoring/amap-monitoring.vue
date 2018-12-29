<template>
<div class="map-wrap pr h100">
  <div class="map-container h100" id="amap" ref="amap">
  </div>
  <right-menu ref="menu"
              v-if="isMenuShow"
              @on-set-defaut="setDefaultCenter"
              @on-move="handleMoveToDefaultPoint"/>
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
import mixin from './mixin'
import storeMixin from '@/store/mixins/mixin'
const DEVICE_MAX_OFFSET = 0.0001

export default {
  name: 'AMapMonitoring',
  mixins: [mixin, storeMixin],
  components: {TempMember, RightMenu},
  data () {
    return {
      map: null,
      timer: null,
      shapeOriginPoint: null
    }
  },
  mounted () {
    this.$refs.amap.addEventListener('mousedown', (ev) => {
      this.handleStartDrag(ev)
    }, true)

    this.$refs.amap.addEventListener('mouseup', (ev) => {
      this.handleEndDrag(ev)
    }, true)

    this.asycnInitAmap().then(() => {
      AMap.plugin('AMap.ToolBar', () => {//异步加载插件
          let toolbar = new AMap.ToolBar()
          this.map.addControl(toolbar)
      })
    })
  },
  methods: {
    asycnInitAmap () {
      return new Promise((resolve, reject) => {
        this.centerPoint = this.objLatlngToArrLnglat(this.centerPoint)
        window.onLoad  = () => {
          this.map = new AMap.Map('amap', {
            zoom: 15,
            center: this.centerPoint || {lat: 39.989628, lng: 116.480983}
          })

          this.map.on('rightclick', rightEvent => {
            this.isDragShape = false
            this.getRightMenu(rightEvent)
            this.map.setStatus({
              dragEnable: true,
              zoomEnable: true
            })
          })

          this.map.on('click', (ev) => {
            this.isMenuShow = false
          })

          this.map.on('mousemove', ev => {
          if (this.isDragShape && !this.isMenuShow) {
            if (this.dragStartTime === 0) {
              this.shapeOriginPoint = new Array(ev.lnglat.lng, ev.lnglat.lat)       
              this.dragBounds = this.createBounds(ev.lnglat.lng, ev.lnglat.lat, ev.lnglat.lng, ev.lnglat.lat)
              this.dragStartTime = this.getTimeNow()
            } else {
              if (this.dragShape) this.clearShape()
              this.dragDirection(ev.lnglat.lat, this.shapeOriginPoint.lat, ev.lnglat.lng, this.shapeOriginPoint.lng)
            }
            this.dragShape = this.createShape({bounds: this.dragBounds})
            this.dragShape.setMap(this.map)
            this.dragEv = ev
          }
        })
          //this.setMarkers()
          this.addMarker(this.gpsPoint, this.isAlarm(this.gpsPoint))
          resolve()
        }
        let url = 'https://webapi.amap.com/maps?v=1.4.8&key=688cc2b560762ab60c38207623d82b79&callback=onLoad';
        let jsapi = document.createElement('script');
        jsapi.charset = 'utf-8';
        jsapi.src = url;
        document.head.appendChild(jsapi);
      })
    },
    setMarkers () {
      for (let point of this.GPSList) {
        this.addMarker(point)
      }
    },
    addMarker (point, isAlarm) {
      if (point) {
        let marker = new AMap.Marker({
          position: new AMap.LngLat(point.lng, point.lat),
          icon: isAlarm ? this.redIconImage : this.iconImage,
          title: point.mid
        })
        let name = this.allMembersObj[point.mid].name
        marker.setLabel({
            content: `<div class="marker-info">${name}</div>`,
            offset: new AMap.Pixel(32,-12)
        })
        marker.setClickable(true)
        marker.on('click', ev => {
          console.log(ev)
        })
        this.map.add(marker)
        this.map.setFitView() 
      }
    },
    isAlarm (point) {
      if (point) {
        let isAlarm = false
        for (let key in point.alarm) {
          if (point.alarm[key] === 1) {
            isAlarm = true
          }
        }
        return isAlarm
      }
    },
    clearMakers () {
      let markers = this.map.getAllOverlays('marker')
      for (let marker of markers) {
        this.map.remove(marker)
      }
      markers = null
    },
    createShape ({bounds, fillOpacity = 0.35}) {
      return new AMap.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: fillOpacity,
        bounds: bounds || this.map.getBounds(),
      })
    },
    createBounds (west, south, east, north) {
      let southWest = new AMap.LngLat(west, south)
      let northEast = new AMap.LngLat(east, north)
      return new AMap.Bounds(southWest, northEast)
    },
    dragDirection (nowLat, prevLat, nowLng, prevLng) {
      if (nowLat > prevLat && nowLng > prevLng) {
        this.dragBounds = this.createBounds(this.shapeOriginPoint[0], this.shapeOriginPoint[1], nowLng, nowLat)
      } else if (nowLat > prevLat  && nowLng <= prevLng) {
        this.dragBounds = this.createBounds(nowLng, this.shapeOriginPoint[1], this.shapeOriginPoint[0], nowLat)
      } else if (nowLat <= prevLat && nowLng <= prevLng) {
        this.dragBounds = this.createBounds(nowLng, nowLat, this.shapeOriginPoint[0], this.shapeOriginPoint[1])
      } else {
        this.dragBounds = this.createBounds(this.shapeOriginPoint[0], nowLat, nowLng, this.shapeOriginPoint[1])
      }
    },
    handleStartDrag (ev) {
      this.startDrag(ev).then(() => {
        this.map.setStatus({
          dragEnable: false,
          zoomEnable: false
        })
      })
    },
    handleEndDrag (ev) {
      ev.button === 2 && this.isDragShape && this.dragDirection(this.dragEv.lnglat.lat, this.shapeOriginPoint[1], this.dragEv.lnglat.lng, this.shapeOriginPoint[0])
      this.endDrag(ev, 'AMAP_PART').then(() => {
        this.map.setStatus({
          dragEnable: true,
          zoomEnable: true
        })
      })
    },
    objLatlngToArrLnglat (point) {
      if (point && !Array.isArray(point)) {
        let {lng, lat} = point
        return new Array(lng, lat)
      } else {
        return point
      }
    },
    handleMoveToDefaultPoint () {
      this.moveToDefaultPoint().then((point) => {
        this.map.panTo(this.objLatlngToArrLnglat(point))
      }).catch(() => {
        this.messageAlert('warning', '没有设置默认中心点')
      })
    },
    filterRenderMarker (point) {
      let markers = this.map.getAllOverlays('marker')
        console.log(markers[0].F.title, point.mid)
      let _point = markers.find(item => {
        return item.F.title === point.mid
      })
      let newIsAlarm = this.isAlarm(point)
      let oldIsAlarm = this.isAlarm(_point)
      console.log(point, _point)
      // console.log(markers, newIsAlarm, oldIsAlarm)
      // if (_point && (Math.abs(_point.F.position.lat - point.lat) > DEVICE_MAX_OFFSET || Math.abs(_point.F.position.lng - point.lng)>DEVICE_MAX_OFFSET || newIsAlarm !== oldIsAlarm)) {
      //   isRender = true
      // } else if (!_point) {
      //   isRender = true
      // } else {
      //   isRender = false
      // }
      return {new: point, old: _point, newIsAlarm, oldIsAlarm}
    }
  },
  watch: {
    gpsPoint (point, oldPoint) {
      if (!oldPoint) {
        this.addMarker(point, this.isAlarm(point))
      } else {
        let pointObj = this.filterRenderMarker(point)
          pointObj.old && this.map.remove(pointObj.old)
          this.addMarker(pointObj.new, pointObj.newIsAlarm)
        // if (pointObj.render) {
        // }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.marker-info
  background #ffffff
  border-radius 3px
  padding 2px 5px
</style>


