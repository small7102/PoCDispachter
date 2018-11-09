<template>
    <div class="home-wrap flex">
        <div class="top">
          <img src="../../../assets/kirisun.png" alt="" class="logo">
        </div>
        <div class="login-box-wrap flex align-center justify-center">
          <div class="login-box">
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
                <i-button shape="circle" class="btn" @click="handleSubmit('loginItem')">Login</i-button>
              </form-item>
            </i-form>
            <p>Fujian Kirisun Communications Co,Ltd V.1.0</p>
          </div>
        </div>
    </div>
</template>

<script>
import {Form, Radio, Input, Icon, Button, FormItem, RadioGroup} from 'iview'
import { login, webSocket } from '@/libs/webDispatcher-sdk.js'
import { CALLBACK_CODE } from '@/sdkJs/apiCode'
import Storage from '@/utils/localStorage'
import * as types from '@/store/types/user'
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
    return {
      loginItem: {
        language: 'Chinese',
        user: '',
        password: '',
        recodeRight: ''
      },
      ruleInline: {
        user: [
          { required: true, message: 'Please fill in the user name', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Please fill in the password.', trigger: 'blur' },
          { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let account = this.loginItem.user
          let password = this.loginItem.password

          login(account, password, (res) => {
            if (res && res.code === CALLBACK_CODE) {
              Storage.localSet('token', res)
              console.log(webSocket)
              // let userInfo = `${res.msName}[${res.pttGroup}]`
              this.$store.commit(types.SetMySocket, webSocket)
              this.$store.commit(types.SetUserInfo, res)
              this.$router.replace({name: 'home', params: res})
            }
          })
        } else {
          this.$Message.error('Fail!')
        }
      })
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
    height 400px
    border-radius 6px
    background rgba(255, 255, 255, .1)
    margin-top -80px
    box-shadow 20px 20px 80px rgba(5, 30, 54, 0.1)
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
        margin-bottom 30px
        font-weight bold
        -webkit-box-reflect below 1px -webkit-gradient(linear, 0 -8, 0 100%, from(transparent), color-stop(.5, transparent), to(rgba(245, 245, 245, .1)))
      .form-item
        margin 0 auto 24px auto
        display block
        width 300px
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
