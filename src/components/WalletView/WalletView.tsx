import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account';
import { useWalletStore } from '@/stores/wallet';

import { VBtn, VDivider, VTab, VTabs } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { DisplayAddress } from '@/components/DisplayAddress';

export const WalletView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);

    const balanceStore = useWalletStore();
    const { balance } = storeToRefs(balanceStore);

    return () => (
      <InnerContainer>
        <div class="d-flex justify-space-between mb-4">
          <div>
            <div class="text-h3 mb-2">My wallet</div>
            <DisplayAddress address={address.value} />
          </div>

          <div class="text-right">
            <div class="text-h4 mt-1 mb-3">{balance.value?.data.actual} DEIP</div>
            {/*<div class="text-subtitle-1">(~$100.00)</div>*/}
            <div>
              <VBtn
                size="small"
                color="primary"
                to={{ name: 'action.send' }}
              >
                Send
              </VBtn>

              <VBtn
                size="small"
                color={'secondary-btn'}
                to={{ name: 'action.receive' }}
                class={'ml-2'}
              >
                Receive
              </VBtn>
            </div>
          </div>
        </div>

        <VTabs class="mx-n6" style="height: 64px">
          <VTab to={{ name: 'wallet' }}>assets</VTab>
          <VTab to={{ name: 'wallet.transactions' }}>transactions</VTab>
        </VTabs>

        <VDivider class="mx-n12 mb-12"/>

        <RouterView/>
      </InnerContainer>
    );
  }
});
