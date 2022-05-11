import { computed, defineComponent, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn, VRow, VCol, VTextField, VDivider
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';
import { useWalletStore } from '@/stores/wallet';
import { useNotify } from '@/composable/notify';
import { useRouter } from 'vue-router';
import { useYup } from '@/composable/validate';

import { useField, useForm } from 'vee-validate';
import { string, number, object } from 'yup';

export const SendView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const walletStore = useWalletStore();
    const router = useRouter();

    const { address, accountJson } = storeToRefs(accountStore);
    const { freeBalance } = storeToRefs(walletStore);

    const { getTransactionFee, makeTransaction } = useWalletStore();
    const { showSuccess } = useNotify();

    const { addressValidator } = useYup();

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

    const totalSend = computed(() => {
      if (amount.value) {
        return amount.value + parseFloat(fee.value);
      }
      return 0;
    });

    watchEffect( async () => {
      if (
        recipientMeta.valid
        && amountMeta.valid
        && address.value
      ) {
        fee.value = await getTransactionFee(
          recipient.value,
          address.value,
          amount.value
        ) ;
      }
    });

    const transfer = () => {
      accountJson.value && makeTransaction(
        recipient.value,
        { account: accountJson.value, password: password.value },
        amount.value
      );

      showSuccess('Successfully sent');
      router.push({ name: 'wallet' });
    };

    const makeError = (val: string | undefined) => {
      return {
        messages: val,
        error: !!val
      };
    };

    return () => (
      <InnerContainer>
        <div class="text-h3 mb-6">
          Send DEIP
        </div>

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
            Confirm
          </VBtn>
        </div>
      </InnerContainer>
    );
  }
});
