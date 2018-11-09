<template>
  <div class="main-wrap h100">
    <Layout class="main h100">
      <!-- 顶部 -->
      <Header class="i-header">
        <header-bar />
      </Header>

      <Layout class="flex-item">
        <!-- 侧边 -->
        <Sider :width='290' hide-trigger class="left-side h100">
          <Layout class="h100" :style="{background: '#fff'}">
            <Header class="tab-header">
              <tabs></tabs>
              <Input placeholder="请输入" style="width: 238px; margin: 8px 12px" />
            </Header>
            <Content class="flex-item group-wrap scroll-bar">
              <!-- <side-group></side-group> -->
              <group-tree></group-tree>
            </Content>
            <div class="sider-bottom">
              PTT空格
            </div>
          </Layout>
        </Sider>
        <Content>
          <!-- 路由切换区域 -->
            <keep-alive>
              <router-view/>
            </keep-alive>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
import HeaderBar from './header-bar'
import GroupTree from './group-tree'
import Tabs from './tabs'
import * as types from '@/store/types/group'
// import {isPtting, pttStart} from '@/libs/webDispatcher-sdk.js'
// import * as sRecord from '@/libs/record'
// console.log(sRecord.SRecorder)

// const timeDelta = 1200

export default {
  name: 'Main',
  components: {
    HeaderBar,
    GroupTree,
    Tabs
  },
  data () {
    return {
      isPtting: false,
      pptStartTime: 0,
      pptEndTime: 0,
      timer: null,
      isSend: false,
      isDown: true
    }
  },
  mounted () {
    this.$store.dispatch(types.GetTreeGroupsList)
    console.log(webSocket)
    webSocket = this.$store.getters.mySocket
    receiveVoice(res => {
       console.log(res)
    })
    document.onkeydown = (ev) => {
      // _this.longKeyDown(ev.keyCode)
      if (ev.keyCode === 32) {
        if (this.isDown) {
          this.isDown = false
          if (!isPtting()) {
            console.log(webSocket)
            pttStart()
          } else {
            console.log('有人。。。')
          }
        }
      }
    }
    document.onkeyup = (ev) => {
      if (ev.keyCode) {
        pttStop()
        this.isDown = true
      }
    }
  },
  methods: {
    getTimeNow () {
      let now = new Date()
      return now.getTime()
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../assets/styles/variable.styl'

  .main-wrap
    overflow hidden
    .i-header
      background: #fff
      boxShadow: 0 2px 3px 2px rgba(0,0,0,.02)
      padding: 0
      height: 80px
      marginBottom: 5px
    .left-side
      position relative
      padding-bottom 60px
      background #ffffff
      .tab-header
        height auto
        padding 0
        background $color-theme-weight
      .group-wrap
        height 100%
        overflow hidden
      .sider-bottom
        position absolute
        bottom 0
        left 0
        height 60px
        background $color-theme-weight
        text-align center
        width 100%
        line-height 60px
        color #fff
</style>
