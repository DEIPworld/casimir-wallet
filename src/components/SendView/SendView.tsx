import { computed, defineComponent, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn, VSpacer, VRow, VCol, VTextField, VTextarea, VDivider, VSnackbar
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';
import { useWalletStore } from '@/stores/wallet';
import { useNotify } from '@/composable/notify';
import { useRouter } from 'vue-router';

export const SendView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const router = useRouter();

    const { address, accountJson } = storeToRefs(accountStore);
    const password = ref('');

    const { getTransactionFee, makeTransaction } = useWalletStore();
    const { showError, showSuccess } = useNotify();


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
        if (recipient && amount && address.value) {
          fee.value = await getTransactionFee(
            recipient,
            address.value,
            amount
          ) as string;
        }
      }
    );

    const transfer = () => {
      accountJson.value && makeTransaction(
        recipient.value,
        { account: accountJson.value, password: password.value },
        amount.value as number
      );

      showSuccess('Successfully sent');
    };

    const transferIsDisabled = computed(() => !(recipient.value && amount.value));

    return () => (
      <InnerContainer>
        <div class="text-h3 mb-6">
          Send DEIP
        </div>

        <VRow class="mb-6">
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

        <div class="d-flex mt-12 align-center">
          <VTextField
            singleLine
            density="comfortable"
            class="spacer"
            label="Password"
            v-model={password.value}
            hideDetails
          />
          <VBtn
            class="ml-4"
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
      </InnerContainer>
    );
  }
});
