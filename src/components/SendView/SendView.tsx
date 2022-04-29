import { computed, defineComponent, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { VBtn, VSpacer, VRow, VCol, VTextField, VDivider } from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';
import { useWalletStore } from '@/stores/wallet';
import type { CreateResult } from '@polkadot/ui-keyring/types';

export const SendView = defineComponent({
  setup() {

    const accountStore = useAccountStore();
    const { address, account } = storeToRefs(accountStore);

    const { getTransactionFee, makeTransaction } = useWalletStore();


    const recipient = ref<string>('');
    const amount = ref<number>();
    const fee = ref<string>('0');

    const totalSend = computed(() => {
      if (amount.value) {
        return amount.value + parseFloat(fee.value);
      }

      return 0;
    });

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
      makeTransaction(
        recipient.value,
        account.value as CreateResult,
        amount.value as number
      );
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
            disabled={transferIsDisabled.value}
            class="ml-4"
          >
            Confirm
          </VBtn>
        </div>
      </InnerContainer>
    );
  }
});
