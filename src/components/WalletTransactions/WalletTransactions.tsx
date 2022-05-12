import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { VIcon, VSheet, VSpacer } from 'vuetify/components';
import { useWalletStore } from '@/stores/wallet';
import { useDate } from '@/composable/date';
import type { ITransaction } from '../../../types';

export const WalletTransactions = defineComponent({
  setup() {
    const walletStore = useWalletStore();
    const { transactions } = storeToRefs(walletStore);

    const { formatDate } = useDate();

    const renderRow = (data: ITransaction) => {
      const isPositive = !(data.amount as string).includes('-');

      return (
        <VSheet
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
              {isPositive ? 'mdi-arrow-down' : 'mdi-arrow-up'}
            </VIcon>
          </VSheet>

          <div>
            <div class="d-flex mb-2">
              <span class="text-h6">
                {isPositive ? 'Received' : 'Sent'}
              </span>
              <span class="mx-2">•</span>
              <div class="text-body-1 text-medium-emphasis">
                {formatDate(data.date, 'dd MMMM yyyy, h:m a')}
              </div>
            </div>
            <VSheet maxWidth={240} class="text-truncate">
              From: {data.from}
            </VSheet>
          </div>
          <VSpacer />
          <div>
            <div class="text-h6">
              {isPositive && '+'}
              {data.amount} DEIP
            </div>
            {/*(+$100.00)*/}
          </div>
        </VSheet>
      );
    };

    return () => transactions.value.map((data) => renderRow(data));
  }
});
