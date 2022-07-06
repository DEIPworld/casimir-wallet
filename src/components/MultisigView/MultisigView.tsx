import { defineComponent, onBeforeMount, onBeforeUnmount, watch, toRef } from 'vue';
import { RouterView } from 'vue-router';

import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useVestingStore } from '@/stores/vesting';
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
    const vestingStore = useVestingStore();
    const accountStore = useAccountStore();

    const address = toRef(props, 'address');

    onBeforeMount(() => {
      accountStore.getMultisigAccountDetails(props.address);
      multisigStore.getAccountBalance(props.address);

      multisigStore.getPendingApprovals(props.address);
      vestingStore.getPendingApprovals(props.address);
    });

    onBeforeUnmount(() => {
      multisigStore.clear();
    });

    watch(address, (currentAddress) => {
      multisigStore.clear();

      accountStore.getMultisigAccountDetails(currentAddress);
      multisigStore.getAccountBalance(currentAddress);

      multisigStore.getPendingApprovals(currentAddress);
      vestingStore.getPendingApprovals(props.address);
    });

    return () => (
        <RouterView />
    );
  }
});
