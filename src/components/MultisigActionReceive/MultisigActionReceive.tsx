import { defineComponent } from 'vue';

import { VBtn, VSheet, VSpacer } from 'vuetify/components';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { DisplayAddress } from '@/components/DisplayAddress';

export const MultisigActionReceive = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => (
      <>
        <div class="text-body1 mb-6">
          The address is generated, you can
          use it to deposit your wallet
        </div>

        <VSheet maxWidth={240} class="mx-auto">
          <VueQrcode value={props.address} tag="svg" />
        </VSheet>

        <div class="d-flex mt-12">
          <DisplayAddress address={props.address} variant="accent" />
          <VSpacer/>
          <VBtn
            color="secondary-btn"
            to={{ name: 'multisig.wallet' }}
          >
            Go to wallet
          </VBtn>
        </div>
      </>
    );
  }
});
