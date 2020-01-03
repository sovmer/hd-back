<template>
  <div class="datacard">
    <div class="header">{{ title }}</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'DataCard',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/_main.scss';

.datacard {
  border: 1px solid $space-color;
  border-radius: 4px;
}

.header {
  background: #F5F5F5;
  color: $primary-color;
  line-height: 40px;
  padding: 0 10px;
}
</style>