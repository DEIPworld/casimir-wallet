import { defineComponent, onBeforeMount, onBeforeUnmount, watch, toRef } from 'vue';
import { RouterView } from 'vue-router';

import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useAccountStore } from '@/stores/account';

export const MultisigView = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const multisigStore = useMultisigWalletStore();
    const address = toRef(props, 'address');
    const accountStore = useAccountStore();

    onBeforeMount(() => {
      accountStore.getMultisigAccountDetails(props.address);
      multisigStore.subscribeToTransfers(props.address);
      multisigStore.getAccountBalance(props.address);
      multisigStore.getPendingApprovals(props.address);
    });

    onBeforeUnmount(() => {
      multisigStore.clear();
      multisigStore.unsubscribeFromTransfers(props.address);
    });

    watch(address, (currentAddress, prevAddress) => {
      multisigStore.clear();

      accountStore.getMultisigAccountDetails(currentAddress);
      multisigStore.subscribeToTransfers(currentAddress);
      multisigStore.getAccountBalance(currentAddress);
      multisigStore.getPendingApprovals(currentAddress);

      multisigStore.unsubscribeFromTransfers(prevAddress);
    });

    return () => (
        <RouterView />
    );
  }
});
