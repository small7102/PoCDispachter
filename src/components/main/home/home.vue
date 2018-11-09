<template>
    <div class="home-wrap h100">
        <Layout :style="{background: '#ffffff'}" class="h100 direction-row">
          <Content :style="{padding: '0 12px'}" class="flex direction-column">
            <div class="con-top">
              <span>群组</span>
            </div>
            <Layout :style="{background: '#ffffff'}" class="flex-item h100 direction-row">
              <Content :style="{overflow: 'hidden'}" class="h100">
                <Layout class="main-content h100">
                  <Header class="group-header">
                    <block-group
                      @on-add='addTempGroup'
                      @on-back="backToTempGroup"
                      @on-quit='quitTempGroup'
                      @on-init='initMemberList'
                      :tempGroup="tempGroup"
                      :isRemoving="isRemoving"
                      :singleName="singleName"
                      />
                  </Header>
                  <Content class="flex-item h100 scroll-bar" :style="{overflow: 'hidden'}">
                    <group-member
                      :memberList="memberList"
                      @on-quit="quitTempGroup"
                      @on-single-call="newSingleCall"/>
                  </Content>
                  <Header class="send-footer">
                    <send-message/>
                  </Header>
                </Layout>
              </Content>
              <Sider :width="216" hide-trigger class="right-sider-wrap h100">
                <right-side-group @on-select="handleSelectTempGroup"/>
              </Sider>
            </Layout>
          </Content>

          <!-- 最侧边 -->
          <!-- <Sider :width="250" hide-trigger :style="{background: '#f3f3f3'}">
            <div>我是侧边</div>
          </Sider> -->
        </Layout>
    </div>
</template>

<script>
import BlockGroup from './block-group'
import GroupMember from './group-member'
import SendMessage from './send-message'
import RightSideGroup from './right-side-group'

export default {
  name: 'Home',
  components: {
    BlockGroup,
    GroupMember,
    SendMessage,
    RightSideGroup
  },
  data () {
    return {
      tempGroup: null,
      showTempGroup: false,
      memberList: [],
      isRemoving: false,
      singleName: ''
    }
  },
  methods: {
    addTempGroup (list) {
      console.log(list)
      this.tempList = list
    },
    quitTempGroup (list) {
      this.tempList = []
      this.isRemoving = true
    },
    backToTempGroup (list) {
      this.tempList = list
      this.memberList = []
    },
    handleSelectTempGroup (item) {
      this.tempGroup = item
      this.tempList = item.membersList
      this.showTempGroup = true
    },
    initMemberList (list) {
      this.memberList = list
    },
    newSingleCall (name) {
      console.log(name)
      this.singleName = name
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .home-wrap
    .main-content
      height 100%
      position relative
    .con-top
      background $color-theme-weight
      height 36px
      span
        background $color-theme-weight-d
        color #ffffff
        line-height 36px
        display inline-block
        padding 0 44px
    .group-header
      background #ffffff
      height auto
      padding 0
    .send-footer
      background #f3f3f3
      height 80px
      padding 0
    .right-sider-wrap
      background $color-theme
      margin-left 3px
</style>
