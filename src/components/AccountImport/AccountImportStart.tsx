import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountImportStart = defineComponent({
  emits: [
    'click:next'
  ],

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h3 mb-6">
          Import your account
        </div>

        <div class="text-body1 mb-6">
          <p>
            Make sure you have your 12 word recovery phrase,
            then click below to begin the recovery process.
          </p>
        </div>

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            class="ml-4"
            onClick={() => emit('click:next')}
          >
            Get Started
          </VBtn>
        </div>
      </>
    );
  }
});
