import { useEffect, useState } from 'react';

/** Shown on touch devices until the user taps once (required by iOS to keep screen on). */
export default function ScreenAwakeHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('ontouchstart' in window)) return undefined;

    const timer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setVisible(true);
      }
    }, 2500);

    function dismiss() {
      setVisible(false);
    }

    const events = ['pointerdown', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, dismiss, { capture: true, passive: true });
    });

    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => {
        document.removeEventListener(event, dismiss, { capture: true });
      });
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onPointerDown={() => setVisible(false)}
      className="fixed bottom-0 inset-x-0 z-[100] px-4 py-3 text-center text-sm text-slate-200 bg-slate-900/95 border-t border-slate-700 safe-bottom touch-manipulation"
    >
      Tap anywhere to keep your screen on during the game
    </button>
  );
}
