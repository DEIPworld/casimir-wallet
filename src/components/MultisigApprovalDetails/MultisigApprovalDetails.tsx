import { defineComponent } from 'vue';

import { MultisigApprovalDetailsTransfer } from './MultisigApprovalDetailsTransfer';
import { MultisigApprovalDetailsVesting } from './MultisigApprovalDetailsVesting';

export const MultisigApprovalDetails = defineComponent({
  props: {
    approvalId: {
      type: String,
      required: true
    },
    approvalType: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const renderDetailsView = () => {
      if (props.approvalType === 'transfer') {
        return <MultisigApprovalDetailsTransfer approvalId={props.approvalId} />;
      }

      return < MultisigApprovalDetailsVesting approvalId={props.approvalId} />;
    };

    return renderDetailsView;
  }
});
