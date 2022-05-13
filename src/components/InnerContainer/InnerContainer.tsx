import { VSheet, VCard } from 'vuetify/components';
import { defineComponent } from 'vue';
import { useLayout } from '@/composable/layout';
import { useDisplay } from 'vuetify';

export const InnerContainer = defineComponent({
  setup(_, { slots }) {
    const { getMainGap } = useLayout();
    const { mdAndDown, smAndDown, smAndUp } = useDisplay();

    const renderCard = () => {
      if (smAndUp.value) {
        return (
          <VCard
            color="card"
            rounded={'xl'}
            class="pa-12"
          >
            {slots.default?.()}
          </VCard>
        );
      }

      return (
        <>
          {slots.default?.()}
        </>
      );
    };

    return () => (
      <VSheet
        class={`${getMainGap()} mx-auto position-relative`}
        color="transparent"
        maxWidth={860}
      >
        {renderCard()}
      </VSheet>
    );
  }
});
