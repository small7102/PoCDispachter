<template>
  <div class="settings-wrap">
    <Modal
        v-model="isSettingShow"
        title="自定义设置"
        width="450"
        class-name="vertical-center-modal"
        @on-ok="handleSubmitSettings">
      <Form :model="settingItems" :label-width="100">
        <FormItem label="快捷键">
            <div v-html="settingItems.pttQuickKey.key" 
                class="quick-key" 
                @mouseover="isMouseOnQuickKey=true"
                @mouseleave="isMouseOnQuickKey=false">
            </div>
            <p class="tip">鼠标放上后，直接按下快捷键</p>
        </FormItem>
        <div class="notice" ><span>开启通知</span></div>
        <FormItem label="上下线">
            <i-switch v-model="settingItems.isReceiveOnlineNotice" size="large">
                <span slot="open">On</span>
                <span slot="close">Off</span>
            </i-switch>
        </FormItem>
        <FormItem label="切换群组">
            <i-switch v-model="settingItems.isReceiveSwitchGroupNotice" size="large">
                <span slot="open">On</span>
                <span slot="close">Off</span>
            </i-switch>
        </FormItem>
        <FormItem label="退出临时群组">
            <i-switch v-model="settingItems.isReceiveQuitGroupNotice" size="large">
                <span slot="open">On</span>
                <span slot="close">Off</span>
            </i-switch>
        </FormItem>
        <FormItem label="解散临时群组">
            <i-switch v-model="settingItems.isReceiveCancelGroupNotice" size="large">
                <span slot="open">On</span>
                <span slot="close">Off</span>
            </i-switch>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {Switch} from 'iview'
import * as app from '@/store/types/app'
import {toUpperCaseFirstChar} from '@/utils/utils'
import Storage from '@/utils/localStorage'

export default {
  name: 'Settings',
  components: {
    'i-switch': Switch
  },
  computed: {
    isSettingShow: {
      get () {
        return this.$store.getters.isSettingShow
      },
      set (val) {
        this.$store.commit(app.SetSettingShow, false)
      }
    }
  },
  data () {
    return {
      isMouseOnQuickKey: false,
      settingItems: null
    }
  },
  created () {
    let user = this.$store.getters.userInfo.msId
    if (Storage.localGet('mySettings') && Storage.localGet('mySettings')[user]) {
      this.settingItems = Storage.localGet('mySettings')[user]
    } else {
      this.settingItems = {
        pttQuickKey: {keyCode: 32, key: 'Space'},
        isReceiveOnlineNotice: true,
        isReceiveSwitchGroupNotice: true,
        isReceiveQuitGroupNotice: true,
        isReceiveCancelGroupNotice: true
      }
    }
    this.$store.commit(app.SetSettingItems, {...this.settingItems})

    this.disableKeys = [27, 112, 116]
    window.addEventListener('keydown', (ev) => {
      let hasDisableKey = this.disableKeys.some(item => {
        return item === ev.keyCode
      })
      if (!hasDisableKey && this.isMouseOnQuickKey) {
        this.setQuickKey(ev)
      } else {
        return false;
      }
    })
  },
  methods: {
    setQuickKey (ev) {
      let key = ev.keyCode !== 32 ? ev.key : 'Space'
      key = toUpperCaseFirstChar(key)
      let keyObj = {...ev, key: key, keyCode: ev.keyCode}
      let obj = {...this.settingItems, pttQuickKey: keyObj}
      this.settingItems = obj
    },
    handleSubmitSettings () {
      Storage.localRemove('mySettings')
      let user = this.$store.getters.userInfo.msId
      let mySettings = {}
      mySettings[user] = this.settingItems

      // 临时群组存到本地
      console.log(this.settingItems)
      Storage.localSet('mySettings', mySettings)
      this.$store.commit(app.SetSettingItems, {...this.settingItems})
    }
  }
}
</script>

<style lang="stylus" scoped>
.settings-wrap
  font-size 14px
.quick-key
  width 200px
  line-height 30px
  height 30px
  border 1px solid #eaeaea
  padding 0 5px
  text-align center
  &:hover
    border 1px solid #2d8cf0
    transition all .2s
.tip
  font-size 12px
  color #bbb
.notice
  border-bottom 1px solid #eaeaea
  margin-bottom 10px
  padding-bottom 15px
  span
    width 100px
    text-align right 
    font-weight bold
    display inline-block
    padding-right 10px
</style>


