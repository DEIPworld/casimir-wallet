import { computed, defineComponent, onMounted, watchEffect, ref } from 'vue';
import { useRouter, RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';

import { VBtn } from 'vuetify/components';
import { InnerContainer } from '@/components/InnerContainer';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useAccountStore } from '@/stores/account';
import { useVestingStore } from '@/stores/vesting';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useDate } from '@/composable/date';

export const MultisigVestingView = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    const accountStore = useAccountStore();
    const vestingStore = useVestingStore();
    const multisigStore = useMultisigWalletStore();

    const { accountJson, address, multisigAccountDetails } = storeToRefs(accountStore);
    const { vesting } = storeToRefs(vestingStore);
    const { balance } = storeToRefs(multisigStore);

    const { addTimePeriod, isBefore, formatDate } = useDate();

    const isLoading = ref<boolean>(false);
    const isConfirmationModalOpen = ref<boolean>(false);
    const passwordError = ref<string>();
    const isNotAvailable = ref<boolean>(false);
    const tooltipMessage = ref<string>();

    const isActive = computed(() => vesting.value?.startTime);

    watchEffect(() => {
      if (vesting.value?.startTime && vesting.value?.cliffDuration) {
        const endTime = addTimePeriod(new Date(vesting.value?.startTime as number), {
          months: vesting.value?.cliffDuration as number
        });
        isNotAvailable.value = isBefore(new Date(), endTime);
        tooltipMessage.value = 'No funds claim is possible until the end of the cliff period';

        return;
      }

      if (vesting.value?.interval) {
        const amountTaken =
          Number(vesting.value.totalAmount) - Number(balance.value?.data.feeFrozen);
        const amountPerInterval = Number(vesting.value.totalAmount) / vesting.value.intervalsCount;
        const nextInterval = Math.ceil(amountTaken / amountPerInterval) + 1;

        const nextTime = addTimePeriod(new Date(vesting.value?.startTime as number), {
          seconds: (vesting.value.interval * nextInterval) / 1000
        });

        isNotAvailable.value = isBefore(new Date(), nextTime);
        tooltipMessage.value = `Next claim will be available on ${formatDate(nextTime, 'dd MMMM yyyy, h:mm a')}`;

        return;
      }

      isNotAvailable.value = false;
    });

    onMounted(async () => {
      await vestingStore.getVestingPlan(props.address);
    });

    const onConfirm = async (password: string): Promise<void> => {
      isLoading.value = true;

      setTimeout(async () => {
        try {
          if (accountJson.value && multisigAccountDetails.value) {
            await vestingStore.approveVestingClaim({
              sender: { account: accountJson.value, password },
              multisigAddress: multisigAccountDetails.value.address,
              threshold: multisigAccountDetails.value.threshold,
              otherSignatories: multisigAccountDetails.value?.signatories
              .filter((item) => item.address !== address.value)
              .map((item) => item.address)
            });
          }
          isConfirmationModalOpen.value = false;

          router.push({ name: 'multisig.wallet' });
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
      if (!isActive.value) return null;

      return (
        <div class="text-right">
          <div
            class={isNotAvailable.value ? 'dw-tooltip' : null}
            data-tooltip={tooltipMessage.value}
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
