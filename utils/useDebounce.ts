import { customRef } from "vue";

export function useDebounce(value: string, delay = 700) {
  let timeout: number;

  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}
