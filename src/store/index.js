import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import group from './modules/group'
import app from './modules/app'
import map from './modules/map'
import log from './modules/log'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    app,
    user,
    group,
    map,
    log
  }
})
