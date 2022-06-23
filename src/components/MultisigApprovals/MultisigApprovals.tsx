import { defineComponent, ref } from 'vue';

import { ApprovalsList } from './ApprovalsList';
import { ApprovalDetails } from './ApprovalDetails';

export const MultisigApprovals = defineComponent({
  setup() {
    const selectedTransaction = ref<object>();

    const onOpenDetailsView = (item: object) => {
      selectedTransaction.value = item;
    };

    const onCloseDetailsView = () => {
      selectedTransaction.value = undefined;
    };

    const renderView = () => {
      if (selectedTransaction.value) {
        return (
          <ApprovalDetails
            pendingApproval={selectedTransaction.value}
            onClick:cancel={onCloseDetailsView}
          />
        );
      }

      return <ApprovalsList onClick:select={onOpenDetailsView} />;
    };

    return renderView;
  }
});
