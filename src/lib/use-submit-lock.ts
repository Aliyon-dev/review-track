import { useCallback, useRef } from 'react';

export function useSubmitLock() {
  const lockRef = useRef(false);

  const run = useCallback(async (fn: () => Promise<void>) => {
    if (lockRef.current) return;
    lockRef.current = true;
    try {
      await fn();
    } finally {
      lockRef.current = false;
    }
  }, []);

  return run;
}
