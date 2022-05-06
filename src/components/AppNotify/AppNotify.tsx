import { defineComponent, reactive } from 'vue';

import {
  VSnackbar
} from 'vuetify/components';
import { emitter } from '@/utils/eventBus';

type State = {
  isActive: boolean,
  color: string,
  message: string
}

export const AppNotify = defineComponent({
  setup() {
    const state: State = reactive({
      isActive: false,
      color: '',
      message: ''
    });

    const show = (message: string, color = 'success') => {
      state.isActive = true;
      state.color = color;
      state.message = message;
    };

    const showSuccess = (message: string) => {
      show(message, 'success');
    };

    const showError = (message: string) => {
      show(message, 'error');
    };

    emitter.on('notify.show', show);
    emitter.on('notify.showSuccess', showSuccess);
    emitter.on('notify.showError', showError);

    return () => (
      <VSnackbar
        v-model={state.isActive}
        color={state.color}
        timeout={2000}
      >
        {state.message}
      </VSnackbar>
    );
  }
});
