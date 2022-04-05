<script lang="ts">
  // Lib
  import { defineComponent } from 'vue'

  // Components
  import Container from './Container.vue';

  export default defineComponent({
    name: 'Header',
    components: {
      Container,
    },
  });
</script>

<template>
  <div class="header">
    <Container>
      <router-link to="/">Logo</router-link>
    </Container>
  </div>
</template>

<style lang="scss">
  .header {
    padding: 14px 0;
    border: 2px solid rgba(0, 0, 0, 0.05);
  }
</style>
