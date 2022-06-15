import { defineComponent, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import { InnerContainer } from '@/components/InnerContainer';
import { VTab, VTabs, VDivider } from 'vuetify/components';

export const ActionView = defineComponent({
  setup() {
    const route = useRoute();
    const routePrefix = computed(() => route.path.includes('multisig') ? 'multisig.' : '');

    return () => (
      <InnerContainer>
        <VTabs class="mt-n12 mx-n12" style="height: 64px" grow>
          <VTab to={{ name: `${routePrefix.value}action.send` }}>send</VTab>
          <VTab to={{ name: `${routePrefix.value}action.receive` }}>receive</VTab>
        </VTabs>

        <VDivider class="mx-n12 mb-12"/>

        <RouterView/>
      </InnerContainer>
    );
  }
});
