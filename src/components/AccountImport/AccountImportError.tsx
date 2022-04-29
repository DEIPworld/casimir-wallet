import { defineComponent, ref } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountImportError = defineComponent({
  emits: [
    'click:next'
  ],

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h3 mb-6">
          There was a problem
        </div>

        <div class="text-body1 mb-6">
          <p>
            No accounts were found for this passphrase.
            Check your 12 word recovery phrase and try again.
          </p>
        </div>

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            class="ml-4"
            onClick={() => emit('click:next')}
          >
            Ok, got it
          </VBtn>
        </div>
      </>
    );
  }
});
