<script lang="ts">
  // Lib
  import { defineComponent } from 'vue';

  // Components
  import Container from '@/components/Container.vue';
  import Button from '@/components/Button.vue';

  export default defineComponent({
    components: {
      Container,
      Button,
    },
  });
</script>

<template>
  <Container class-name="container--black">
    <Button>
      Create an account
    </Button>
    <Button class-name="button--transparent">
      Import an existing account
    </Button>
  </Container>
</template>
