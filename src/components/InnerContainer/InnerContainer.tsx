import { VSheet, VCard } from 'vuetify/components';
import { defineComponent } from 'vue';

export const InnerContainer = defineComponent({
  setup(_, { slots }) {
    return () => (
      <VSheet
        class="pa-18 mx-auto"
        color="transparent"
        maxWidth={860}
      >
        <VCard
          color="card"
          rounded={'xl'}
          class="pa-12"
        >
          {slots.default?.()}
        </VCard>
      </VSheet>
    );
  }
});
