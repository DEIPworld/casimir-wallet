import { defineComponent } from 'vue';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { VBtn, VTab, VTabs } from 'vuetify/components';
import { useWalletStore } from '@/stores/wallet';
import { RouterView } from 'vue-router';
import { InnerContainer } from '@/components/InnerContainer';
import { DisplayAddress } from '@/components/DisplayAddress/DisplayAddress';

export const WalletView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);

    const balanceStore = useWalletStore();
    const { balance } = storeToRefs(balanceStore);

    return () => (
      <InnerContainer>
        <div class="d-flex justify-space-between mb-6">
          <div>
            <div class="text-h3 mb-2">My wallet</div>
            <DisplayAddress address={address.value} />

          </div>

          <div class="text-right">
            <div class="text-h3 mb-2">{balance.value?.data.actual} DEIP</div>
            {/*<div class="text-subtitle-1">(~$100.00)</div>*/}
          </div>
        </div>

        <div class="d-flex justify-space-between mb-6">
          <VTabs>
            <VTab to={{ name: 'wallet' }}>assets</VTab>
            <VTab to={{ name: 'wallet.transactions' }}>transactions</VTab>
          </VTabs>

          <div>
            <VBtn
              size="small"
              color={'primary'}
              to={{ name: 'wallet.deposit' }}
            >
              deposit
            </VBtn>
            <VBtn
              size="small"
              color={'secondary-btn'}
              to={{ name: 'wallet.send' }}
              class={'ml-4'}
            >
              send
            </VBtn>
          </div>
        </div>

        <RouterView/>
      </InnerContainer>
    );
  }
});
