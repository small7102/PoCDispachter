import * as types from '../types/app'
import Storage from '@/utils/localStorage'
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
    }
  }
}