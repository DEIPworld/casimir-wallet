import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';

import { VBtn, VRow, VCol } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useAccountStore } from '@/stores/account';

export const MultisigDetailsView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { multisigAccountDetails } = storeToRefs(accountStore);

    const renderSignatories = () => (
      multisigAccountDetails.value?.signatories.map((item) => (
        <div key={item.address}>{item.name}</div>
      ))
    );

    return () => (
      <InnerContainer>
        <div>
          <div class="text-h4 mb-2">{multisigAccountDetails.value?.name}</div>
          <DisplayAddress address={multisigAccountDetails.value?.address} />
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
