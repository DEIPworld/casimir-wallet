import { defineComponent, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';

import { VIcon, VSheet, VSpacer } from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { useWalletStore } from '@/stores/wallet';
import { useNumber } from '@/composable/number';
import { useDate } from '@/composable/date';
import { useNotify } from '@/composable/notify';

import type { ITransactionHistoryItem } from '../../../types';

export const WalletTransactions = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const walletStore = useWalletStore();

    const { address } = storeToRefs(accountStore);
    const { transactionHistory } = storeToRefs(walletStore);

    const { formatDate } = useDate();
    const { formatToken } = useNumber();
    const { showError } = useNotify();

    const isLoading = ref<boolean>(false);

    watchEffect(() => {
      if(address.value) {
        isLoading.value = true;

        try {
          walletStore.getTransactionHistory(address.value);
        } catch (error) {
          showError('Error loading transaction history');
          console.error(error);
        } finally {
          isLoading.value = false;
        }
      }
    });

    const renderRow = (item: ITransactionHistoryItem) => {
      const { _id, upcoming, data, createdOn } = item;
      const addressRow = item.upcoming ? `From ${data.from}` : `To ${data.to}`;

      return (
        <VSheet
          key={_id}
          rounded="lg"
          color="rgba(255,255,255,.05)"
          class="pa-4 d-flex align-center mb-2"
        >
          <VSheet
            rounded="circle"
            border="outline"
            class="d-flex align-center justify-center text-caption mr-4"
            color="rgba(0,0,0,0)"
            width={40}
            height={40}
          >

            <VIcon>
              {item.upcoming ? 'mdi-arrow-up' : 'mdi-arrow-down'}
            </VIcon>
          </VSheet>

          <div>
            <div class="d-flex mb-2">
              <span class="text-h6">
                {upcoming ? 'Sent' : 'Received'}
              </span>
              <span class="mx-2">•</span>
              <div class="text-body-1 text-medium-emphasis">
                {formatDate(new Date(createdOn), 'dd MMMM yyyy, h:m a')}
              </div>
            </div>
            <VSheet maxWidth={240} class="text-truncate">
              {addressRow}
            </VSheet>
          </div>
          <VSpacer />
          <div>
            <div class="text-h6">
              {!upcoming && '+'}
              {formatToken(data.amount)}
            </div>
            {/*(+$100.00)*/}
          </div>
        </VSheet>
      );
    };

    return () => transactionHistory.value.map(renderRow);
  }
});
