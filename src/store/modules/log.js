import * as log from '../types/log'
import user from './user'
import {dateFmt} from '../../utils/utils'
import {codeConfig} from '../../libs/codeConfig'
import language from '@/libs/language'
export default {
  state: {
    operateLogData: [],
    gpsLogData: [],
    alarmLogData: []
  },
  getters: {
    OperateLogData: state => state.operateLogData,
    GpsLogData: state => state.gpsLogData,
    AlarmLogData: state => state.alarmLogData
  },
  mutations: {
    [log.SaveLog] (state, {account, name, type, remark}) {
      let map = {}
      map['date'] = dateFmt('yyyy-MM-dd hh:mm:ss', new Date())
      map['name'] = `(${account})${name}`
      map['type'] = language[user.state.language].store.logType[type]
      map['remark'] = remark
      if (type === codeConfig.GPSNotice) {
        state.gpsLogData.unshift(map)
      } else if (type === codeConfig.alarmNotice) {
        state.alarmLogData.unshift(map)
      } else {
        state.operateLogData.unshift(map)
      }
    },
    [log.SetGpsLogData] (state, newState) {
      state.gpsLogData = newState
    },
    [log.SetOperateLogData] (state, newState) {
      state.operateLogData = newState
    },
    [log.SetAlarmLogData] (state, newState) {
      state.alarmLogData = newState
    }
  }
}
