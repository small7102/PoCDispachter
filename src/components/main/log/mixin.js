import language from '@/libs/language'

export default {
  computed: {
    Col () {
      if (this.languageCtx) {
        return [{
          title: this.languageCtx.tabelTitle.time,
          key: 'date',
          align: 'center'
        },
        {
          title: this.languageCtx.tabelTitle.name,
          key: 'name',
          align: 'center'
        },
        {
          title: this.languageCtx.tabelTitle.type,
          key: 'type',
          align: 'center'
        },
        {
          title: this.languageCtx.tabelTitle.remark,
          key: 'remark',
          align: 'center'
        }
        ]
      }
    }
  },
  data () {
    return {
      tableHeight: document.body.clientHeight - 140,
      languageCtx: null
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].log
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.tableHeight = document.body.clientHeight - 140
    })
  }
}
