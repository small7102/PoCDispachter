import {dateFmt, hasIllegalChar, getStrCharLength} from '@/utils/utils'
import {Message} from '@/libs/dom'
import mixin from '@/store/mixins/mixin'
import * as types from '@/store/types/group'

export default {
  mixins: [mixin],
  data () {
    return {
      sendingMessage: ''
    }
  },
  methods: {
    forbidTriggleVoice (ev) {
      if (ev.code === 'Enter') {
        this.handleSendMessage(ev)
        return false
      }
    },
    handleSendMessage (event) {
      this.sendingMessage = this.sendingMessage.replace(/[\r\n]/g, '')
      this.sendingMessage = this.sendingMessage.replace(/\ +/g, '')

      if (hasIllegalChar(this.sendingMessage)) {
        this.messageAlert('error', '不能包含非法字符')
        this.sendingMessage = ''
        return
      }

      if (!this.sendingMessage) {
        event.cancelBubble = true
        event.preventDefault()
        event.stopPropagation()
        this.messageAlert('warning', '’发送信息不能为空')
      } else {
        let strLength = getStrCharLength(this.sendingMessage)
        if (strLength > 400) {
          this.messageAlert('warning', '不能超过400个字符')
          return
        }
        let mid = this.member ? this.member.cid : ''
        this.$store.dispatch(types.SendSMS, {mid, msName: this.user.msName, msg: this.sendingMessage}).then(() => {
          let message = new Message({
            time: dateFmt('hh:mm:ss', new Date()),
            msName: this.user.msName,
            msg: this.sendingMessage,
            arrow: '>>',
            list: [...this.$store.getters.messageList],
            others: this.getReceivers()
          })

          message.addMessage()
          this.$store.commit(types.SetMessageList, message.list)
          this.sendingMessage = ''
          this.sendingMessage = this.sendingMessage.replace(/[\r\n]/g, '')
        })
      }
    },
    getReceivers () {
      let result = []
      let mids = []
      if (this.member) {
        result = this.member.name
        return result
      }
      if (this.tempGroupInfo) {
        mids = this.tempGroupInfo.cids
        mids.forEach(item => {
          let name = this.getSomeoneName(item)
          result.push(name)
        })
      } else {
        let gid = this.user.gId
        console.log(gid, this.memberObj)
        this.memberObj[gid].forEach(item => {
          let name = this.getSomeoneName(item.cid, gid)
          if (item.cid !== this.user.msId) result.push(name)
        })
      }
      result = result.join(',')
      return result
    }
  }
}
