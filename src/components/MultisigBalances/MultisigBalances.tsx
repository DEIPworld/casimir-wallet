import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { VSheet } from 'vuetify/components';

import { useMultisigWalletStore } from '@/stores/multisigWallet';

export const MultisigBalances = defineComponent({
  setup() {
    const multisigStore = useMultisigWalletStore();
    const { balance } = storeToRefs(multisigStore);

    return () => (
      <VSheet
        rounded
        color="rgba(255,255,255,.1)"
        class="pa-4 d-flex align-center"
      >
        <VSheet
          rounded="circle"
          border="outline"
          class="d-flex align-center justify-center text-caption mr-4"
          color="rgba(0,0,0,0)"
          width={40}
          height={40}
        >
          DEIP
        </VSheet>

        <div>
          <div class="text-h6">{balance.value?.data.free}</div>
          {/*<div class="text-subtitle-1">(~$100.00)</div>*/}
        </div>
      </VSheet>
    );
  }
});
