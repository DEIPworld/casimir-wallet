import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { VBtn, VSpacer, VProgressCircular } from 'vuetify/components';

import { InnerContainer } from '@/components/InnerContainer';
import { useNotify } from '@/composable/notify';

import { useAccountStore } from '@/stores/account';

export const SignTransaction = defineComponent({
  setup() {
    const accountStore = useAccountStore();

    const { showError } = useNotify();

    const isLoading = ref<boolean>(false);
    const transaction = ref();

    const handleOpener = (msgData: any, withClose = true) => {
      if (window.opener) {
        window.opener.postMessage(msgData, '*');
      }

      if (withClose) {
        window.close();
      }
    };

    const handleTransaction = (event: any) => {
      const { data } = event;

      if (data?.transaction) {
        transaction.value = data.transaction;
      }
    };

    const onDecline = () => {
      handleOpener({ channel: 'Deip.Wallet.Transaction.Close' });
    };

    const onApprove = async () => {
      isLoading.value = true;

      try {
        const signedTx = await accountStore.signTransaction(transaction.value);

        const msgData = {
          transaction: signedTx,
          channel: 'Deip.Wallet.Transaction'
        };

        handleOpener(msgData);
      } catch (error: any) {
        showError(error.message);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      handleOpener({ channel: 'Deip.Wallet.Transaction.Ready' }, false);
      window.addEventListener('message', handleTransaction);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('message', handleTransaction);
    });

    return () => (
      <InnerContainer>
        <div class="text-h3 mb-6">
          Approve transaction
        </div>

        <div class="text-body-large mb-6">
          This is a DEIP wallet widget. From here you may approve transaction
          initiated on the portal. The transaction amount and platform
          fee will be charged from your DEIP wallet account.
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
