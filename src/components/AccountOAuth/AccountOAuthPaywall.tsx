import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountOAuthPaywall = defineComponent({
  emits: [
    'click:receive'
  ],

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h3 mb-6">
          Your balance is not enough
        </div>

        <div class="text-body-large mb-12">
          To associate DAO with your wallet, you must have at least 1010 DEIP.
        </div>

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            class="ml-4"
            onClick={() => emit('click:receive')}
          >
            Fulfill balance
          </VBtn>
        </div>
      </>
    );
  }

});
