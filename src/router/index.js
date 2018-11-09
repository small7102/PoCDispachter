import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/main'
import Storage from '@/utils/localStorage'

Vue.use(Router)

const router = new Router({
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
    }
  ]
})

const LOGIN_PAGE_NAME = 'login'

router.beforeEach((to, from, next) => {
  const token = Storage.localGet('token')
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录G页
    next({
      name: LOGIN_PAGE_NAME
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    next()
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    next()
  } else {
    next()
    Storage.localRemove('token')
  }
})

export default router
