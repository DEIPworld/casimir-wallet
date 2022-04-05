<template>
  <div class="grid__cell">
    <slot />
  </div>
</template>

<style lang="scss">
  .grid__cell {
    max-width: calc(100% / 3);
    width: 100%;
  }
</style>
