import { computed, defineComponent, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn, VSpacer, VRow, VCol, VTextField, VTextarea, VDivider, VSnackbar
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';
import { useWalletStore } from '@/stores/wallet';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import { useNotify } from '@/composable/notify';
import { useRouter } from 'vue-router';

export const SendView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const router = useRouter();
    const { address } = storeToRefs(accountStore);
    const { getAccount } = accountStore;

    const { getTransactionFee, makeTransaction } = useWalletStore();
    const { notify, notifyIsActive, showNotify } = useNotify();


    const recipient = ref<string>('');
    const amount = ref<number>();
    const fee = ref<string>('0');

    const seedPhrase = ref<string>('');

    const totalSend = computed(() => {
      if (amount.value) {
        return amount.value + parseFloat(fee.value);
      }

      return 0;
    });

    const goToWallet = () => {
      router.push({
        name: 'wallet'
      });
    };

    watch(
      () => ({
        recipient: recipient.value,
        amount: amount.value || 0
      }),
      async ({ recipient, amount }) => {
        if (recipient && amount) {
          fee.value = await getTransactionFee(
            recipient,
            address.value,
            amount
          ) as string;
        }
      }
    );

    const transfer = () => {
      const account = getAccount(seedPhrase.value, false);
      makeTransaction(
        recipient.value,
        account as CreateResult,
        amount.value as number
      );
      showNotify('Successfully sent');
    };

    const transferIsDisabled = computed(() => !(recipient.value && amount.value));

    return () => (
      <InnerContainer>
        <div class="text-h3 mb-6">
          Send DEIP
        </div>

        <VRow>
          <VCol>
            <VTextField
              label="To address"
              hideDetails
              v-model={recipient.value}
            />
          </VCol>
          <VCol>
            <VTextField
              label="Amount"
              suffix="DEIP"
              hideDetails
              v-model={[amount.value, ['number']]}
            />
          </VCol>
        </VRow>

        <VRow>
          <VCol>Will be sent</VCol>
          <VCol class="text-right">{amount.value || 0 } DEIP</VCol>
        </VRow>
        <VRow>
          <VCol>Platform fee</VCol>
          <VCol class="text-right">{fee.value} DEIP</VCol>
        </VRow>

        <VDivider class="my-4" />

        <VRow>
          <VCol>Total</VCol>
          <VCol class="text-right">{totalSend.value } DEIP</VCol>
        </VRow>

        <VTextarea
          label="Passphrase (12 words)"
          v-model={seedPhrase.value}
          rows={2}
          class="mt-6"
        />

        <div class="d-flex mt-12">
          <VSpacer/>
          <VBtn
            to={{ name: 'wallet' }}
            color="secondary-btn"
          >
            cancel
          </VBtn>
          <VBtn
            onClick={transfer}
            class="ml-4"
            disabled={transferIsDisabled.value}
          >
            Confirm
          </VBtn>
        </div>

        <VSnackbar
          v-model={notifyIsActive.value}
          color={notify.color}
          timeout={1000}
          onUpdate:modelValue={goToWallet}
        >
          {notify.message}
        </VSnackbar>
      </InnerContainer>
    );
  }
});
