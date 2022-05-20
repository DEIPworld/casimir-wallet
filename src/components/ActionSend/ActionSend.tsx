import { computed, defineComponent, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn, VRow, VCol, VTextField, VDivider, VProgressCircular
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';
import { useWalletStore } from '@/stores/wallet';
import { useNotify } from '@/composable/notify';
import { useRouter } from 'vue-router';
import { useYup } from '@/composable/validate';

import { useField, useForm } from 'vee-validate';
import { string, number, object } from 'yup';

export const ActionSend = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const walletStore = useWalletStore();
    const router = useRouter();

    const { address, accountJson } = storeToRefs(accountStore);
    const { freeBalance } = storeToRefs(walletStore);

    const { getTransactionFee, makeTransaction } = useWalletStore();
    const { showSuccess } = useNotify();

    const { makeError, addressValidator } = useYup();

    const schema = object({
      recipient: string()
        .test(addressValidator)
        .required().label('Recipient address'),
      amount: number().typeError('Must be a number')
        .positive()
        .max(freeBalance.value)
        .required().label('Amount'),
      password: string()
        .required().label('Password')
    });

    const { meta: formState } = useForm({
      validationSchema: schema
    });

    const {
      value: recipient,
      errorMessage: recipientError,
      meta: recipientMeta
    } = useField<string>('recipient');

    const {
      value: amount,
      errorMessage: amountError,
      meta: amountMeta
    } = useField<number>('amount');

    const {
      value: password
    } = useField<string>('password');


    const fee = ref<string>('0');
    const isLoading = ref<boolean>(false);

    const totalSend = computed(() => {
      if (amount.value) {
        return amount.value + parseFloat(fee.value);
      }
      return 0;
    });

    watchEffect(async () => {
      if (
        recipientMeta.valid
        && amountMeta.valid
        && address.value
      ) {
        isLoading.value = true;

        fee.value = await getTransactionFee(
          recipient.value,
          address.value,
          amount.value
        );

        isLoading.value = false;
      }
    });

    const transfer = async(): Promise<void> => {
      try {
        isLoading.value = true;

        accountJson.value && await makeTransaction(
          recipient.value,
          { account: accountJson.value, password: password.value },
          amount.value
        );
  
        showSuccess('Successfully sent');
        router.push({ name: 'wallet' });
      } finally {
        isLoading.value = false;
      }
    };

    return () => (
      <>
        <VRow>
          <VCol>
            <VTextField
              label="To address"
              v-model={recipient.value}
              {...makeError(recipientError.value)}
            />
          </VCol>
          <VCol>
            <VTextField
              label="Amount"
              suffix="DEIP"
              v-model={[amount.value, ['number']]}
              {...makeError(amountError.value)}
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
            disabled={!formState.value.valid}
          >
            {isLoading.value ? <VProgressCircular indeterminate={true} /> : 'Confirm'}
          </VBtn>
        </div>
      </>
    );
  }
});
