import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';

import { VSheet } from 'vuetify/components';

import { useDate } from '@/composable/date';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useVestingStore } from '@/stores/vesting';

export const MultisigVestingDetails = defineComponent({
  setup() {
    const vestingStore = useVestingStore();
    const { vesting } = storeToRefs(vestingStore);

    const multisigStore = useMultisigWalletStore();
    const { balance } = storeToRefs(multisigStore);

    const { formatDate, millisecondsToMonth } = useDate();

    const renderRow = (label: string, data: any) => (
      <VSheet
        rounded
        color="rgba(255,255,255,.05)"
        class="pa-4 d-flex align-center justify-space-between mb-2"
      >
        <div class="text-h6">{label}</div>
        <div class="text-subtitle-1">{data}</div>
      </VSheet>
    );

    return () => (
      <>
        {renderRow('Total vested tokens', `${vesting.value?.totalAmount} DEIP`)}
        {renderRow('Locked tokens', `${balance.value?.data.feeFrozen} DEIP`)}
        {
          vesting.value?.startTime ? renderRow(
            'Start vesting contract',
            `${formatDate(vesting.value?.startTime, 'dd MMMM yyyy, h:m a')}`
          ) : null
        }
        {renderRow('Vesting interval', `${millisecondsToMonth(vesting.value?.interval || 0)} month`)}
        {renderRow('Cliff vesting', `${vesting.value?.cliffDuration} month`)}
        {renderRow('Total vesting period', `${vesting.value?.totalDuration} month`)}
      </>
    );
  }
});
