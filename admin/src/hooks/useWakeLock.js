import { useEffect } from 'react';
import NoSleep from 'nosleep.js';

export function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return undefined;
    }

    let cancelled = false;
    let wakeLock = null;
    const noSleep = new NoSleep();
    let noSleepActive = false;

    async function acquireWakeLock() {
      if (cancelled || document.visibilityState !== 'visible') return;
      if (!('wakeLock' in navigator)) return;
      try {
        if (wakeLock && !wakeLock.released) return;
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
          if (!cancelled && document.visibilityState === 'visible') {
            acquireWakeLock();
          }
        });
      } catch {
        // unsupported or denied
      }
    }

    function enableNoSleep() {
      if (cancelled || noSleepActive) return;
      try {
        noSleep.enable();
        noSleepActive = true;
      } catch {
        // needs user gesture
      }
    }

    function keepAwake() {
      if (cancelled || document.visibilityState !== 'visible') return;
      acquireWakeLock();
      enableNoSleep();
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        keepAwake();
      } else if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
      }
    }

    function onUserGesture() {
      keepAwake();
    }

    keepAwake();

    const gestureEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
    gestureEvents.forEach((event) => {
      document.addEventListener(event, onUserGesture, { capture: true, passive: true });
    });
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intervalId = window.setInterval(keepAwake, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      gestureEvents.forEach((event) => {
        document.removeEventListener(event, onUserGesture, { capture: true });
      });
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
      }
      if (noSleepActive) {
        noSleep.disable();
        noSleepActive = false;
      }
    };
  }, [enabled]);
}
