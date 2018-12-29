<template>
  <div class="info-wrap">
    <Modal
        v-model="isModalShow"
        :title="title"
        width="400"
        class-name="vertical-center-modal"
        >   
        <div v-if="infoObj">
        <div class="info-line flex align-center">
          <span class="left">终端ID:</span>
          <span class="right">{{infoObj.cid}}</span>
        </div>
        <div class="info-line flex align-center">
          <span class="left">终端名称:</span>
          <span class="right">{{infoObj.name}}</span>
        </div>
        <div class="info-line flex align-center">
          <span class="left">当前组:</span>
          <span class="right">{{infoObj.groupName}}</span>
        </div>
        <div class="info-line flex align-center">
          <span class="left">通话状态:</span>
          <span class="right status">{{infoObj.callsetName}}</span>
        </div>
        <div class="info-line flex align-center">
          <span class="left">所属群组:</span>
          <span class="right flex groups felx-item">
            <div>
              <i v-for="(item, index) in infoObj.groups" :key="index">{{item}}</i>
            </div>
          </span>
        </div>
        <div class="info-line flex align-center">
          <span class="left">最后定位:</span>
          <span class="right gps">
              <i v-if="!infoObj.gps">--------</i>
              <i v-else>{{`[经度：${infoObj.gps.lng.toString().substr(0, 8)}, 纬度：${infoObj.gps.lat.toString().substr(0, 8)}]`}}</i>
          </span>
        </div>
        <div class="info-line flex align-center">
          <span class="left">最后定位时间:</span>
          <span class="right">
              <i v-if="!infoObj.gps">--------</i>
              <i v-else>{{`${infoObj.gps.datetime.substr(0, 4)}.${infoObj.gps.datetime.substr(4, 2)}.${infoObj.gps.datetime.substr(6, 2)} ${infoObj.gps.datetime.substr(8, 2)}:${infoObj.gps.datetime.substr(10, 2)}:${infoObj.gps.datetime.substr(12, 2)}`}}</i>
          </span>
        </div>
        </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'TerminalInfo',
  props: {
    member: Object,
  },
  computed: {
    originGroupList () {
      return this.$store.getters.originGroupList
    },
    originMembersObj () {
      return this.$store.state.group.originMembersObj
    },
    allGroupsObj () {
      return this.$store.state.group.allGroupsObj
    },
    GPSList () {
      return this.$store.state.map.GPSList
    }
  },
  data () {
    return {
      isModalShow: false,
      title: '终端信息',
      infoObj: null
    }
  },
  methods: {
    initInfo () {
      this.infoObj = this.member
      let group = this.originGroupList.find(item => {
        return item.gid === this.member.grp
      })
      this.infoObj.groupName = group.name
      this.infoObj.callsetName = this.getDescStatus()
      this.infoObj.groups = this.getGroups()
      this.infoObj.gps = this.getGPS()
    },
    getDescStatus () {
     return this.member.callset === '8' ? '激活' : this.member.callset === '0' ? '遥毙' : '遥晕' 
    },
    getGroups () {
      let groups = []
      for (let key in this.originMembersObj) {
        let isInGroup = this.originMembersObj[key].some(item => {
            return item.cid === this.member.cid
        })
        if (isInGroup) groups.push(this.allGroupsObj[key].name)
      }
      return groups
    },
    getGPS () {
      if (this.GPSList) {
        const gps = this.GPSList.find(item => {
            return item.mid === this.member.cid
        })
        console.log(gps)
        return gps
      }
    }
  },
  watch: {
    isModalShow (val) {
      val && this.initInfo()    
    }
  }
}
</script>

<style lang="stylus" scoped>
.info-line
  line-height 36px
  span
    display inline-block
  .left
    width 100px
    text-align right
    padding-right 8px
  .right
    font-size 14px
    color #333
  .status
    color #f76363
  .groups
    flex-wrap wrap
    i 
      display inline-block
      font-style normal
      background #eee
      padding 6px 8px
      margin-right 5px
      color #777
      font-size 12px
      border-radius 2px
      line-height 12px
  .gps
    i
      font-style normal
</style>

