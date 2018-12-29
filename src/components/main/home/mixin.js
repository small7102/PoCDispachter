import language from '@/libs/language'
export default {
  data () {
    return {
      languageCtx: null
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].home
  }
}
