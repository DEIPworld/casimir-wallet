import { defineComponent } from 'vue';
import { VBtn, VSpacer, VProgressCircular } from 'vuetify/components';

export const AccountOAuthAllow = defineComponent({
  emits: [
    'click:cancel',
    'click:allow'
  ],

  props: {
    portal: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h4 mb-6">
          <span class="text-color-primary">{props.portal.name}</span> Portal wants
          to access your DEIP wallet DAO
        </div>

        <div class="text-body-large mb-6">
          This will allow <span class="text-color-primary">{props.portal.name}</span> Portal
          with ID: <span class="text-color-primary text-break">{props.portal.portalId}</span> to:
        </div>

        <div class="text-body-large">
          - see and use your DEIP wallet balance;
        </div>
        <div class="text-body-large mb-6">
          - import and export collectibles;
        </div>

        <div class="text-body-large">
          Make sure you trust <span class="text-color-primary">{props.portal.name}</span> Portal
          as no additional approvals would be requested for transactions within
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
            disabled={props.isLoading}
            onClick={() => emit('click:allow')}
          >
            {props.isLoading ? <VProgressCircular indeterminate={true} /> : 'Allow'}
          </VBtn>
        </div>
      </>
    );
  }

});
