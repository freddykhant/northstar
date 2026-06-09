"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Shoot confetti from multiple angles
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#5b7a99", "#b5553a", "#6f8a5e", "#c2410c", "#d4b675"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#5b7a99", "#b5553a", "#6f8a5e", "#c2410c", "#d4b675"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, [trigger]);

  return null;
}
