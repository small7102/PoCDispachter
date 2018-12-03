import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/main'
import Storage from '@/utils/localStorage'
import store from '../store'

Vue.use(Router)

const router = new Router({
  history: true,
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/main/login')
    },
    {
      path: '/',
      name: 'index',
      component: Main,
      redirect: '/home',
      meta: {
        hideInMenu: true,
        notCache: true
      },
      children: [
        {
          path: '/home',
          name: 'home',
          meta: {
            hideInMenu: true,
            title: '首页',
            notCache: true
          },
          component: () => import('@/components/main/home')
        }
      ]
    },
    {
      path: '/map',
      name: 'map',
      component: Main,
      children: [
        {
          path: '/monitoring',
          name: 'monitoring',
          meta: {
            hideInMenu: true,
            title: '地图',
            notCache: true
          },
          component: () => import('@/components/main/map-monitoring')
        }
      ]
    }
  ]
})

const LOGIN_PAGE_NAME = 'login'

router.beforeEach((to, from, next) => {
  const token = Storage.localGet('token')
  // console.log('我是这个',token, from.name)
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录G页
    next({
      name: LOGIN_PAGE_NAME
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    next()
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    next()
  } else if (token && to.name !== LOGIN_PAGE_NAME){
    if (from.name !== LOGIN_PAGE_NAME) {
      // console.log('我在这里')
      store.dispatch('user/GetUserInfo', Storage.sessionGet('user')).then((res)=>{
        store.commit('app/SetReFreshPage', true)
        next()
      })
    } else {
      next()
    }
    // Storage.localRemove('token')
  }
})

export default router
