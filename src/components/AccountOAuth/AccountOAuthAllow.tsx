import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountOAuthAllow = defineComponent({
  emits: [
    'click:cancel',
    'click:allow'
  ],

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h4 mb-6">
          <span class="text-color-primary">[Portal Name]</span> wants
          to access your DEIP wallet DAO
        </div>

        <div class="text-body-large mb-6">
          This will allow <span class="text-color-primary">[Portal Name]</span> with
          {' '}<span class="text-color-primary">[Portal ID]</span> to:
        </div>

        <div class="text-body-large">
          - see and use your DEIP wallet balance;
        </div>
        <div class="text-body-large mb-6">
          - import and export collectibles;
        </div>

        <div class="text-body-large">
          Make sure you trust <span class="text-color-primary">[Portal Name]</span> as
          no additional approvals would be requested for transactions within
          the Portal with DEIP wallets funds. You could always see your
          access in your DEIP wallet.
        </div>

        <div class="d-flex mt-12">
          <VSpacer />

          <VBtn
            color="secondary-btn"
            onClick={() => emit('click:cancel')}
          >
            Cancel
          </VBtn>

          <VBtn
            class="ml-4"
            onClick={() => emit('click:allow')}
          >
            Allow
          </VBtn>
        </div>
      </>
    );
  }

});
