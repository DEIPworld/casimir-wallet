import { defineComponent } from 'vue';
import useClipboard from 'vue-clipboard3';

import { useNotify } from '@/composable/notify';
import { useString } from '@/composable/string';

import { VBtn, VIcon, VSheet } from 'vuetify/components';

export const DisplayAddress = defineComponent({
  props: {
    address: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default'
    }
  },

  setup(props) {
    const { toClipboard } = useClipboard();
    const { showError, showSuccess } = useNotify();
    const { middleTruncate } = useString();

    const copyAddress = async (): Promise<void> => {
      try {
        await toClipboard(props.address);
        showSuccess('Successfully copied');

        // showNotify(successMessage);
      } catch (e) {
        console.error(e);
      }
    };

    const renderDefaultVariant = () => (
      <VSheet maxWidth={200} class="d-flex align-center">
        <div class="text-subtitle-1 text-truncate">{middleTruncate(props.address)}</div>
        <VBtn
          icon
          variant="outlined"
          height="32"
          width="32"
          color="secondary-bt"
          onClick={copyAddress}
        >
          <VIcon size="16px">mdi-content-copy</VIcon>
        </VBtn>
      </VSheet>
    );

    const renderAccentVariant = () => (
      <VSheet
        color="neutral-darken-4"
        rounded="pill"
        class="d-flex"
      >
        <VSheet
          class="mr-n1 px-4 d-flex align-center"
          maxWidth={200}
        >
          <div class="text-truncate">{props.address}</div>
        </VSheet>

        <VBtn
          color="primary"
          prependIcon="mdi-content-copy"
          onClick={copyAddress}
        >
          Copy
        </VBtn>
      </VSheet>
    );

    const variantMap: Record<string, any> = {
      default: renderDefaultVariant,
      accent: renderAccentVariant
    };

    return () => variantMap[props.variant]();
  }
});
