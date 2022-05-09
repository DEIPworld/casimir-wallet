import { computed, defineComponent, onMounted, ref } from 'vue';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { VBtn, VTextField, VSheet } from 'vuetify/components';
import { RouterView } from 'vue-router';
import { InnerContainer } from '@/components/InnerContainer';
import { useVestingStore } from '@/stores/vesting';
import { DisplayAddress } from '@/components/DisplayAddress/DisplayAddress';

export const VestingView = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const { accountJson, address } = storeToRefs(accountStore);

    const vestingStore = useVestingStore();
    const { vesting } = storeToRefs(vestingStore);
    const { getVestingPlan, claimVesting } = vestingStore;

    const password = ref('');
    const isConfirmActive = ref(false);

    const isActive = computed(() => vesting.value?.startTime);

    onMounted(async () => {
      await getVestingPlan(address.value);
    });

    const toggleConfirm = () => {
      isConfirmActive.value = !isConfirmActive.value;

      if (!isConfirmActive.value) {
        password.value = '';
      }
    };

    const renderClaimBtn = () => {
      if (isActive.value) {
        return (
          <div class="text-right">
            <VBtn
              size="small"
              color="primary"
              onClick={toggleConfirm}
            >
              claim
            </VBtn>
          </div>
        );
      }

      return null;
    };

    const renderInput = () => {
      if (isActive.value && isConfirmActive.value) {
        return (
          <VSheet rounded="lg" color="rgba(0,0,0,.2)" class="d-flex mt-12 align-center pa-6 mb-6">
            <VTextField
              singleLine
              density="comfortable"
              class="spacer"
              label="Password"
              v-model={password.value}
              hideDetails
            />
            <VBtn
              class="ml-4"
              onClick={() => accountJson.value && claimVesting(accountJson.value, password.value)}
            >
              Confirm
            </VBtn>
          </VSheet>
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

        {renderInput()}

        {renderView()}
      </InnerContainer>
    );
  }
});
