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
* 比较两个数组，筛选出符号条件的
*/
export function filterObjArrByKey (arr, objArr, key) {
  if (!Object.keys(objArr).length) return
  if (typeof arr === 'string') {
    let newArr = []
    newArr.push(arr)
    arr = newArr
  } else {
    if (!arr || !Array.isArray(arr)) return
  }
  let result = []
  for (let okey in objArr) {
    let item = filterArrByKey(arr, objArr[okey], key)
    result = result.concat(item)
  }
  return result
}

/**
* 筛选树节点到根节点
*/
export function getTreeList (list, fid, result = []) {
  if (fid === 0) return
  for (let value of list) {
    let obj = {...value}
    if (fid === obj.gid) {
      result.push(obj.gid)
      getTreeList(list, obj.fid, result)
    }
  }
}

/**
* 数组选项是对象的去重
*/

export function uniqueArr (list, pkey) {
  if (!list || !Array.isArray(list)) return
  if (list.length <= 1) return list
  let key = pkey || 'normal'

  let res = []
  let obj = {}
  for (let value of list) {
    if (key === 'normal') { // 普通数组去重
      if (!obj[value]) {
        res.push(value)
        obj[value] = 1
      }
    } else { // 对象数组去重
      if (!obj[value[key]]) {
        res.push(value)
        obj[value[key]] = 1
      }
    }
  }
  return res
}


/**
* 平分数组
*/
export function sliceArr(array, size) {
  var result = []
   for (var x = 0; x < Math.ceil(array.length / size); x++) {
    var start = x * size
    var end = start + size
    result.push(array.slice(start, end))
  }
  return result
}

// 在线置顶
export function upOnline (arr, key = 'online', code = '1') {
  if (!arr || !Array.isArray(arr)) return
  let result = []
  const onlineArr = arr.filter(item => {
    return item[key] === code
  })
  const outLineArr = arr.filter(item => {
    return item[key] !== code
  })

  return result = onlineArr.concat(outLineArr)
}

//深拷贝
export function deepClone(obj) {
  let objClone = Array.isArray(obj) ? [] : {}
  if(obj && typeof obj==="object"){
      for(key in obj){
          if(obj.hasOwnProperty(key)){
              //判断ojb子元素是否为对象，如果是，递归复制
              if(obj[key]&&typeof obj[key] ==="object"){
                  objClone[key] = deepClone(obj[key]);
              }else{
                  //如果不是，简单复制
                  objClone[key] = obj[key];
              }
          }
      }
  }
  return objClone;
}

/**
 * @param {String} fmt 传入时间格式
 * @param {Number} startType 要返回的时间字符串的格式类型，传入'year'则返回年开头的完整时间
 */
export function dateFmt(fmt,date) {
  const o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}

//防抖
export function debounce(fun, delay) {
  let timer
  return function (args) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(()=> {
         // console.log(timer)
          fun.call(this, args)
      }, delay)
  }
}

//节流
export function throttle(fun, delay) {
  let last, deferTimer
  return function (args) {
      let that = this
      let _args = arguments
      let now = +new Date()
      if (last && now < last + delay) {
          clearTimeout(deferTimer)
          deferTimer = setTimeout(function () {
              last = now
              fun.apply(that, _args)
          }, delay)
      }else {       
          last = now
          console.log('last:'+last)
          fun.apply(that,_args)
      }
  }
}

// 首字母转换成大写
export function toUpperCaseFirstChar (str) {
  if ( str && typeof str !== 'string') return

  let firstChar = str.charAt(0).toUpperCase()
  let elseChar = str.substr(1)

  return `${firstChar}${elseChar}`
}

/**
  * [hasIllegalChar 判断是否含有script非法字符]
  * @param  {[type]}  str [要判断的字符串]
  * @return {Boolean}     [true：含有，验证不通过；false:不含有，验证通过]
*/
export function hasIllegalChar(str) {
  return new RegExp(".*?script[^>]*?.*?(<\/.*?script.*?>)*", "ig").test(str);
}

export function getStrCharLength(str) {
  if ( str && typeof str !== 'string') return
  return str.replace(/[^\u0000-\u00ff]/g,"aa").length
}

export function isInContent (obj, parent) {
  while (obj && obj.tagName.toUpperCase() !== 'BODY') {
    if (obj === parent) {
      return true
    }
    obj = obj.parentNode
  }
  return false
}