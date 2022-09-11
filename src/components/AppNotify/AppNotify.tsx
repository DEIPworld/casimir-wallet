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

    const showWarning = (message: string) => {
      show(message, 'warning');
    };

    emitter.on('notify.show', show);
    emitter.on('notify.showSuccess', showSuccess);
    emitter.on('notify.showError', showError);
    emitter.on('notify.showWarning', showWarning);

    return () => (
      <VSnackbar
        v-model={state.isActive}
        color={state.color}
        timeout={3000}
      >
        {state.message}
      </VSnackbar>
    );
  }
});
