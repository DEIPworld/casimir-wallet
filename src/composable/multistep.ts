import { ref } from 'vue';
import type { Ref } from 'vue';

type Steps = 'start' | 'finish';

export function useMultistep<T = Steps>(startFrom: T) {
  const currentsStep = ref<T>(startFrom) as Ref<T>;

  const setStep = (step: T): void => {
    currentsStep.value = step;
  };

  return {
    currentsStep,
    setStep
  };
}
