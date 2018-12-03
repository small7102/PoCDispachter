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
  constructor ({name, type, length, id, cids = [], creatType, creater, onlineLength}) {
    this.name = name
    this.type = type
    this.length = length
    this.id = id
    this.cids = cids
    this.creatType = creatType,
    this.creater = creater
    this.onlineLength = onlineLength
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