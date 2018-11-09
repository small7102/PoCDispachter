import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { Button, Layout, Content, Header, Footer, Sider, Icon, Form, Input, Menu, Submenu, Checkbox, CheckboxGroup, Modal, Message,
  FormItem, Alert } from 'iview'
import 'iview/dist/styles/iview.css'
import '@/assets/styles/index.styl'

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
Vue.component('Message', Message)
Vue.component('FormItem', FormItem)
Vue.component('Alert', Alert)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
