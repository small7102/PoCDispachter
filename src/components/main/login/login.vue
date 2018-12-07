<template>
    <div class="home-wrap flex">
        <div class="top">
          <img src="../../../assets/kirisun.png" alt="" class="logo">
        </div>
        <div class="login-box-wrap flex align-center justify-center">
          <div class="login-box pr">
            <i-form :model="loginItem" class="iform" :rules="ruleInline" ref="loginItem">
              <form-item prop="language" class="top-item flex">
                <radio-group v-model="loginItem.language">
                  <i-radio class="i-radio" label="Chinese">中文</i-radio>
                  <i-radio class="i-radio" label="English">English</i-radio>
                  <i-radio class="i-radio" label="Turkish">Türkçe</i-radio>
                </radio-group>
              </form-item>
              <div class="title">
                Poc Dispatcher
              </div>
              <Alert type="error" show-icon closable class="form-item pa error-tips" v-if="userError">{{errorMessage}}</Alert>
              <form-item prop="user" class="form-item">
                <i-input type="text" v-model="loginItem.user" placeholder="user" class="inp" size="large">
                  <i-icon type='ios-person-outline' slot="prepend" size='22'></i-icon>
                </i-input>
              </form-item>
              <form-item prop="password" class="form-item">
                <i-input type="password" v-model="loginItem.password" placeholder="password" class="inp" size="large">
                  <i-icon type='ios-lock-outline' slot="prepend" size='22'></i-icon>
                </i-input>
              </form-item>
              <div class="forget flex">Forget the password?</div>
              <form-item class="btn-item">
                <i-button shape="circle" class="btn" :loading="isLoading" @click="handleSubmit('loginItem')">Login</i-button>
              </form-item>
            </i-form>
            <p>Fujian Kirisun Communications Co,Ltd V.1.0</p>
          </div>
        </div>
    </div>
</template>

<script>
import {Form, Radio, Input, Icon, Button, FormItem, RadioGroup} from 'iview'
import { login, token } from '@/libs/webDispatcher-sdk.js'
import { CALLBACK_CODE } from '@/sdkJs/apiCode'
import Storage from '@/utils/localStorage'
import * as types from '@/store/types/user'
import * as app from '@/store/types/app'
// import * as sRecord from '@/libs/record'
// console.log(sRecord)

export default {
  name: 'Login',
  components: {
    'i-form': Form,
    'i-radio': Radio,
    'i-input': Input,
    'i-icon': Icon,
    'i-button': Button,
    'form-item': FormItem,
    'radio-group': RadioGroup
  },
  data () {
    const validateUser = (rule, value, callback) => {
      this.userError = false
      if (!value) {
        return callback(new Error('用户名不能为空')) 
      } else if (value.length !== 11) {
        return callback(new Error('用户名为11位字符串'))
      } else {
        callback()
      }
    }

    const validatePass = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入密码')) 
      } else if (value.length !==6) {
        return callback(new Error('密码长度为6'))
      } else {
        callback()
      }
    }
    return {
      isLoading: false,
      userError: false,
      errorMessage: '',
      loginItem: {
        language: 'Chinese',
        user: '',
        password: '',
        recodeRight: ''
      },
      ruleInline: {
        user: [
          { validator: validateUser, trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    document.onkeydown = (ev) => {
      this.enterHandleSubmit(ev)
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let account = this.loginItem.user
          let password = this.loginItem.password
          this.isLoading = true
          this.$store.dispatch(types.GetUserInfo, {account, password}).then((code) => {
            this.isLoading = false
            if (code === 0) {
              this.$store.commit(types.SetLanguage, this.loginItem.language)
              this.$store.commit(app.SetReFreshPage, true)
              this.$router.replace({name: 'home'})
            } else {
              console.log(code)
              this.userError = true
              this.getUserErrorTip(code)
            }
          })
        }
      })
    },
    getUserErrorTip (code) {
      const message = {
        1: '终端ID错误',
        2: '密码不正确',
        3: '没有默认群组',
        4: '账号被禁用',
        5: '在线到达上限，限制登录',
        6: '账号类型错误',
        '101': '系统繁忙',
        '102': '用户认证失败',
        '103': '用户没有注册',
        '104': '参数错误',
        '107': '没有权限操作'
      }

      this.errorMessage = message[code]
    },
    enterHandleSubmit (ev) {
      if (ev.code === 'Enter') {
        this.handleSubmit('loginItem')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .home-wrap
    width 100%
    height 100%
    background-image: -webkit-linear-gradient(-90deg, #1f8cdd, #1a4678)
    flex-direction column
  .top
    padding 5px 10px
    height 40px
    background #ffffff
  .login-box-wrap
    flex 1
  .login-box
    width 600px
    border-radius 6px
    background rgba(255, 255, 255, .1)
    margin-top -80px
    padding-bottom 20px
    box-shadow 20px 20px 80px rgba(5, 30, 54, 0.1)
    transition all .4s
    .iform
      color #ffffff
      padding 20px 30px
      .top-item
        flex-direction row-reverse
      .i-radio
        margin-left 20px
      .title
        font-size 36px
        color #fefefe
        text-align center
        margin-bottom 50px
        font-weight bold
        -webkit-box-reflect below 1px -webkit-gradient(linear, 0 -8, 0 100%, from(transparent), color-stop(.5, transparent), to(rgba(245, 245, 245, .1)))
      .form-item
        margin 0 auto 24px auto
        display block
        width 300px
        &.error-tips
          left 50%
          transform translateX(-50%)
          top 120px
          font-size 12px
          height 30px
          line-height 10px
          .ivu-alert-close .ivu-icon-ios-close
            top 0px
      .inp
        height 36px
        border-radius 36px
      .forget
        flex-direction row-reverse
        font-size 12px
        width 300px
        margin 0 auto
        color #e7e7e7
      .btn-item
        width 100px
        margin 20px auto
        display block
      .btn
        background #1f8cdd
        width 100px
        height 30px
        color #ffffff
        border none
        box-shadow 0px 6px 30px rgba(11, 36, 124, 0.4)
        &:hover
          background #207cc1
    p
      text-align center
      font-size 10px
      color #a2b4c7
      font-family Arial, serif
</style>
