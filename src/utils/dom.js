// 获取群组列表

export function getChildArrayList (list, parentlist) {
  if (!list) return
  if (!parentlist) return

  const res = parentlist.map((parentitem, index) => {
    const childList = list.filter(childitem => { // 筛选群组列表
      if (childitem.fid === parentitem.gid) {
        childitem.active = false // 默认闭合
      }
      return childitem.fid === parentitem.gid
    })

    if (!index) parentitem.active = true // 第一个展开
    parentitem.child = childList

    return parentitem
  })
  return res
}

export function toggleChildList (list, selectitem) {
  let id = selectitem.gid

  list.forEach(item => {
    if (item.gid === id) {
      console.log(selectitem.active)
      item.active = !selectitem.active
      console.log(item.active)
    } else {
      item.active = false
    }
  })

  console.log(list)
  return list
}

export function structedArrayList (list) {
  if (!list || !Array.isArray(list)) return
  let obj = {}
  for (let value of list) {
    if (obj[value.fid]) {
      obj[value.fid].push(value)
    } else {
      obj[value.fid] = []
      obj[value.fid].push(value)
    }
  }

  console.log(obj)
  return obj
}
