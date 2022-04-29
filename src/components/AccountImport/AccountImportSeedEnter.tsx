import { defineComponent, ref } from 'vue';
import { VBtn, VTextarea, VSpacer } from 'vuetify/components';

export const AccountImportSeedEnter = defineComponent({
  emits: [
    'click:next'
  ],

  setup(props, { emit }) {
    const seedPhrase = ref<string>('');

    return () => (
      <>
        <div class="text-h3 mb-6">
          Recover using seed phrase
        </div>

        <div class="text-body1 mb-6">
          <p>
            Enter the backup passphrase associated with the account.
          </p>
        </div>

        <VTextarea
          label="Passphrase (12 words)"
          v-model={seedPhrase.value}
          rows={2}
        />

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            class="ml-4"
            onClick={() => emit('click:next', seedPhrase.value)}
          >
            Recover account
          </VBtn>
        </div>
      </>
    );
  }
});
