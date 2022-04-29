import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

import VueQrcode from '@chenfengyuan/vue-qrcode';
import { DisplayAddress } from '@/components/DisplayAddress/DisplayAddress';

export const AccountCreateFinish = defineComponent({
  name: 'WalletCreateFinish',

  emits: [
    'click:addressCopy',
    'click:next'
  ],

  props: {
    address: {
      type: String,
      default: ''
    }
  },

  setup(props, { emit }) {

    return () => (
      <>
        <div class="text-h3 mb-6">
          Almost there!
        </div>

        <VueQrcode value={props.address} tag="svg" />

        <div class="text-body1 mb-6">
          <p>
            The address is generated, you can
            use it to deposit your wallet
          </p>
        </div>
        <div class="d-flex mt-12">
          <DisplayAddress address={props.address} variant="accent" />
          <VSpacer/>
          <VBtn
            color="secondary-btn"
            onClick={() => emit('click:next')}
          >
            Go to wallet
          </VBtn>
        </div>
      </>
    );
  }
});
