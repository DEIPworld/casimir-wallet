import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { VSheet, VBtn } from 'vuetify/components';

import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useVestingStore } from '@/stores/vesting';

import type { IMultisigTransactionItem, IMultisigVestingItem, ApprovalType } from '../../../types';

export const MultisigApprovals = defineComponent({
  setup() {
    const router = useRouter();

    const multisigStore = useMultisigWalletStore();
    const vestingStore = useVestingStore();

    const { pendingApprovals: pendingTransactions } = storeToRefs(multisigStore);
    const { pendingApprovals: pendingVestingClaims } = storeToRefs(vestingStore);

    const onOpenDetailsView = (approvalId: string, approvalType: ApprovalType): void => {
      router.push({ name: 'multisig.approvalDetails', params: { approvalId, approvalType } });
    };

    const renderItem = (
      item: IMultisigVestingItem | IMultisigTransactionItem,
      type: ApprovalType
    ) => (
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
          onClick={() => onOpenDetailsView(item._id, type)}
        >
          View
        </VBtn>
      </VSheet>
    );

    const renderApprovalsList = () => (
      <>
        {pendingTransactions.value.length > 0 && (
          <p class="ml-4 text-subtitle-1">Pending transfers</p>
        )}
        {pendingTransactions.value.map((item) => renderItem(item, 'transfer'))}
        {pendingVestingClaims.value.length > 0 && (
          <p class="mt-4 ml-4 text-subtitle-1">Pending vesting claims</p>
        )}
        {pendingVestingClaims.value.map((item) => renderItem(item, 'vesting'))}
      </>
    );

    return renderApprovalsList;
  }
});
