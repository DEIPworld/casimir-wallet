import { defineComponent, watchEffect } from 'vue';
import { RouterView } from 'vue-router';

import { useAccountStore } from '@/stores/account';

export const MultisigView = defineComponent({
  props: {
    address: {
      type: String
    }
  },
  setup(props) {
    const accountStore = useAccountStore();

    watchEffect(() => {
      if (props.address) accountStore.getMultisigAccountDetails(props.address);
    });

    return () => (
        <RouterView />
    );
  }
});
