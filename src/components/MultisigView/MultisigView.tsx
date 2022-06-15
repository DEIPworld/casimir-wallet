import { RouterView } from 'vue-router';
import { defineComponent } from 'vue';

export const MultisigView = defineComponent({
  setup() {
    return () => (
        <RouterView />
    );
  }
});
