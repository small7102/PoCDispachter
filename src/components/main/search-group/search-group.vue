<template>
  <div class="search-wrap">
    <Poptip trigger="focus" title="搜索结果" class="w100" width="240" placement="bottom-start">
      <Input class="w100 search-box"
            :autofocus="isAutofocus"
            v-model="searchName"
            @on-keydown.stop="forbiddenVoice"
            @on-change="handleChange"
            @on-blur="handleBlur"
            @on-focus="handleFocus"
            suffix="ios-search"
            :placeholder="languageCtx.placeholder"/>
      <div class="content" slot="content">
        <div class="no-result" v-if="!resultList.length">
          暂无结果...
        </div>
        <div class="result-list scroll-bar" v-else>
          <div class="item" v-for="item in resultList" :key="item.cid" @click.stop="selectItem(item)">
            <span>{{item.name}}</span>
          </div>
        </div>
      </div>
    </Poptip>
  </div>
</template>

<script>
import {debounce, filterObjArrByKey, getTreeList} from '@/utils/utils'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import language from '@/libs/language'

export default {
  name: 'SearchGroup',
  computed: {
    treeGroupSelectedList: {
      get () {
        return this.$store.state.group.treeGroupSelectedList
      },
      set (val) {
        this.$store.commit(types.SetTreeGroupSelectedList, val)
      }
    }
  },
  data () {
    return {
      searchName: '',
      languageCtx: null,
      resultList: [],
      isAutofocus: false
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].searchGroup
    this.debounceMessageAlert = debounce(this.messageAlert.bind(this, 'warning', this.languageCtx.noInpWarning), 300)
    this.debounceInput = debounce(this.checkInput.bind(this), 170)
  },
  methods: {
    handleFocus () {
      let openGroup = []
      let originGroupList = this.$store.getters.originGroupList

      for (let value of originGroupList) {
        openGroup.push(value.gid)
      }
      this.$store.commit(types.SetOpenGroup, openGroup)
    },
    handleChange () {
      this.debounceInput()
    },
    checkInput () {
      this.resultList = []
      if (this.searchName) {
        let memberObj = this.$store.state.group.memberList
        for (let key in memberObj) {
          for (let value of memberObj[key]) {
           if (value.name.indexOf(this.searchName) > -1) {
             this.resultList.push(value)
           }
          }
        }
      } else {
        return
      }
    },
    handleBlur () {
      this.searchName = ''
    },
    forbiddenVoice(){},
    selectItem(item) {
      let selectMember = [...this.treeGroupSelectedList]
      selectMember.unshift(item.cid)
      this.$store.commit(app.SetIsSearch, true)
      this.treeGroupSelectedList = selectMember
      this.resultList = []
    }
  }
}
</script>


<style lang="stylus" scoped>
@import '../../../assets/styles/variable.styl';

  .search-box
    width 240px
    line-height 36px
  .result-list
    max-height 280px
    overflow auto
    padding-right 5px
    .item
      line-height 30px
      padding-left 5px
      cursor pointer
      &:hover
        background $color-theme-light-ll
</style>
