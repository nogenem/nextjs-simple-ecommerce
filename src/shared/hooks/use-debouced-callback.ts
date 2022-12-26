/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';

import type { DebouncedFunc, DebounceSettings } from 'lodash';
import debounce from 'lodash.debounce';

export function useDebouncedCallback<T extends (...args: any) => any>(
  callback: T,
  delay = 0,
  options?: DebounceSettings,
): DebouncedFunc<T> {
  return useCallback(debounce(callback, delay, options), [
    callback,
    delay,
    options,
  ]);
}
