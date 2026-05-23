import { useEffect } from 'react';

/**
 * Keeps the screen on while the app is visible (Screen Wake Lock API).
 * Works on mobile Chrome/Safari when the tab is active; may need a user gesture first.
 */
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
        // Ignored — unsupported, low battery, or background tab
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
