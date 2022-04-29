import { defineComponent, onMounted, ref } from 'vue';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { VSheet } from 'vuetify/components';
import { useVestingStore } from '@/stores/vesting';

export const VestingDetails = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);

    const vestingStore = useVestingStore();
    const { vesting } = storeToRefs(vestingStore);
    const { getVestingPlan } = vestingStore;

    onMounted(async () => {
      await getVestingPlan(address.value);
    });

    const renderRow = (label: string, data: any) => (
      <VSheet
        rounded="lg"
        color="rgba(255,255,255,.05)"
        class="pa-4 d-flex align-center justify-space-between mb-2"
      >
        <div class="text-h6">{label}</div>
        <div class="text-subtitle-1">{data}</div>
      </VSheet>
    );

    return () => (
      <>
        {renderRow('cliffDuration', vesting.value?.cliffDuration)}
        {renderRow('initialAmount', vesting.value?.initialAmount)}
        {renderRow('interval', vesting.value?.interval)}
        {renderRow('startTime', vesting.value?.startTime)}
        {renderRow('totalAmount', vesting.value?.totalAmount)}
        {renderRow('totalDuration', vesting.value?.totalDuration)}
        {renderRow('vestingDuringCliff', vesting.value?.vestingDuringCliff)}
      </>
    );
  }
});
