import { emitter } from '@/utils/eventBus';

type Opts = {
  color: string,
  message: string
}

export function useNotify() {
  const show = (opts: Opts) => {
    emitter.emit('notify.show', opts);
  };

  const showSuccess = (message: string) => {
    emitter.emit('notify.showSuccess', message);
  };

  const showError = (message: string) => {
    emitter.emit('notify.showError', message);
  };

  return {
    show,
    showSuccess,
    showError
  };
}
