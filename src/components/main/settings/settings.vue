<template>
  <div class="settings-wrap">
    <Modal
        v-model="isSettingShow"
        :title="languageCtx.title"
        width="450"
        class-name="vertical-center-modal"
        @on-ok="handleSubmitSettings">
      <Form :label-width="100">
        <FormItem :label="pttQuickKey.label">
            <div v-html="pttQuickKey.key"
                class="quick-key"
                @mouseover="isMouseOnQuickKey=true"
                @mouseleave="isMouseOnQuickKey=false">
            </div>
            <p class="tip" v-html="languageCtx.tip"></p>
        </FormItem>
        <div class="notice" ><span>{{languageCtx.openNotice.name}}</span></div>
        <FormItem v-for="(notice, index) in openNotice"
                  :key="index"
                  :label="notice.label">
            <i-switch v-model="notice.val" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {Switch} from 'iview'
import * as app from '@/store/types/app'
import {toUpperCaseFirstChar, deepClone} from '@/utils/utils'
import Storage from '@/utils/localStorage'
import language from '@/libs/language'

export default {
  name: 'Settings',
  components: {
    'i-switch': Switch
  },
  computed: {
    isSettingShow: {
      get () {
        return this.$store.state.app.isSettingShow
      },
      set (val) {
        this.$store.commit(app.SetSettingShow, false)
      }
    },
    storeSettingItems: {
      get () {
        return this.$store.state.app.settingItems
      },
      set (val) {
        this.$store.commit(app.SetSettingItems, val)
      }
    },
    user () {
      return this.$store.getters.userInfo
    }
  },
  data () {
    return {
      isMouseOnQuickKey: false,
      languageCtx: null,
      pttQuickKey: {label: 'PTT快捷键', keyCode: 32, key: 'Space'},
      openNotice: [
        {
          label: '上线',
            key: 'onlineNotice',
            val: true
          },
          {
            key: 'offlineNotice',
            label: '下线',
            val: true
          },
          {
            key: 'creatTempGroupNotice',
            label: '创建临时群组',
            val: true
          },
          {
            key: 'switchNotice',
            label: '切换群组',
            val: true
          },
          {
            key: 'quitTempGroupNotice',
            label: '退出临时群组',
            val: true
          },
          {
            key: 'cancelTempGroupNotice',
            label: '解散临时群组',
            val: true
          },
          {
            key: 'callsetNotice',
            label: '通话设置',
            val: true
          }
        ]
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].settings
    this.getLocalSettingItems()
    this.storeSettingItems = {pttQuickKey: {...this.pttQuickKey}, openNotice: deepClone(this.openNotice)}
  },
  mounted () {

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
      this.pttQuickKey = {...this.pttQuickKey, key: key, keyCode: ev.keyCode}
    },
    handleSubmitSettings () {
      let mySettings = {}
      mySettings[this.user.msId] = {openNotice: deepClone(this.openNotice), pttQuickKey: {...this.pttQuickKey}}

      // 临时群组存到本地
      this.storeSettingItems = mySettings[this.user.msId]
      Storage.localSet('mySettings', mySettings)
    },
    getLocalSettingItems () {
      if (Storage.localGet('mySettings') && Storage.localGet('mySettings')[this.user.msId]) {
        let localSettingItems = Storage.localGet('mySettings')[this.user.msId]
        // this.storeSettingItems = settingItems
        this.pttQuickKey = localSettingItems.pttQuickKey
        this.openNotice = localSettingItems.openNotice
      }
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


