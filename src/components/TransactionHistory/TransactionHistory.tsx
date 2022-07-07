import { defineComponent, ref, toRefs, watchEffect, onBeforeMount } from 'vue';
import { useScroll } from '@vueuse/core';

import { VIcon, VSheet, VSpacer } from 'vuetify/components';

import { useNumber } from '@/composable/number';
import { useDate } from '@/composable/date';

import type { ITransactionHistoryItem } from '../../../types';

const containerStyles = {
  maxHeight: '50vh',
  margin: '-48px',
  padding: '48px'
};

export const TransactionHistory = defineComponent({
  emits: ['load'],
  props: {
    transactionHistory: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const { formatDate } = useDate();
    const { formatToken } = useNumber();

    const page = ref<number>(1);
    const el = ref();

    const { arrivedState } = useScroll(el, {
      offset: {
        bottom: 600
      }
    });
    const { bottom } = toRefs(arrivedState);

    watchEffect(() => {
      if (bottom.value) {
        page.value = page.value + 1;
        emit('load', page.value);
      }
    });

    onBeforeMount(() => {
      emit('load', page.value);
    });

    const renderRow = (item: ITransactionHistoryItem) => {
      const { _id, upcoming, data, createdOn } = item;
      const addressRow = item.upcoming ? `to ${data.to}` : `From ${data.from}`;

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
            <VIcon>{item.upcoming ? 'mdi-arrow-up' : 'mdi-arrow-down'}</VIcon>
          </VSheet>

          <div>
            <div class="d-flex mb-2">
              <span class="text-h6">{upcoming ? 'Sent' : 'Received'}</span>
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

    return () => (
        <div ref={el} class="overflow-auto" style={containerStyles}>
          {props.transactionHistory.map(renderRow)}
        </div>
    );
  }
});
