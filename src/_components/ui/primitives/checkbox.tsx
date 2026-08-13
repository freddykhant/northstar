"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CheckboxProps {
  checked: boolean;
  category: string;
  disabled?: boolean;
}

export function Checkbox({ checked, category, disabled }: CheckboxProps) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      animate={reduce ? {} : { scale: checked ? [1, 0.88, 1] : 1 }}
      transition={{ type: "tween", duration: 0.28, times: [0, 0.4, 1], ease: "easeOut" }}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2"
      style={{
        borderColor: checked
          ? `var(--color-${category})`
          : "var(--color-hairline)",
        backgroundColor: checked ? `var(--color-${category})` : "transparent",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <motion.svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        initial={false}
      >
        <motion.path
          d="M2 6.2 L4.8 9 L10 3"
          /* Fixed literal, not a token: the fill is always one of the three
           * category colours, which themselves flip between themes. #191822
           * (the light-mode --color-ink value) is the only foreground here
           * that clears the 3:1 SC 1.4.11 graphical-object floor against all
           * three categories in both themes (min 3.62:1, vs 2.09:1 for
           * white) — see scripts/check-palette.ts for the gate. */
          stroke="#191822"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.18 }}
        />
      </motion.svg>
    </motion.span>
  );
}
