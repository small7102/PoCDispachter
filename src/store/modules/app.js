import * as types from '../types/app'
export default {
  state: {
    isAppLoading: false,
    isRecording: false,
    isSettingShow: false,
    voiceList: [],
    playingVoiceUrl: '',
    isSearch: false,
    settingItems: null,
    isRefreshPage: false,
    isRemaindMicroRight: false,
    microTip: false,
    pttAble: true
  },
  getters: {
    isAppLoading: state => state.isAppLoading,
    voiceList: state => state.voiceList,
    playingVoiceUrl: state => state.playingVoiceUrl,
    isRecording: state => state.isRecording,
    isSearch: state => state.isSearch,
    isSettingShow: state => state.isSettingShow,
    settingItems: state => state.settingItems,
    isRefreshPage: state => state.isRefreshPage,
    isRemaindMicroRight: state => state.isRemaindMicroRight,
    microTip: state => state.microTip
  },
  mutations: {
    [types.SetAppLoading] (state, bool) {
      state.isAppLoading = bool
    },
    [types.SetVoiceList] (state, list) {
      state.voiceList = list
    },
    [types.SetPlayingVoiceUrl] (state, url) {
      state.playingVoiceUrl = url
    },
    [types.SetRecording] (state, bool) {
      state.isRecording = bool
    },
    [types.SetIsSearch] (state, bool) {
      state.isSearch = bool
    },
    [types.SetSettingShow] (state, bool) {
      state.isSettingShow = bool
    },
    [types.SetSettingItems] (state, obj) {
      state.settingItems = obj
    },
    [types.SetReFreshPage] (state, bool) {
      state.isRefreshPage = bool
    },
    [types.SetIsRemaindMicroRight] (state, bool) {
      state.isRemaindMicroRight = bool
    },
    [types.SetMicroTip] (state, bool) {
      state.microTip = bool
    },
    [types.SetPttAble] (state, bool) {
      state.pttAble = bool
    }
  }
}
