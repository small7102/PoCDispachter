<template>
  <div class="search-wrap">
    <Input search 
           placeholder="请输入" 
           class="search-box"
           @on-search="handleSearch" 
           v-model="searchName"
           @on-keydown.stop="forbiddenVoice"
           @on-change="handleChange"
           @on-blur="handleBlur"/>
  </div>
</template>

<script>
import {debounce, filterObjArrByKey, getTreeList} from '@/utils/utils'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
export default {
  name: 'SearchGroup',
  data () {
    return {
      searchName: ''
    }
  },
  created () {
    this.debounceMessageAlert = debounce(this.messageAlert.bind(this, 'warning', '名称不能为空'), 300)
    this.debounceInput = debounce(this.checkInput.bind(this), 300)
  },
  methods: {
    handleSearch () {
      if (!this.searchName){
        this.debounceMessageAlert()
      } else {
        let nameArr = []
        nameArr.push(this.searchName)
        let res = filterObjArrByKey(nameArr, this.$store.getters.memberList, 'name') // 搜索结果
        if (!res.length) {
          this.messageAlert('warning', '该终端不存在')
        } else {
          this.locationName(res[0])
        }
      }
    },
    locationName (item) {
      let openedGroup = []
      let selectMember = []
      openedGroup.push(item.grp)
      selectMember.push(item.cid)

      let originGroupList = this.$store.getters.originGroupList
      let groupItem
      for (let value of originGroupList) {
        if (value.gid === item.grp) {
          groupItem = value
        }
      }
      
      getTreeList(originGroupList, groupItem.fid, openedGroup) // 得到展开群组的gid与它的父级gid组成的数组
      this.$store.commit(app.SetIsSearch, true)
      this.$store.commit(types.SetTreeGroupSelectedList, selectMember)
      this.$store.commit(types.SetOpenGroup, openedGroup)
    },
    handleChange () {
      this.debounceInput()
    },
    checkInput () {
      if (!this.searchName) {
        this.$store.commit(types.SetTreeGroupSelectedList, [])
      }
    },
    handleBlur () {
      this.$store.commit(app.SetIsSearch, false)
    },
    forbiddenVoice(){}
  }
}
</script>


<style lang="stylus" scoped>
</style>
