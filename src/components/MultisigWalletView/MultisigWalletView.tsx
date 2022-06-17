import { defineComponent, ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';

import { VBtn, VBadge, VDivider, VTab, VTabs } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useAccountStore } from '@/stores/account';
import { useMultisigWalletStore } from '@/stores/multisigWallet';

export const MultisigWalletView = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const accountStore = useAccountStore();
    const walletStore = useMultisigWalletStore();

    const { multisigAccountDetails } = storeToRefs(accountStore);
    const { balance, pendingApprovals } = storeToRefs(walletStore);

    onBeforeMount(async () => {
      // TODO: get transaction history without subscription if it is possible
      // multisigStore.subscribeToTransfers(props.address);
      walletStore.getAccountBalance(props.address);
    });

    onBeforeUnmount(() => {
      // TODO unsubscribe from updates
    });

    return () => (
      <InnerContainer>
        <div class="d-flex justify-space-between mb-4">
          <div>
            <div class="text-h3 mb-2">{multisigAccountDetails.value?.name}</div>
            <DisplayAddress address={props.address} />
          </div>

          <div class="text-right">
            <div class="text-h4 mt-1 mb-3">{balance.value?.data.actual} DEIP</div>
            <div>
              <VBtn size="small" color="primary" rounded={false} to={{ name: 'multisig.action.send' }}>
                Send
              </VBtn>

              <VBtn size="small" color={'secondary-btn'} class={'ml-2'} rounded={false} to={{ name: 'multisig.details' }}>
                Edit
              </VBtn>
            </div>
          </div>
        </div>

        <VTabs class="mx-n6" style="height: 64px">
          <VTab to={{ name: 'multisig.balances', params: { address: props.address } }}>assets</VTab>
          <VTab to={{ name: 'multisig.transactions', params: { address: props.address } }}>
            transactions
          </VTab>
          <VTab to={{ name: 'multisig.approvals', params: { address: props.address } }}>
            <span>approvals</span>
            <VBadge
              class="ml-2"
              inline
              content={pendingApprovals.value.length}
              textColor="white"
              color="#f44336"
            />
          </VTab>
        </VTabs>

        <VDivider class="mx-n12 mb-12" />

        <RouterView />
      </InnerContainer>
    );
  }
});
