import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { VSheet, VBtn } from 'vuetify/components';

import { useMultisigWalletStore } from '@/stores/multisigWallet';

export const MultisigApprovalsList = defineComponent({
  emits: ['click:select'],
  setup(props, { emit }) {
    const multisigStore = useMultisigWalletStore();
    const { pendingApprovals } = storeToRefs(multisigStore);

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
            onClick={() => emit('click:select', item)}
          >
            View
          </VBtn>
        </VSheet>
      ));

    return renderApprovalsList;
  }
});
