export function getTrees (list, parentId) {
  let items = {}
  // 获取每个节点的直属子节点，*记住是直属，不是所有子节点
  for (let i = 0; i < list.length; i++) {
    let key = list[i].fid
    if (items[key]) {
      items[key].push(list[i])
    } else {
      items[key] = []
      items[key].push(list[i])
    }
  }
  // return items
  return formatTree(items, parentId)
}

/**
* 利用递归格式化每个节点
*/
function formatTree (items, parentId, deep = 0) {
  let result = []
  if (!items[parentId]) {
    return result
  }
  for (let t of items[parentId]) {
    t.deep = deep
    let childDeep = deep + 1
    let value = {...t}
    value.children = formatTree(items, value.gid, childDeep)
    result.push(value)
  }
  return result
}

/**
* 比较两个数组，筛选出不同
*/
export function filterArr (arr1, arr2) {
  let result = []
  if (!arr1 || !Array.isArray(arr1)) return
  if (!arr2 || !Array.isArray(arr2)) return
  if (arr1.length < arr2.length) [arr1, arr2] = [arr2, arr1]

  for (let value of arr1) {
    let res = arr2.some(item => {
      return item === value
    })
    if (!res) result = result.concat(value)
  }

  return result
}

/**
* 比较两个数组，筛选出符号条件的
*/
export function filterArrByKey (arr, objArr, key) {
  let result = []
  if (!arr || !Array.isArray(arr)) return
  if (!objArr || !Array.isArray(objArr)) return

  for (let value of arr) {
    for (let item of objArr) {
      let obj = {...item}
      if (obj[key] === value) result.push(item)
    }
  }

  return result
}

/**
* 筛选树节点到根节点
*/
export function getTreeList (list, fid, result = []) {
  if (fid === 0) return
  for (let value of list) {
    if (fid === value.gid) {
      result.push(value.gid)
      getTreeList(list, value.fid, result)
    }
  }
}

/**
* 数组选项是对象的去重
*/

export function uniqueArr (list, key = 'cid') {
  if (!list || !Array.isArray(list) || list.length < 1) return

  let res = []
  let obj = {}
  for (let value of list) {
    if (!obj[value[key]]) {
      res.push(value)
      obj[value[key]] = 1
    }
  }

  return res
}
