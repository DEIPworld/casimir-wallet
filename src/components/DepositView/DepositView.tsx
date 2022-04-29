import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { VBtn, VSheet, VSpacer } from 'vuetify/components';

import VueQrcode from '@chenfengyuan/vue-qrcode';
import { DisplayAddress } from '@/components/DisplayAddress/DisplayAddress';
import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';

export const DepositView = defineComponent({
  setup() {

    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);

    return () => (
      <InnerContainer>
        <div class="text-h3 mb-6">
          Deposit
        </div>
        <div class="text-body1 mb-6">
          The address is generated, you can
          use it to deposit your wallet
        </div>

        <VSheet maxWidth={240} class="mx-auto">
          <VueQrcode value={address.value} tag="svg" />
        </VSheet>

        <div class="d-flex mt-12">
          <DisplayAddress address={address.value} variant="accent" />
          <VSpacer/>
          <VBtn
            color="secondary-btn"
            to={{ name: 'wallet' }}
          >
            Go to wallet
          </VBtn>
        </div>
      </InnerContainer>
    );
  }
});
