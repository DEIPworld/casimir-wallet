import { computed, defineComponent, onMounted, watchEffect, ref } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';

import { VBtn } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useVestingStore } from '@/stores/vesting';
import { useDate } from '@/composable/date';

export const MultisigVestingView = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const vestingStore = useVestingStore();
    const { vesting } = storeToRefs(vestingStore);
    const { getVestingPlan, claimVesting } = vestingStore;

    const { addTimePeriod, isBefore } = useDate();

    const isLoading = ref<boolean>(false);
    const isConfirmationModalOpen = ref<boolean>(false);
    const passwordError = ref<string>();
    const isNotAvailable = ref<boolean>(true);

    const isActive = computed(() => vesting.value?.startTime);

    watchEffect(() => {
      if (vesting.value?.startTime && vesting.value?.cliffDuration) {
        const endTime = addTimePeriod(new Date(vesting.value?.startTime as number), {
          months: vesting.value?.cliffDuration as number
        });
        isNotAvailable.value = isBefore(new Date(), endTime);
      }
    });

    onMounted(async () => {
      await getVestingPlan(props.address);
    });

    const onConfirm = async (password: string): Promise<void> => {
      // TODO Add claim vesting logic for multisig wallet
    };

    const openConfirmModal = (): void => {
      isConfirmationModalOpen.value = true;
      passwordError.value = undefined;
    };

    const renderClaimBtn = () => {
      if (!isActive.value) return null;

      return (
        <div class="text-right">
          <div
            class={isNotAvailable.value ? 'dw-tooltip' : null}
            data-tooltip="No funds claim is possible until the end of the cliff period"
          >
            <VBtn
              size="small"
              color="primary"
              disabled={isNotAvailable.value}
              onClick={openConfirmModal}
            >
              claim
            </VBtn>
          </div>
        </div>
      );
    };

    const renderView = () => {
      if (isActive.value) {
        return <RouterView />;
      }

      return "There's no vesting contract assigned to the account.";
    };

    return () => (
      <InnerContainer>
        <div class="d-flex justify-space-between mb-6 align-end">
          <div>
            <div class="text-h3 mb-2">Vesting contract</div>
            <DisplayAddress address={props.address} />
          </div>

          {renderClaimBtn()}
        </div>

        {renderView()}

        <ConfirmActionModal
          isOpen={isConfirmationModalOpen.value}
          isLoading={isLoading.value}
          error={passwordError.value}
          onClick:cancel={() => (isConfirmationModalOpen.value = false)}
          onClick:confirm={onConfirm}
        />
      </InnerContainer>
    );
  }
});
