<script lang="ts">
  // Lib
  import { defineComponent } from 'vue';

  // Components
  import Header from '@/components/Header.vue';

  export default defineComponent({
    components: {
      Header,
    }
  });
</script>

<template>
  <Header />
  <router-view />
</template>
