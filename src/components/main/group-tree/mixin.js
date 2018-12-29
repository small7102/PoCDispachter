import {debounce} from '@/utils/utils'
import * as types from '@/store/types/group'

export default {
  computed: {
    user () {
      return this.$store.getters.userInfo
    },
    originGroupList () {
      return this.$store.getters.originGroupList
    },
    singleCallActiveCid () {
      return this.$store.getters.singleCallActiveCid
    },
    tempGroupInfo () {
      return this.$store.state.group.tempGroupInfo
    },
    getOnline () {
      let memberObj = this.$store.getters.memberList
      if (!Object.keys(memberObj).length) return
      let obj = {}
      for (let key in memberObj) {
        if (memberObj[key]) {
          obj[key] = {}
          let childList = this.getChildGroupList(key)
          if (!childList.length) {
            obj[key].all = memberObj[key].length || 0
          } else {
            let all = memberObj[key].length
            childList.forEach(item => {
              all += memberObj[item.gid].length
            })
            obj[key].all = all
          }
          let onlineList = memberObj[key].filter(item => {
            return item.online === '1'
          })
          obj[key].onlineNum = onlineList.length
        }
      }
      return obj
    }
  },
  data () {
    return {
      switchGid: ''
    }
  },
  created () {
    this.debounce = debounce(this.messageAlert.bind(this, 'warning', '您已经在当前群组'), 300)
  },
  methods: {
    getPaddingLeft (deep) {
      deep = deep ? deep + 1 : 1
      return {
        paddingLeft: `${deep * 10}px`
      }
    },
    showSwitchIcon (item) {
      this.switchGid = item.gid
    },
    hideSwitchIcon () {
      this.switchGid = ''
    },
    handleSwitchGroup (item) {
      this.$store.commit(types.SetSwitchingGroup, item)
    },
    getChildGroupList (gid) {
      return this.originGroupList.filter(item => {
        return item.fid === gid
      })
    }
  }
}
