import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { VSheet, VBtn } from 'vuetify/components';

import { useMultisigWalletStore } from '@/stores/multisigWallet';

export const MultisigApprovals = defineComponent({
  setup() {
    const router = useRouter();

    const multisigStore = useMultisigWalletStore();
    const { pendingApprovals } = storeToRefs(multisigStore);

    const onOpenDetailsView = (approvalId: string): void => {
      router.push({ name: 'multisig.approvalDetails', params: { approvalId } });
    };

    const renderApprovalsList = () =>
      pendingApprovals.value.map((item) => (
        <VSheet
          key={item.callData}
          rounded
          color="rgba(255,255,255,.1)"
          class="mt-4 pa-4 d-flex justify-space-between align-center"
        >
          <span class="text-h6 text-truncate">{item.callHash}</span>
          <VBtn
            size="small"
            color={'secondary-btn'}
            class="ml-8"
            onClick={() => onOpenDetailsView(item._id)}
          >
            View
          </VBtn>
        </VSheet>
      ));

    return renderApprovalsList;
  }
});
