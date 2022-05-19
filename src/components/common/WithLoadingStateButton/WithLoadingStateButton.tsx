import { defineComponent } from "vue";

import { VBtn, VProgressCircular } from "vuetify/components";

export const WithLoadingStateButton = defineComponent({
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    ...VBtn.props
  },
  setup(props, { slots }) {
    return () => (
      <VBtn>
        {props.isLoading ? (
          <VProgressCircular indeterminate={true} />
        ) : (
          slots.default?.()
        )}
      </VBtn>
    );
  }
});
