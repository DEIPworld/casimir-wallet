import { defineComponent, ref } from 'vue';
import { VBtn, VCheckbox, VSpacer } from 'vuetify/components';

export const AccountCreateStart = defineComponent({
  name: 'WalletCreateStart',

  emits: [
    'click:restoreWallet',
    'click:next'
  ],

  setup(props, { emit }) {
    const confirm = ref(false);

    return () => (
      <>
        <div class="text-h3 mb-6">
          Create your account
        </div>

        <div class="text-body1 mb-6">
          <p>
            DEIP Wallet is a secure wallet and account manager
            for your accounts on the DEIP blockchain.
          </p>
          <p>
            Once you create an account, you’ll need it to
            interact with applications on DEIP, and to
            securely store your various tokens and collectibles (NFTs).
          </p>
        </div>

        <VCheckbox
          v-model={confirm.value}
          label="I agree to the Terms of service and Privacy policy."
          class="ml-n3"
        />

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            color="secondary-btn"
            onClick={() => emit('click:restoreWallet')}
          >Restore access</VBtn>

          <VBtn
            class="ml-4"
            disabled={!confirm.value}
            onClick={() => emit('click:next')}
          >
            Get Started
          </VBtn>
        </div>
      </>
    );
  }
});