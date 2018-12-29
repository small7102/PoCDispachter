<template>
  <div class="tabs">
    <router-link
      tag="a"
      class="link-item flex align-items"
      v-for="(item, index) in tabsList"
      :class="{active: index === activeIndex}"
      :key="index"
      :to="item.path"
      @click="activeIndex=index"
    >
      <Icon :style="iconWidth" :type="item.iconType" :size="item.iconSize"/>
      <span v-html="item.name"></span>
      <div class="right-arrow">
        <Icon type="ios-arrow-forward"/>
      </div>
    </router-link>
  </div>
</template>

<script>
import language from "@/libs/language";

export default {
  name: "Tabs",
  props: {
    iconWidth: {
      type: Object,
      default: () => {
        return {
          width: "25px",
          marginRight: "4px",
          lineHeight: "50px"
        };
      }
    }
  },
  computed: {
    tabsList() {
      if (this.languageCtx) {
        return [
          {
            name: this.languageCtx.voiceDispatcher,
            active: true,
            iconType: "ios-mic-outline",
            iconSize: 24,
            path: "/home"
          },
          {
            name: this.languageCtx.mapMonitoring,
            active: false,
            iconType: "ios-pin-outline",
            iconSize: 24,
            path: "/monitoring"
          },
          // {
          //   name: this.languageCtx.mapMonitoring,
          //   active: false,
          //   iconType: "ios-pin-outline",
          //   iconSize: 24,
          //   path: "/amonitoring"
          // },
          // {
          //   name: this.languageCtx.trackReplay,
          //   active: false,
          //   iconType: "ios-sync",
          //   iconSize: 22,
          //   path: "/a"
          // },
          {
            name: this.languageCtx.log,
            active: false,
            iconType: "ios-paper-outline",
            iconSize: 22,
            path: "/log"
          }
        ];
      }
    }
  },
  created() {
    this.languageType = this.$store.getters.language;
    this.languageCtx = language[this.languageType].tabs;
  },
  data() {
    return {
      activeIndex: "",
    };
  }
};
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/variable.styl';

.link-item {
  height: 50px;
  line-height: 50px;
  color: rgba(255, 255, 255, 0.8);
  background: $color-theme-weight;
  padding: 0 15px;
  line-height: 50px;
  transition: all 0.2s;
  overflow: hidden;

  span {
    width: 180px;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background: #3361a4;

    .right-arrow {
      transform: translateY(0);
    }
  }

  &.router-link-active {
    background: $color-theme-weight-d;
    color: #ffffff;

    &:hover {
      background: $color-theme-weight-d;
      opacity: 0.95;
    }
  }

  .right-arrow {
    transform: translateY(30px);
    transition: all 0.1s;
  }
}
</style>
