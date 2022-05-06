import { computed, defineComponent, ref } from 'vue';
import { VBtn, VTextarea, VSpacer } from 'vuetify/components';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account';

export const AccountImportSeedEnter = defineComponent({
  emits: [
    'click:next'
  ],

  setup(props, { emit }) {
    const seedPhrase = ref<string>('');

    const { tempSeed } = storeToRefs(useAccountStore());
    const disabled = computed(() => {
      const  length = tempSeed.value.split(' ').filter((v) => !!v).length;
      return length !== 12;
    });

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
          v-model={tempSeed.value}
          rows={2}
        />

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            class="ml-4"
            disabled={disabled.value}
            onClick={() => emit('click:next', seedPhrase.value)}
          >
            Next
          </VBtn>
        </div>
      </>
    );
  }
});
