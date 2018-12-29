<template>
  <div class="message-wrap">
    <Modal
        v-model="isModalShow"
        :title="title"
        width="500"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline">
          <FormItem prop="name">
          <Input autofocus type="textarea" 
                 :placeholder="placeholder" 
                 :autosize="{minRows: 2,maxRows: 4}" 
                 size="large" 
                 v-model="sendingMessage" 
                 @on-keydown.stop="forbidTriggleVoice"/>
          </FormItem>
          <FormItem :style="{textAlign: 'right'}">
            <Button type="primary" @click="handleSendMessage" class="btn">发送</Button>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
// import language from './mixin'
import mixin from '@/store/mixins/message'

export default {
  name: 'Message',
  props: {
    member: Object
  },
  mixins: [mixin],
  data () {
    return {
      isModalShow: false,
      formInline: {
        message: ''
      },
      placeholder: '请输入...',
      title: '短信'
    }
  },
  watch: {
    member (val) {
      if (val) {
        this.title = `短信 To ${this.member.name}`
      }
    }
  }
}
</script>

