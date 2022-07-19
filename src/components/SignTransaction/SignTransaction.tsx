import qs from 'qs';
import { defineComponent, ref } from 'vue';
import { VBtn, VSpacer, VProgressCircular } from 'vuetify/components';

import { InnerContainer } from '@/components/InnerContainer';
import { useNotify } from '@/composable/notify';

import { useAccountStore } from '@/stores/account';

export const SignTransaction = defineComponent({
  setup() {
    const accountStore = useAccountStore();

    const { showError } = useNotify();

    const isLoading = ref<boolean>(false);

    const onDecline = () => window.close();
    const onApprove = async () => {
      isLoading.value = true;

      try {
        const transaction = await accountStore.signTransaction(window.packedTx);

        const msgData = {
          transaction,
          channel: 'Deip.Wallet.Transaction'
        };

        if (window.opener) {
          window.opener.postMessage(msgData, '*');

          window.close();
        } else {
          window.open(
            qs.stringify(msgData, { addQueryPrefix: true }),
            '_self'
          );
        }
      } catch (error: any) {
        showError(error.message);
      } finally {
        isLoading.value = false;
      }
    };

    return () => (
      <InnerContainer>
        <div class="text-h3 mb-6">
          Approve transaction
        </div>

        <div class="d-flex mt-12">
          <VSpacer />

          <VBtn
            color="secondary-btn"
            onClick={onDecline}
          >
            Decline
          </VBtn>

          <VBtn
            class="ml-4"
            disabled={isLoading.value}
            onClick={onApprove}
          >
            {isLoading.value ? <VProgressCircular indeterminate={true} /> : 'Approve'}
          </VBtn>
        </div>
      </InnerContainer>
    );
  }
});
