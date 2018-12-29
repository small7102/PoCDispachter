<template>
  <div class="home-wrap flex">
    <div class="top">
      <img src="../../../assets/kirisun.png" alt class="logo">
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
          <div class="title">{{languageCtx.title}}</div>
          <Alert
            type="error"
            show-icon
            closable
            class="form-item pa error-tips"
            v-if="userError"
          >{{errorMessage}}</Alert>
          <form-item prop="user" class="form-item">
            <i-input
              type="text"
              v-model="loginItem.user"
              placeholder="user"
              class="inp"
              size="large"
            >
              <i-icon type="ios-person-outline" slot="prepend" size="22"></i-icon>
            </i-input>
          </form-item>
          <form-item prop="password" class="form-item">
            <i-input
              type="password"
              v-model="loginItem.password"
              placeholder="password"
              class="inp"
              size="large"
            >
              <i-icon type="ios-lock-outline" slot="prepend" size="22"></i-icon>
            </i-input>
          </form-item>
          <div class="forget flex between">
            <Checkbox v-model="isRememberPw">{{languageCtx.rememberPassword}}</Checkbox>
          </div>
          <form-item class="btn-item">
            <i-button
              shape="circle"
              class="btn"
              :loading="isLoading"
              @click="handleSubmit('loginItem')"
            >{{languageCtx.loginBtnText}}</i-button>
          </form-item>
        </i-form>
        <p>Fujian Kirisun Communications Co,Ltd V.1.0</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Radio, Input, Icon, Button, FormItem, RadioGroup } from "iview";
import { login, token, getRecorder } from "@/libs/webDispatcher-sdk.js";
import Storage from "@/utils/localStorage";
import { setCookie, getCookie, delCookie } from "@/utils/cookie";
import * as types from "@/store/types/user";
import * as app from "@/store/types/app";
import * as log from "@/store/types/log"
import language from '@/libs/language'

export default {
  name: "Login",
  components: {
    "i-form": Form,
    "i-radio": Radio,
    "i-input": Input,
    "i-icon": Icon,
    "i-button": Button,
    "form-item": FormItem,
    "radio-group": RadioGroup
  },
  computed: {
    languageCtx () {
      return language[this.loginItem.language].login
    },
    isRemaindMicroRight: {
      get () {
        return this.$store.getters.isRemaindMicroRight
      },
      set (val) {
        this.$store.commit(app.SetIsRemaindMicroRight, val)
      }
    }
  },
  data() {
    const validateUser = (rule, value, callback) => {
      this.userError = false;
      if (!value) {
        return callback(new Error(this.languageCtx.noUserAlert));
      } else if (value.length !== 11) {
        return callback(new Error(this.languageCtx.errorLengthAlert));
      } else {
        callback();
      }
    };

    const validatePass = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.languageCtx.noPasswordAlert));
      } else if (value.length !== 6) {
        return callback(new Error(this.languageCtx.errorPasswordLengthAlert));
      } else {
        callback();
      }
    };
    return {
      isLoading: false,
      userError: false,
      isRememberPw: true,
      isRemaind: false,
      errorMessage: "",
      loginItem: {
        language: "Chinese",
        user: "",
        password: ""
      },
      ruleInline: {
        user: [{ validator: validateUser, trigger: "blur" }],
        password: [{ validator: validatePass, trigger: "blur" }]
      }
    };
  },
  created() {
    this.initAccountInfo();
  },
  mounted() {
    document.onkeydown = ev => {
      this.enterHandleSubmit(ev);
    };
  },
  methods: {
    initAccountInfo() {
      if (this.isRememberPw) {
        let accountInfo = getCookie("accountInfo");
        if (accountInfo) {
          let { user, password, language } = this.loginItem;
          let index = accountInfo.indexOf("&");
          user = accountInfo.substring(0, index);
          password = accountInfo.substring(index + 1);
          this.loginItem = { user, password, language };
        }
      }
    },
    saveAccountInfo() {
      if (this.isRememberPw) {
        let accountInfo = this.loginItem.user + "&" + this.loginItem.password;
        setCookie("accountInfo", accountInfo);
      } else {
        delCookie("accountInfo");
        this.loginItem = { user: "", password: "", language: this.$store.getters.language };
      }
    },
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let account = this.loginItem.user;
          let password = this.loginItem.password;
          this.isLoading = true;
          this.$store
            .dispatch(types.GetUserInfo, { account, password })
            .then(res => {
              this.isLoading = false;
              this.saveAccountInfo();
              this.$store.commit(types.SetLanguage, this.loginItem.language);
              this.$store.commit(app.SetReFreshPage, true);
              this.$router.replace({ name: "home" });
            }).catch(code => {
              this.isLoading = false;
              this.userError = true;
              this.getUserErrorTip(code);
            });
        }
      });
    },
    getUserErrorTip(code) {
      this.errorMessage = this.languageCtx.message[code];
    },
    enterHandleSubmit(ev) {
      if (ev.code === "Enter") {
        this.handleSubmit("loginItem");
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.home-wrap {
  width: 100%;
  height: 100%;
  background-image: -webkit-linear-gradient(-90deg, #1f8cdd, #1a4678);
  flex-direction: column;
}

.top {
  padding: 5px 10px;
  height: 40px;
  background: #ffffff;
}

.login-box-wrap {
  flex: 1;
}

.login-box {
  width: 600px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: -80px;
  padding-bottom: 20px;
  box-shadow: 20px 20px 80px rgba(5, 30, 54, 0.1);
  transition: all 0.4s;

  .iform {
    color: #ffffff;
    padding: 20px 30px;

    .top-item {
      flex-direction: row-reverse;
    }

    .i-radio {
      margin-left: 20px;
    }

    .title {
      font-size: 36px;
      color: #fefefe;
      text-align: center;
      margin-bottom: 50px;
      font-weight: bold;
      -webkit-box-reflect: below 1px -webkit-gradient(linear, 0 -8, 0 100%, from(transparent), color-stop(0.5, transparent), to(rgba(245, 245, 245, 0.1)));
    }

    .form-item {
      margin: 0 auto 24px auto;
      display: block;
      width: 300px;

      &.error-tips {
        left: 50%;
        transform: translateX(-50%);
        top: 120px;
        font-size: 12px;
        height: 30px;
        line-height: 10px;

        .ivu-alert-close .ivu-icon-ios-close {
          top: 0px;
        }
      }
    }

    .inp {
      height: 36px;
      border-radius: 36px;
    }

    .forget {
      font-size: 12px;
      width: 300px;
      margin: 0 auto;
      color: #e7e7e7;
    }

    .btn-item {
      width: 100px;
      margin: 20px auto;
      display: block;
    }

    .btn {
      background: #1f8cdd;
      width: 100px;
      height: 30px;
      color: #ffffff;
      border: none;
      box-shadow: 0px 6px 30px rgba(11, 36, 124, 0.4);

      &:hover {
        background: #207cc1;
      }
    }
  }

  p {
    text-align: center;
    font-size: 10px;
    color: #a2b4c7;
    font-family: Arial, serif;
  }

  .tip-title {
    font-size: 16px;
    font-weight: bold !important
  }
}
</style>
