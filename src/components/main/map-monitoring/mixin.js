import language from '@/libs/language'
import Storage from '@/utils/localStorage'
import {filterObjArrByKey} from '@/utils/utils'
import * as map from '@/store/types/map'

export default {
  computed: {
    GPSList: {
      get () {
        return this.$store.getters.GPSList
      },
      set (val) {
        this.$store.commit(map.SetGPSList, val)
      }
    },
    tempGroupInfo () {
      return this.$store.getters.tempGroupInfo
    },
    user () {
      return this.$store.state.user.userInfo
    },
    gpsPoint () {
      return this.$store.state.map.gpsPoint
    },
    allMembersObj () {
      return this.$store.state.group.allMembersObj
    }
  },
  data () {
    return {
      languageCtx: null,
      isMenuShow: false,
      centerPoint: null,
      dragBounds: null,
      dragShape: null,
      screenShape: null,
      map: null,
      markers: [],
      selectMid: [],
      isStartingSelect: false,
      isDragShape: false,
      dragStartTime: 0,
      dragTriggerTime: 0,
      dragEv: null,
      iconImage: '',
      rightClickLatlng: '',
      redIconImage: ''
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].mapMonitoring
    this.iconImage = require(`../../../assets/map-icons/amap_marker_b.png`)
    this.redIconImage = require(`../../../assets/map-icons/amap_marker_r.png`)
    this.getCenterPoint()
  },
  mounted () {
    window.oncontextmenu = (ev) => {
      ev.preventDefault()
    }
  },
  methods: {
    getCenterPoint () {
      let myDefaultCenter = Storage.localGet('myDefaultCenter')
      if (myDefaultCenter && myDefaultCenter[this.user.msId]) {
        this.centerPoint = myDefaultCenter[this.user.msId].centerPoint
      } else {
        this.centerPoint = this.gpsPoint ? {lat: this.gpsPoint.lat, lng: this.gpsPoint.lng} : {lat: 39.989628, lng: 116.480983}
      }
    },
    handleSelectFullScreen (type) {
      let markers = type === 'A_FULL' ? this.map.getAllOverlays('marker') : this.gPoints
      console.log(markers)
      if (markers.length) {
        this.filterDevice(type, markers)
      } else {
        this.messageAlert('warning', '当前位置没有成员')
      }
    },
    filterDevice (type, markers) {
      let bounds = this.getFilterBounds(type)
      console.log(type)
      let hasGPSItem = false
      if ((!this.dragShape && type === 'PART') || !bounds) return
      for (let item of markers) {
        let hasSelected = false
        let position = {}
        if (type.indexOf('A_') > -1) {
          position.lat = item.F.position.lat
          position.lng = item.F.position.lng
        } else {
          position.lat = item.position.lat()
          position.lng = item.position.lng()
        }
        if (position.lat < bounds.north && position.lat > bounds.south && position.lng < bounds.east && position.lng > bounds.west) {
          hasSelected = true
          hasGPSItem = true
        }
        if (hasSelected) {
          this.$emit('on-filter')
          let hasMid = this.selectMid.some(mid => {
            return mid === item.mid
          })
          let title = type.indexOf('A_') > -1 ? item.F.title : item.title
          if (!hasMid) this.selectMid.push(title)
        }
      }
      this.selectMid.length && this.getMapTempMembers()
      if (!hasGPSItem && (type === 'A_FULL' || type === 'G_FULL')) {
        this.messageAlert('warning', '当前位置没有成员')
      }
    },
    getMapTempMembers () {
      console.log(this.selectMid)
      const arr = this.selectMid.map(item => {
        let obj = this.allMembersObj[item]
        return obj
      })
      console.log(arr)
      this.$store.commit(map.SetMapTempMemberList, arr)
    },
    clearShape () {
      if (this.dragShape) {
        this.dragShape.setMap(null)
        this.dragShape = null
      }
    },
    getFilterBounds (type) {
      let bounds = type.indexOf('PART') <= -1 ? this.map.getBounds() : this.dragBounds
      let filterBounds = {}
      if (type !== 'PART') {
        filterBounds.north = bounds.ma ? bounds.ma.l : bounds.northeast.lat
        filterBounds.south = bounds.ma ? bounds.ma.j : bounds.southwest.lat
        filterBounds.east = bounds.fa ? bounds.fa.l : bounds.northeast.lng
        filterBounds.west = bounds.fa ? bounds.fa.j : bounds.southwest.lng
      } else {
        filterBounds = bounds
      }

      return filterBounds
    },
    handleDeleteMember (mid) {
      if (mid && this.selectMid.length) {
        let index = this.selectMid.indexOf(mid)
        this.selectMid.splice(index, 1)
      } else {
        this.selectMid = []
      }
    },
    getRightMenu (rightEvent) {
      this.isMenuShow = true
      this.$nextTick(() => {
        this.$refs.menu.position = {left: `${rightEvent.pixel.x}px`, top: `${rightEvent.pixel.y}px`}
        if (rightEvent.lnglat) {
          this.rightClickLatlng = new AMap.LngLat(rightEvent.lnglat.lng, rightEvent.lnglat.lat)
        } else {
          this.rightClickLatlng = new google.maps.LatLng(rightEvent.latLng.lat(), rightEvent.latLng.lng())
        }
      })
    },
    setDefaultCenter () {
      let myDefaultCenter = {}
      myDefaultCenter[this.user.msId] = {}
      let center = this.rightClickLatlng
      if (center) {
        myDefaultCenter[this.user.msId].centerPoint = center
        Storage.localSet('myDefaultCenter', myDefaultCenter)
        this.isMenuShow = false
        this.messageAlert('success', this.languageCtx.successAlert)
      }
    },
    moveToDefaultPoint () {
      return new Promise((resolve, reject) => {
        let myDefaultCenter = Storage.localGet('myDefaultCenter')
        this.isMenuShow = false
        if (myDefaultCenter && myDefaultCenter[this.user.msId]) {
          resolve(myDefaultCenter[this.user.msId].centerPoint)
        } else {
          reject(new Error('error'))
        }
      })
    },
    startDrag (ev) {
      return new Promise((resolve) => {
        if (ev.button === 2) {
          if (this.dragShape) {
            this.dragShape.setMap(null)
            this.dragShape = null
          }
          this.isDragShape = true
          resolve()
        }
      })
    },
    endDrag (ev, type) {
      return new Promise((resolve) => {
        if (this.isDragShape && this.map) {
          this.dragStartTime = 0
          this.shapeOriginPoint = null
          this.dragEv = null
          this.filterDevice(type)
          this.isDragShape = false
          this.clearShape(this.dragShape)
          resolve()
        }
      })
    },
    getTimeNow () {
      let now = new Date()
      return now.getTime()
    },
    setMarkers () {
      for (let point of this.GPSList) {
        this.addMarker(point, this.isAlarm(point))
      }
    },
    isAlarm (point) {
      if (point) {
        let isAlarm = false
        for (let key in point.alarm) {
          if (point.alarm[key] === 1 && key === 'isDanger') {
            isAlarm = true
          }
        }
        return isAlarm
      }
    }
  }
}
