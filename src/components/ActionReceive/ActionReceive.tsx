import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { VBtn, VSheet, VSpacer } from 'vuetify/components';

import VueQrcode from '@chenfengyuan/vue-qrcode';
import { DisplayAddress } from '@/components/DisplayAddress';
import { useAccountStore } from '@/stores/account';

export const ActionReceive = defineComponent({
  setup() {
    const route = useRoute();

    const accountStore = useAccountStore();
    const { address, multisigAccountDetails } = storeToRefs(accountStore);

    const isMultiSigView = computed(() => route.path.includes('multisig'));
    const activeAddress = computed(() => 
      isMultiSigView.value
      ? multisigAccountDetails.value?.address
      : address.value
    );

    return () => (
      <>
        <div class="text-body1 mb-6">
          The address is generated, you can
          use it to deposit your wallet
        </div>

        <VSheet maxWidth={240} class="mx-auto">
          <VueQrcode value={activeAddress.value} tag="svg" />
        </VSheet>

        <div class="d-flex mt-12">
          <DisplayAddress address={activeAddress.value} variant="accent" />
          <VSpacer/>
          <VBtn
            color="secondary-btn"
            to={{ name: 'wallet' }}
          >
            Go to wallet
          </VBtn>
        </div>
      </>
    );
  }
});
