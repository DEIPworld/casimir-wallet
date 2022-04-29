import { reactive, ref } from 'vue';

export function useNotify() {
  const notify = reactive({
    color: '',
    message: ''
  });

  const notifyIsActive = ref<boolean>(false);

  const showNotify = (message: string, color = 'success'): void => {
    notifyIsActive.value = true;
    notify.color = color;
    notify.message = message;
  };

  return {
    notify,
    notifyIsActive,
    showNotify
  };
}
