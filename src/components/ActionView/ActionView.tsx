import { defineComponent } from 'vue';
import { InnerContainer } from '@/components/InnerContainer';
import { VTab, VTabs, VDivider } from 'vuetify/components';
import { RouterView } from 'vue-router';

export const ActionView = defineComponent({
  setup() {
    return () => (
      <InnerContainer>
        <VTabs class="mt-n12 mx-n12" style="height: 64px" grow>
          <VTab to={{ name: 'action.send' }}>send</VTab>
          <VTab to={{ name: 'action.receive' }}>receive</VTab>
        </VTabs>

        <VDivider class="mx-n12 mb-12"/>

        <RouterView/>
      </InnerContainer>
    );
  }
});
