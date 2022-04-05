<template>
  <div class="grid__cell">
    <slot />
  </div>
</template>

<style lang="scss">
  .grid__cell {
    width: calc(100% / 3);
    max-width: 100%;
  }
</style>
