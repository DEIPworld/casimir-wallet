import { defineComponent, ref } from 'vue';
import { VBtn, VCheckbox, VBreadcrumbsItem, VSpacer } from 'vuetify/components';

export const AccountCreateStart = defineComponent({
  name: 'WalletCreateStart',

  emits: ['click:restore', 'click:start'],

  setup(props, { emit }) {
    const confirm = ref(false);

    const label = (
      <span class="d-flex">
        I agree to the <VBreadcrumbsItem to={{ name: 'termsOfUse' }}>Terms of use</VBreadcrumbsItem>.
      </span>
    );

    return () => (
      <>
        <div class="text-h3 mb-6">Create your account</div>

        <div class="text-body-large mb-6">
          DEIP Wallet is a secure wallet and account manager for your accounts on the DEIP
          blockchain.
        </div>
        <div class="text-body-large mb-6">
          Once you create an account, you’ll need it to interact with applications on DEIP, and to
          securely store your various tokens and collectibles (NFTs).
        </div>

        <VCheckbox v-model={confirm.value} class="ml-n3 mt-12">
          {{
            label: () => label
          }}
        </VCheckbox>

        <div class="d-flex mt-12">
          <VSpacer />

          <VBtn color="secondary-btn" onClick={() => emit('click:restore')}>
            Restore access
          </VBtn>

          <VBtn class="ml-4" disabled={!confirm.value} onClick={() => emit('click:start')}>
            Get Started
          </VBtn>
        </div>
      </>
    );
  }
});
