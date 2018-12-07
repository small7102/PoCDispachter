<template>
  <div class="right-menu-wrap pa" :style="menuPosition">
    <Card shadow class="card" :padding="0">
      <p class="line" style="line-height: 30px;cursor: pointer;padding: 0 10px" @click.stop="setDefaultCenter">当屏设为默认中心</p>
      <p class="line" style="line-height: 30px;cursor: pointer;padding: 0 10px" @click.stop="moveToDefaultPoint">移到默认中心</p>
    </Card>
  </div>
</template>

<script>
export default {
  name: 'RightMenu',
  computed: {
    menuPosition () {
      return this.position
    },
  },
  data () {
    return {
      position: {
        left: 0,
        top: 0
      }
    }
  },
  methods: {
    setDefaultCenter() {
      this.$emit('on-set-defaut')
    },
    moveToDefaultPoint() {
      this.$emit('on-move')
    }
  }
}
</script>

<style lang="stylus" scoped>
.card
  padding 10px 0
.line
  line-height 30px
  transition all .2s
  cursor pointer
  padding-left 0 10px
  &:hover
    background #f5f5f5
</style>
