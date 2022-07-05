import { defineComponent } from 'vue';

import type { Component } from 'vue';

import { MultisigApprovalDetailsTransfer } from './MultisigApprovalDetailsTransfer';
import { MultisigApprovalDetailsVesting } from './MultisigApprovalDetailsVesting';

const componentMap: Component = {
  'transfer': MultisigApprovalDetailsTransfer,
  'vesting': MultisigApprovalDetailsVesting
};

export const MultisigApprovalDetails = defineComponent({
  props: {
    approvalId: {
      type: String,
      required: true
    },
    approvalType: {
      type: String,
      required: true,
      validator(value: string) {
        return ['transfer', 'vesting'].includes(value);
      }
    }
  },
  setup(props) {
    const Component = componentMap[props.approvalType];

    if (!Component) {
      return () => <div class="text-center text-subtitle-1">Invalid approval type</div>;
    }

    return () => <Component approvalId={props.approvalId} />;
  }
});
