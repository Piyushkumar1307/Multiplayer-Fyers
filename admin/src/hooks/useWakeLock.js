import { useEffect } from 'react';

export function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return undefined;
    }

    let lock = null;
    let cancelled = false;

    async function acquire() {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        if (lock) return;
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => {
          lock = null;
        });
      } catch {
        // unsupported or denied
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        acquire();
      }
    }

    acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (lock) {
        lock.release().catch(() => {});
        lock = null;
      }
    };
  }, [enabled]);
}
