<script>
 // Lib
 import { defineComponent } from 'vue';

 export default defineComponent({
   props: {
     className: {
       type: String,
     },
   },
 })
</script>

<template>
  <div class="container" v-bind:class="className">
    <slot />
  </div>
</template>

<style lang="scss">
  .container {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 70px;

    &--black {
      background: black;
    }
  }
</style>
