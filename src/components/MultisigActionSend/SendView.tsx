import { computed, defineComponent, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import {
  VBtn,
  VRow,
  VCol,
  VTextField,
  VDivider,
  VProgressCircular,
  VIcon
} from 'vuetify/components';

import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useYup } from '@/composable/validate';

import { useField, useForm } from 'vee-validate';
import { string, number, object } from 'yup';

const existentialDepositHelpText = `If the recipient account is new, the balance needs to be more than the existential deposit.
Likewise if the sending account balance drops below the same value,the account will be
removed from the state
`;

export const SendView = defineComponent({
  emits: ['click:cancel', 'click:confirm'],
  props: {
    address: {
      type: String
    }
  },
  setup(props, { emit }) {
    const multisigStore = useMultisigWalletStore();

    const { actualBalance } = storeToRefs(multisigStore);

    const { getTransactionFee } = useMultisigWalletStore();

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

    const {
      value: amount,
      errorMessage: amountError,
      meta: amountMeta
    } = useField<number>('amount');

    const fee = ref<string>('0');
    const existentialDeposit = ref<string>('0'); // TODO Add method to retrieve this amount
    const isLoading = ref<boolean>(false);

    const totalSend = computed(() => {
      if (amount.value) {
        return amount.value + parseFloat(fee.value);
      }
      return 0;
    });

    watchEffect(async () => {
      if (amountMeta.valid && amount.value && props.address) {
        isLoading.value = true;

        fee.value = await getTransactionFee(recipient.value, props.address, amount.value);

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
          <VCol>Will be sent</VCol>
          <VCol class="text-right">{amount.value || 0} DEIP</VCol>
        </VRow>
        <VRow>
          <VCol>Platform fee</VCol>
          <VCol class="text-right">{fee.value} DEIP</VCol>
        </VRow>
        <VRow>
          <VCol class="d-flex">
            <span>Existential deposit</span>
            <div class="dw-tooltip ml-2 text-body-1" data-tooltip={existentialDepositHelpText}>
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </VCol>
          <VCol class="text-right">{existentialDeposit.value} milli</VCol>
        </VRow>

        <VDivider class="my-4" />

        <VRow>
          <VCol>Total</VCol>
          <VCol class="text-right">{totalSend.value} DEIP</VCol>
        </VRow>

        <div class="d-flex mt-12 justify-end align-center">
          <VBtn class="ml-4" color="secondary-btn" onClick={() => emit('click:cancel')}>
            cancel
          </VBtn>
          <VBtn
            onClick={() => emit('click:confirm', recipient.value, amount.value)}
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
