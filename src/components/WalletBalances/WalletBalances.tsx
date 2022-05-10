import { defineComponent, onMounted } from 'vue';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { VSheet } from 'vuetify/components';
import { useWalletStore } from '@/stores/wallet';

export const WalletBalances = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);

    const balanceStore = useWalletStore();
    const { balance } = storeToRefs(balanceStore);
    // const { getAccountBalance } = balanceStore;
    //
    // onMounted(async () => {
    //   await getAccountBalance(address.value);
    // });

    return () => (
      <VSheet
        rounded="lg"
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
