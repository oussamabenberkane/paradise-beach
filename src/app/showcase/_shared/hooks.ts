"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Count from 0 to `target` over `duration` ms when the returned ref enters view.
 * Tabular-numeral safe; respects prefers-reduced-motion (snaps to target).
 */
export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        const start = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setValue(Math.round(target * ease(t)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value } as const;
}

/**
 * Returns true once the element has entered the viewport. Stays true.
 */
export function useEnterOnce(threshold = 0.2) {
  const [entered, setEntered] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, entered } as const;
}
