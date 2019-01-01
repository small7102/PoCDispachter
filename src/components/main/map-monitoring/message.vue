<template>
  <div class="message-wrap">
    <Modal
        v-model="isModalShow"
        :title="languageCtx.messageCtx.title"
        width="500"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline">
          <FormItem prop="name">
          <Input autofocus type="textarea"
                 :placeholder="languageCtx.messageCtx.placeholder"
                 :autosize="{minRows: 2,maxRows: 4}"
                 size="large"
                 v-model="sendingMessage"
                 @on-keydown.stop="forbidTriggleVoice"/>
          </FormItem>
          <FormItem :style="{textAlign: 'right'}">
            <Button type="primary" @click="handleSendMessage" class="btn">{{languageCtx.messageCtx.submitText}}</Button>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
import language from './mixin'
import mixin from '@/store/mixins/message'

export default {
  name: 'Message',
  mixins: [language, mixin],
  data () {
    return {
      isModalShow: false,
      formInline: {
        message: ''
      }
    }
  },
  methods: {
    handleCommit () {

    }
  }
}
</script>

