import { defineComponent } from 'vue';
import { VBtn, VIcon, VSheet } from 'vuetify/components';
import useClipboard from 'vue-clipboard3';

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

    const copyAddress = async (): Promise<void> => {
      try {
        await toClipboard(props.address);
        console.info('Successfully copied');

        // showNotify(successMessage);
      } catch (e) {
        console.error(e);
      }
    };

    const renderDefaultVariant = () => (
      <VSheet maxWidth={200} class="d-flex align-center">
        <div class="text-subtitle-1 text-truncate">{props.address}</div>
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
        rounded
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