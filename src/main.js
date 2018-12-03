import Vue from 'vue'
// import VueGoogleMaps from 'vue2-google-maps'
import App from './App'
import router from './router'
import store from './store'
import { Button, Layout, Content, Header, Footer, Sider, Icon, Form, Input, Menu, Submenu, Checkbox, CheckboxGroup, Modal, Message,
  FormItem, Alert, Row, Col, Spin, Grid, Avatar, Card, Scroll, Poptip, Notice, Switch } from 'iview'
import 'iview/dist/styles/iview.css'
import '@/assets/styles/index.styl'

const VueGoogleMaps = require('vue2-google-maps');

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyBAOBjG5ffPH5H6a-8QDlwm7t1L5snOjzU',
    v: '3.exp',
    installComponents: false,
    libraries: 'places'
  }
})
// AMap.initAMapApiLoader({
//   key: '688cc2b560762ab60c38207623d82b79',
//   plugin: ['AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType']
// })


Vue.component('Button', Button)
Vue.component('Layout', Layout)
Vue.component('Content', Content)
Vue.component('Header', Header)
Vue.component('Footer', Footer)
Vue.component('Sider', Sider)
Vue.component('Icon', Icon)
Vue.component('Form', Form)
Vue.component('Input', Input)
Vue.component('Menu', Menu)
Vue.component('Submenu', Submenu)
Vue.component('Checkbox', Checkbox)
Vue.component('CheckboxGroup', CheckboxGroup)
Vue.component('Modal', Modal)
Vue.component('FormItem', FormItem)
Vue.component('Alert', Alert)
Vue.component('Row', Row)
Vue.component('Col', Col)
Vue.component('Spin', Spin)
Vue.component('Avatar', Avatar)
Vue.component('Card', Card)
Vue.component('Scroll', Scroll)
Vue.component('Poptip', Poptip)
Vue.component('Switch', Switch)

Vue.config.productionTip = false

Vue.prototype.messageAlert = (type, text) => {
  Message.config({
    top: 80,
    duration: 1
  })

  Message.info({
    render: h => {
      return h('Alert', {
        props: {
          type,
          showIcon: true
        }
      }, text)
    }
  })
}

Vue.prototype.noticeAlert = (type, text) => {
  Notice.config({
    top: 50,
    duration: 2
  })

  Notice[type]({
    title: text
  })
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
