import { defineComponent, ref, computed, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn,
  VRow,
  VCol,
  VTextField,
  VProgressCircular,
  VIcon
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useYup } from '@/composable/validate';

import { useField, useForm } from 'vee-validate';
import { string, number, object } from 'yup';

import type { IMultisigTransactionData } from '../../../types';

export const MultisigActionSendForm = defineComponent({
  emits: ['click:cancel', 'click:confirm'],
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const accountStore = useAccountStore();
    const multisigStore = useMultisigWalletStore();

    const { address: personalAddress, multisigAccountDetails } = storeToRefs(accountStore);
    const { actualBalance } = storeToRefs(multisigStore);

    const { makeError, addressValidator } = useYup();

    const schema = object({
      recipient: string().test(addressValidator).required().label('Recipient address'),
      amount: number()
        .typeError('Must be a number')
        .positive()
        .max(actualBalance.value)
        .required()
        .label('Amount')
    });

    const { meta: formState } = useForm({
      validationSchema: schema
    });

    const { value: recipient, errorMessage: recipientError } = useField<string>('recipient');
    const transactionData = ref<IMultisigTransactionData>();

    const {
      value: amount,
      errorMessage: amountError,
      meta: amountMeta
    } = useField<number>('amount');

    const fee = ref<string>('0');
    const existentialDeposit = computed(() => multisigStore.getExistentialDeposit());
    const isLoading = ref<boolean>(false);

    watchEffect(async () => {
      if (amountMeta.valid && amount.value && personalAddress.value) {
        isLoading.value = true;

        try {
          if (!multisigAccountDetails.value) {
            return;
          }

          const data = multisigStore.createMultisigTransaction(recipient.value, amount.value);

          transactionData.value = data;
          fee.value = await multisigStore.getMultisigTransactionFee({
            isFirstApproval: true,
            isFinalApproval: false,
            callHash: data.callHash,
            callData: data.callData,
            threshold: multisigAccountDetails.value?.threshold,
            otherSignatories: multisigAccountDetails.value?.signatories
              .filter((item) => item.address !== personalAddress.value)
              .map((item) => item.address),
            multisigAddress: props.address,
            personalAddress: personalAddress.value
          });
        } catch (error: any) {
          console.error(error);
        }
        isLoading.value = false;
      } else {
        fee.value = '0';
      }
    });

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
          <VCol>Will be sent (from multisig account)</VCol>
          <VCol class="text-right">{amount.value || 0} DEIP</VCol>
        </VRow>
        <VRow>
          <VCol>Platform fee (from personal account)</VCol>
          <VCol class="text-right">{fee.value} DEIP</VCol>
        </VRow>
        <VRow>
          <VCol class="d-flex">
            <span>Existential deposit</span>
            <div
              class="dw-tooltip ml-2 text-body-1"
              data-tooltip="The minimum amount that an account should have to be deemed active"
            >
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </VCol>
          <VCol class="text-right">{existentialDeposit.value} DEIP</VCol>
        </VRow>

        <div class="d-flex mt-12 justify-end align-center">
          <VBtn class="ml-4" color="secondary-btn" onClick={() => emit('click:cancel')}>
            cancel
          </VBtn>
          <VBtn
            onClick={() => emit('click:confirm', recipient.value, amount.value, transactionData.value)}
            class="ml-4"
            disabled={!formState.value.valid || isLoading.value}
          >
            {isLoading.value ? <VProgressCircular indeterminate={true} /> : 'Confirm'}
          </VBtn>
        </div>
      </>
    );
  }
});
