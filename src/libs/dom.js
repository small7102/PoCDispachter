export class Member {
  constructor ({cid, name, type, online, grp, callset}) {
    this.cid = cid
    this.name = name
    this.type = type
    this.online = online
    this.grp = grp
    this.callset = callset
  }
}

export class TempGroupInfo {
  constructor ({name, type, length = 0, id, cids = [], creatType, creater, onlineLength = 0}) {
    this.name = name || '无'
    this.type = type
    this.length = length
    this.id = id || '7878787878'
    this.cids = cids
    this.creatType = creatType,
    this.creater = creater
    this.onlineLength = onlineLength
    console.log(this)
  }

  someoneOnline () {
    this.length += 1
    return this
  }

  someoneOffline () {
    this.length = this.length >= 1 ? this.length - 1 : 0
    return this
  }

  quitTempGroup (callback) {
    this.length = this.length >= 1 ? this.length - 1 : 0
    // if (item.online === 1) this.onlineLength -= 1
    if (callback && typeof callback === 'function') callback()
    return this
  }
}

export class Message {
  constructor ({time, msName, others, msg, arrow, list}) {
    this.msName = msName
    this.time = time
    this.others = others
    this.msg = msg
    this.list = list
    this.arrow = arrow
  }

  addMessage () {
    if (!Array.isArray(this.list)) return
    this.list.unshift(this)
  }
}