import { computed, defineComponent, onMounted, ref } from 'vue';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { VBtn } from 'vuetify/components';
import { RouterView } from 'vue-router';
import { InnerContainer } from '@/components/InnerContainer';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';
import { useVestingStore } from '@/stores/vesting';
import { DisplayAddress } from '@/components/DisplayAddress/DisplayAddress';

export const VestingView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { accountJson, address } = storeToRefs(accountStore);

    const vestingStore = useVestingStore();
    const { vesting } = storeToRefs(vestingStore);
    const { getVestingPlan, claimVesting } = vestingStore;

    const isLoading = ref<boolean>(false);
    const isConfirmationModalOpen = ref<boolean>(false);
    const passwordError = ref<string>();

    const isActive = computed(() => vesting.value?.startTime);

    onMounted(async () => {
      await getVestingPlan(address.value);
    });

    const onConfirm = async(password: string): Promise<void> => {
      isLoading.value = true;

      setTimeout(async () => {
        try { 
          accountJson.value &&
            (await claimVesting(accountJson.value, password));
          isConfirmationModalOpen.value = false;
        } catch (error: any) {
          passwordError.value = error.message;
        } finally {
          isLoading.value = false;
        }
      }, 500);
    };

    const openConfirmModal = (): void => {
      isConfirmationModalOpen.value = true;
      passwordError.value = undefined;
    };

    const renderClaimBtn = () => {
      if (isActive.value) {
        return (
          <div class="text-right">
            <VBtn
              size="small"
              color="primary"
              onClick={openConfirmModal}
            >
              claim
            </VBtn>
          </div>
        );
      }

      return null;
    };

    const renderView = () => {
      if (isActive.value) {
        return (
          <RouterView />
        );
      }

      return 'There\'s no vesting contract assigned to the account.';
    };


    return () => (
      <InnerContainer>
        <div class="d-flex justify-space-between mb-6 align-end">
          <div>
            <div class="text-h3 mb-2">Vesting contract</div>
            <DisplayAddress address={address.value} />
          </div>

          {renderClaimBtn()}
        </div>

        {renderView()}


        <ConfirmActionModal
          isOpen={isConfirmationModalOpen.value}
          isLoading={isLoading.value}
          error={passwordError.value}
          onClick:cancel={() => isConfirmationModalOpen.value = false}
          onClick:confirm={onConfirm}
        />
      </InnerContainer>
    );
  }
});
