"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

interface ConfettiProps {
  /** Rising edge (false -> true) fires the burst. */
  trigger: boolean;
  /** Called once the burst finishes so the parent can reset `trigger`. */
  onDone?: () => void;
}

const COLORS = ["#6c5ce7", "#f2542d", "#0fa47f", "#9c8fff", "#35c9a3"];
const DURATION = 2400;

export function Confetti({ trigger, onDone }: ConfettiProps) {
  const wasTriggered = useRef(false);
  // Held in a ref so the effect never re-subscribes when the parent
  // re-renders with a new closure.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const rising = trigger && !wasTriggered.current;
    wasTriggered.current = trigger;
    if (!rising) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onDoneRef.current?.();
      return;
    }

    const end = Date.now() + DURATION;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: COLORS,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = end - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onDoneRef.current?.();
        return;
      }

      const particleCount = 50 * (timeLeft / DURATION);

      void confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      void confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [trigger]);

  return null;
}
