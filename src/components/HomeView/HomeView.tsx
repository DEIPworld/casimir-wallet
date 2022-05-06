import './HomeView.scss';

import { defineComponent } from 'vue';

import {
  VBtn, VSheet
} from 'vuetify/components';

export const HomeView = defineComponent({
  name: 'HomeView',

  setup() {
    return () => (
      <VSheet class={'pa-18 d-flex'} color={'transparent'} minHeight={'100%'}>
        <VSheet class={'flex-fit align-self-center'} color={'transparent'}>
          <div class={'text-h1 mb-9'}>Welcome to DEIP wallet</div>
          <div class={'text-h5 mb-12'} style={{ maxWidth: '400px' }}>
            Securely store DEIP tokens and other supported assets in the DEIP wallet.
          </div>
          <VBtn
            color={'primary'}
            to={{ name: 'account.create' }}>
            create an account
          </VBtn>
          <VBtn
            color={'secondary-btn'}
            to={{ name: 'account.import' }}
            class={'ml-4'}>
            import an existing account
          </VBtn>
        </VSheet>
        <VSheet class={'flex-fit position-relative'} color={'transparent'}>
          {/*<div class={'home-view__screen-img'}/>*/}
        </VSheet>
      </VSheet>
    );
  }
});

