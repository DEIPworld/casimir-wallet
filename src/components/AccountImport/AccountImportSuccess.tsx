import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountImportSuccess = defineComponent({
  emits: [
    'click:next'
  ],

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h3 mb-6">
          Recovered successfully
        </div>

        <div class="text-body1 mb-6">
          <p>
            Welcome back to your account
          </p>
        </div>

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            class="ml-4"
            onClick={() => emit('click:next')}
          >
            Go to wallet
          </VBtn>
        </div>
      </>
    );
  }
});
