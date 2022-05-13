
import { computed, defineComponent } from 'vue';
import texture2Url from '@/assets/images/texture-2.png';

import {
  VBtn, VSheet
} from 'vuetify/components';

import { useLayout } from '@/composable/layout';
import { useDisplay } from 'vuetify';

export const HomeView = defineComponent({
  name: 'HomeView',

  setup() {
    const { getMainGap } = useLayout();
    const { mdAndDown, smAndDown, smAndUp } = useDisplay();

    const styles = computed(() => ({
      backgroundImage: `url(${texture2Url})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: mdAndDown.value ? 'cover' : '70vw',
      backgroundPosition: mdAndDown.value ? '0 50%' : '40vw 50%'
    }));

    return () => (
      <VSheet
        minHeight="100%"
        class={`${getMainGap()} d-flex align-center`}
        style={styles.value}
      >
        <VSheet maxWidth={1140} width="100%" class="mx-auto d-flex position-relative">
          <VSheet class="position-relative" maxWidth={640}>
            <div class="text-h2 text-lg-display mb-9">DEIP .wallet<br/> is here</div>
            <div class="text-h5 mb-18 font-weight-regular">
              Securely store DEIP tokens and other supported assets in the DEIP wallet.
            </div>

            <VBtn
              size="x-large"
              rounded="pill"
              class={smAndUp.value && 'rounded-l-0'}
              color={'primary'}
              to={{ name: 'account.create' }}
              block={smAndDown.value}
            >
              Create Account
            </VBtn>
            <VBtn
              size="x-large"
              rounded="pill"
              variant="outlined"
              color="white"
              to={{ name: 'account.import' }}
              block={smAndDown.value}
              class={smAndDown.value ? 'mt-4' : 'ml-4'}
            >
              Import Existing Account
            </VBtn>
          </VSheet>



        </VSheet>
      </VSheet>
    );
  }
});

