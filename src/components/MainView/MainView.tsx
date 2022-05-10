import { computed, defineComponent } from 'vue';

import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account';
import { WalletView } from '@/components/WalletView';
import { HomeView } from '@/components/HomeView';

export const MainView = defineComponent({
  name: 'HomeView',

  setup() {
    const accountStore = useAccountStore();
    const { isLoggedIn } = storeToRefs(accountStore);

    const DisplayCmp = computed(() => isLoggedIn.value ? WalletView : HomeView);

    return () => (
      <DisplayCmp.value />
    );
  }
});

