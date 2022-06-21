import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { VSheet, VBtn } from 'vuetify/components';

import { useMultisigWalletStore } from '@/stores/multisigWallet';

import { ApprovalDetailsModal } from './ApprovalDetailsModal';

export const MultisigApprovals = defineComponent({
  setup() {
    const multisigStore = useMultisigWalletStore();
    const { pendingApprovals } = storeToRefs(multisigStore);

    const isOpen = ref<boolean>(false);
    const selectedTransaction = ref<object>({});

    const onSelect = (item: object) => {
      isOpen.value = true;
      selectedTransaction.value = item;
    }

    const onCloseModal = () => {
      isOpen.value = false;
      selectedTransaction.value = {};
    }

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
            rounded={false}
            size="small"
            color={'secondary-btn'}
            class="ml-8"
            onClick={() => onSelect(item)}
          >
            View
          </VBtn>
        </VSheet>
      ));

    return () => (
      <>
        {renderApprovalsList()}
        <ApprovalDetailsModal
          isOpen={isOpen.value}
          pendingApproval={selectedTransaction.value}
          onClick:cancel={() => (isOpen.value = false)}
        />
      </>
    );
  }
});
