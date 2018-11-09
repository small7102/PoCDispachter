import * as types from './types/group'
import {Message} from 'iview'
export default {
  methods: {
    iconImg (type, online) {
      let url = ''

      switch (type) {
        case '20':
          url = this.getOnlineImg('Dispatcher', online)
          break
        case '10':
          url = this.getOnlineImg('App', online)
          break
        default:
          url = this.getOnlineImg('Poc', online)
          break
      }

      return url
    },
    getOnlineImg (iconName, online) {
      let imgName = online === '0' ? `outline${iconName}` : iconName
      let url = require(`../assets/device-icon/${imgName}.png`)

      return url
    },
    upMyself () {
      let user = this.$store.getters.userInfo
      let memberList = [...this.$store.getters.memberList[user.gId]]
      let obj = {}
      let msIndex

      memberList.forEach((value, index) => {
        if (value.cid === user.msId) {
          obj = {...value, online: '1'}
          this.$store.commit(types.SetMyself, obj)
          msIndex = index
        }
      })
      let newMemberList = []
      newMemberList.push(obj)
      memberList.splice(msIndex, 1)
      newMemberList = newMemberList.concat(memberList)

      this.$store.commit(types.SetMemberList, {item: newMemberList, gid: user.gId})
    },
    messageAlert (type, text) {
      Message.config({
        top: 80,
        duration: 2
      })

      Message.info({
        render: h => {
          return h('Alert', {
            props: {
              type,
              showIcon: true
            }
          }, text)
        }
      })
    }
  }
}
