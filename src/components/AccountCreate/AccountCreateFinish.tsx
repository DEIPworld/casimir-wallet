import { defineComponent } from 'vue';
import { VBtn, VSheet, VSpacer } from 'vuetify/components';

import VueQrcode from '@chenfengyuan/vue-qrcode';
import { DisplayAddress } from '@/components/DisplayAddress/DisplayAddress';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';

export const AccountCreateFinish = defineComponent({
  name: 'WalletCreateFinish',

  emits: [
    'click:addressCopy',
    'click:next',
    'click:oauth'
  ],

  props: {
    hasPortal: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {

    const { address } = storeToRefs(useAccountStore());

    return () => (
      <>
        <div class="text-h3 mb-6">
          Almost there!
        </div>

        <div class="text-body-large mb-12">
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
            onClick={() => emit('click:next')}
          >
            Go to wallet
          </VBtn>
          {props.hasPortal && (
            <VBtn
              class="ml-4"
              onClick={() => emit('click:oauth')}
            >
              Back to oauth
            </VBtn>
          )}
        </div>
      </>
    );
  }
});
