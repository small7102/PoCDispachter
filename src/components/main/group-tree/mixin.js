export default {
  methods: {
    getPaddingLeft (deep) {
      return {
        paddingLeft: `${(deep + 1) * 24}px`
      }
    }
  }
}