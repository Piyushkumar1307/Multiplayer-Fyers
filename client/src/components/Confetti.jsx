import { useEffect } from 'react';

function burst(particleRatio, opts = {}) {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    zIndex: 9999,
  };

  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  });
}

export default function Confetti({ active = true, intense = false }) {
  useEffect(() => {
    if (!active) return;

    burst(0.25, { spread: 26, startVelocity: 55 });
    burst(0.2, { spread: 60 });
    burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    burst(0.1, { spread: 120, startVelocity: 45 });

    if (!intense) return;

    const duration = 4000;
    const end = Date.now() + duration;

    import('canvas-confetti').then(({ default: confetti }) => {
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          zIndex: 9999,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          zIndex: 9999,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    });
  }, [active, intense]);

  return null;
}
