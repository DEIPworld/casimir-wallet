import { RouterView } from 'vue-router';
import { defineComponent } from 'vue';
import { InnerContainer } from '@/components/InnerContainer';

export const AccountView = defineComponent({
  setup() {
    return () => (
      <InnerContainer>
        <RouterView />
      </InnerContainer>
    );
  }
});
