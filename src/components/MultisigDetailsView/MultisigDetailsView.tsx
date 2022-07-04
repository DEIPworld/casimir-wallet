import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';

import { VBtn, VSpacer, VSheet } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useAccountStore } from '@/stores/account';

export const MultisigDetailsView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { multisigAccountDetails } = storeToRefs(accountStore);

    const renderSignatories = () =>
      multisigAccountDetails.value?.signatories.map((item) => (
        <div key={item.address}>{item.name}</div>
      ));

    return () => (
      <InnerContainer>
        <div>
          <div class="text-h4 mb-2">{multisigAccountDetails.value?.name}</div>
          <DisplayAddress address={multisigAccountDetails.value?.address} />
        </div>

        <VSheet
          rounded
          color="rgba(255,255,255,.05)"
          class="mt-8 pa-4 d-flex align-center mb-2"
        >
          <div class="text-h6">Treshhold</div>
          <VSpacer />
          <div class="text-subtitle-1">{multisigAccountDetails.value?.threshold}</div>
        </VSheet>

        <VSheet
          rounded
          color="rgba(255,255,255,.05)"
          class="mt-4 pa-4 d-flex align-center mb-2"
        >
          <div class="text-h6">Signatories</div>
          <VSpacer />
          <div class="w-50 text-subtitle-1 text-right text-break">{renderSignatories()}</div>
        </VSheet>

        <div class="d-flex justify-end mt-4">
          <VBtn color="secondary-btn" size="small">
            Edit
          </VBtn>
          <VBtn class="ml-4" size="small" to={{ name: 'multisig.action.send' }}>
            Send
          </VBtn>
        </div>
      </InnerContainer>
    );
  }
});
