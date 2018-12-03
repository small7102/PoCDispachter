import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import mixin from '@/store/mixins/mixin'
import { uniqueArr, debounce, filterObjArrByKey } from '@/utils/utils'
import {TempGroupInfo} from '@/libs/dom'
const CREAT_TEMP_BY_MYSELF = 0
export default{
  mixins: [mixin],
  created() {
    this.debounce = debounce(this.messageAlert.bind(this,'warning', '您不能与自己创建单呼'), 300)
  },
  methods: {
    addTempGroup ({tempInfo, creatType}) { // 创建临时群组
      let user = this.$store.getters.userInfo
      let treeGroupSelectedList = this.$store.getters.treeGroupSelectedList
      if (this.$store.getters.singleCallActiveCid === user.msId || (treeGroupSelectedList.length === 1 && treeGroupSelectedList[0] === user.msId)) {
        this.$store.commit(app.SetAppLoading, false)
        this.$store.commit(types.SetTreeGroupSelectedList, [])
        this.$store.commit(types.SetSingleCallActiveCid, '')
        this.debounce()
        return
      }
      this.$store.dispatch(types.CreatTempGroup).then(({code, cids, members}) => {
        this.$store.commit(app.SetAppLoading, false)
        this.messageNotice(code)
        this.successCreat(code, cids, members, tempInfo, creatType)
        this.failureCreat(code)
      })
    },
    toCreatTempGroup ({tempInfo, creatType}) {
      if (typeof tempInfo === 'object' && this.$store.getters.tempGroupInfo) { // 判断是否已经有了一样的临时群组
        if (this.$store.getters.tempGroupInfo.id === tempInfo.id) {
          const HAS_TEMPGROUP_TIP = 3
          this.messageNotice(HAS_TEMPGROUP_TIP)
          return
        }
      }
      this.addTempGroup({tempInfo, creatType})
    },
    successCreat (code, cids, members, info, type) {
      let state
      if (code === 2 || code === 1) { // 创建临时群组成功
        let onlineLength = members.filter(item => {return item.online === '1'}).length
        let tempGroupInfo = new TempGroupInfo({
          name: '无',
          type: CREAT_TEMP_BY_MYSELF, // 自己创造的
          cids: cids,
          length: members.length,
          creater: this.$store.getters.userInfo.msName,
          onlineLength
        })
        if (typeof info === 'object') {
          state = `${info.name}临时群组`
          tempGroupInfo.name = info.name
          tempGroupInfo.id = info.id
        } else {
          state = '临时群组'
        }
        
        if (code === 1) { // 创建单呼
          state = `与${members[1].name}单呼`
        }
        
        if (type === 'SINGLE_TEMP_GROUP') { // 成员页创建的单呼
          tempGroupInfo.creatType = 'SINGLE_TEMP_GROUP'
        }
        this.$store.commit(types.SetTreeGroupSelectedList, []) // 清楚选款的选择
        this.$store.commit(types.SetNowStatus, state)
        this.$store.commit(types.SetTempGroupInfo, tempGroupInfo)
        this.$emit('on-success')
      }
    },
    failureCreat (code) {
      if (code === 4) {
        this.nowGroup()
        this.$store.commit(types.SetSingleCallActiveCid, '')
        this.$store.commit(types.SetTreeGroupSelectedList, []) // 清楚选款的选择
      }
    },
    handleClose () { // 关闭临时群组
      let tempGroupInfo = this.$store.getters.tempGroupInfo
      if (tempGroupInfo) {
          this.$store.dispatch(types.RemoveTempGroup, tempGroupInfo.type).then(() => {//解散群组指令
            this.$store.commit(app.SetAppLoading, false)
            let state = tempGroupInfo.type === CREAT_TEMP_BY_MYSELF ? tempGroupInfo.creatType ? '单呼已取消' : '临时群组已取消' : '您已退出临时群组'
            this.messageAlert('success', state)
            this.nowGroup()
            this.$store.commit(types.SetGroupTempList, [])
            this.$store.commit(types.SetSingleCallActiveCid, '')
            this.$store.commit(types.SetTempGroupInfo, null)
          })
      }
    },
    messageNotice (res) {
      const message = {
          0: {
            type: 'error',
            info: '请选择临时群组成员'
          },
          1: {
            type: 'success',
            info: '单呼创建成功'
          },
          2: {
            type: 'success',
            info : '创建临时群组成功'
          },
          3: {
            type: 'error',
            info: '该临时群组已存在'
          },
          4: {
            type: 'warning',
            info: '对方正忙'
          }
        }
        this.messageAlert(message[res].type, message[res].info)
    }
  }
}