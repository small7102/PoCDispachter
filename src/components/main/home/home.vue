<template>
    <div class="home-wrap h100">
        <Layout class="h100 direction-row">
          <Content :style="{paddingLeft: '12px'}" class="flex direction-column">
            <div class="con-top">
              <span>群组</span>
            </div>
            <Layout :style="{background: '#ffffff'}" class="flex-item h100 direction-row">
              <Content :style="{overflow: 'hidden'}" class="h100">
                <Layout class="main-content h100">
                  <Header class="group-header">
                    <block-group
                      @on-back="backToTempGroup"
                      @on-init='initMemberList'
                      :tempGroup="tempGroup"
                      :isRemoving="isRemoving"
                      />
                  </Header>
                  <Content class="flex-item h100 scroll-bar" :style="{overflow: 'hidden'}">
                    <group-member :memberList="memberList"/>
                  </Content>
                  <Header class="send-footer">
                    <send-message/>
                  </Header>
                </Layout>
              </Content>
              <Sider :width="200" hide-trigger class="right-sider-wrap h100" collapsible :collapsed-width="120" v-model="isCollapsed" breakpoint="lg">
                <right-side-group 
                @on-select="handleSelectTempGroup"
                />
              </Sider>
            </Layout>
          </Content>

          <!-- 最侧边 -->
          <Sider hide-trigger class="record-wrap" :width="240" collapsible>
            <div class=" flex direction-column h100">
              <Layout class="right-card sms-card">
                <Header class="card-title">
                  消息记录
                </Header>
                <Content class="h100">
                  <message-list/>
                </Content>
              </Layout>
              <Layout class="right-card voice-card">
                <Header  class="card-title">语音记录</Header>
                <Content class="voice-content h100">
                  <voice-list/>
                </Content>
              </Layout>
            </div>
          </Sider>
        </Layout>
    </div>
</template>

<script>
import BlockGroup from './block-group'
import GroupMember from './group-member'
import SendMessage from './send-message'
import RightSideGroup from './right-side-group'
import VoiceList from './voice-list'
import MessageList from './message-list'

export default {
  name: 'Home',
  components: {
    BlockGroup,
    GroupMember,
    SendMessage,
    RightSideGroup,
    VoiceList,
    MessageList
  },
  data () {
    return {
      tempGroup: null,
      showTempGroup: false,
      memberList: [],
      isRemoving: false,
      isCollapsed: false
    }
  },
  methods: {
    backToTempGroup () {
      this.memberList = []
    },
    handleSelectTempGroup (item) {
      this.tempGroup = item
      this.showTempGroup = true
    },
    initMemberList (list) {
      this.memberList = list
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
    .record-wrap
      padding 0 8px
      background #f3f3f3
      height 100%
      overflow hidden
      .right-card
        width 100%
        margin 10px 0
        background #ffffff
        border-radius 6px
        overflow hidden
        height 45%
        &.voice-card
          height 55%
      .card-title
        background #ffffff
        text-align center
        color #333
        font-weight bold
        border-bottom 1px solid #eeeeee
        height 50px
        line-height 50px
        overflow hidden
        text-overflow ellipsis
        white-space nowrap
        padding 0
</style>
