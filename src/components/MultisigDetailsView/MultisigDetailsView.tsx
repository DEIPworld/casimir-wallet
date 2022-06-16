import { defineComponent } from 'vue';

import { VBtn, VRow, VCol } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { DisplayAddress } from '@/components/DisplayAddress';

export const MultisigDetailsView = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const renderSignatories = () => (
      <>
        <div>User 1</div>
        <div>User 2</div>
        <div>User 3</div>
      </>
    );

    return () => (
      <InnerContainer>
        <div>
          <div class="text-h4 mb-2">[name of the multisig account]</div>
          <DisplayAddress address={props.address} />
        </div>

        <VRow class="mt-4 text-body-1">
          <VCol cols="2">Treshhold</VCol>
          <VCol>2</VCol>
        </VRow>

        <VRow class="mt-4 text-body-1">
          <VCol cols="2">Signatories</VCol>
          <VCol>{renderSignatories()}</VCol>
        </VRow>

        <VRow class="justify-end mt-4">
          <VBtn color="secondary-btn" size="small" rounded={false}>
            Edit
          </VBtn>
          <VBtn class="ml-4" size="small" rounded={false} to={{ name: 'multisig.action.send' }}>
            Send
          </VBtn>
        </VRow>
      </InnerContainer>
    );
  }
});
