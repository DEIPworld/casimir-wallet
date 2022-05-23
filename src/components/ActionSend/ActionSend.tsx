import { computed, defineComponent, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn, VRow, VCol, VTextField, VDivider
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { InnerContainer } from '@/components/InnerContainer';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';
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
        .required().label('Amount')
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

    const fee = ref<string>('0');
    const isLoading = ref<boolean>(false);
    const isOpen = ref<boolean>(false);
    const passwordError = ref<string>();

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
        fee.value = await getTransactionFee(
          recipient.value,
          address.value,
          amount.value
        );
      }
    });

    const transfer = async (password: string): Promise<void> => {
      isLoading.value = true;

      setTimeout(async () => {
        try { 
          accountJson.value &&
            (await makeTransaction(
              recipient.value,
              { account: accountJson.value, password },
              amount.value
            ));

          showSuccess("Successfully sent");
          router.push({ name: "wallet" });
        } catch (error: any) {
          passwordError.value = error.message;
        } finally {
          isLoading.value = false;
        }
      }, 500);
    };

    const openConfirmModal = (): void => {
      isOpen.value = true;
      passwordError.value = undefined;
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
          <VCol class="text-right">{amount.value || 0} DEIP</VCol>
        </VRow>
        <VRow>
          <VCol>Platform fee</VCol>
          <VCol class="text-right">{fee.value} DEIP</VCol>
        </VRow>

        <VDivider class="my-4" />

        <VRow>
          <VCol>Total</VCol>
          <VCol class="text-right">{totalSend.value} DEIP</VCol>
        </VRow>

        <div class="d-flex mt-12 justify-end align-center">
          <VBtn
            class="ml-4"
            to={{ name: 'wallet' }}
            color="secondary-btn"
          >
            cancel
          </VBtn>
          <VBtn
            onClick={openConfirmModal}
            class="ml-4"
            disabled={!formState.value.valid}
          >
            Confirm
          </VBtn>
        </div>
        <ConfirmActionModal
          title='Confirm transaction'
          isOpen={isOpen.value}
          isLoading={isLoading.value}
          error={passwordError.value}
          onClick:cancel={() => isOpen.value = false}
          onClick:confirm={transfer}
        />
      </>
    );
  }
});
