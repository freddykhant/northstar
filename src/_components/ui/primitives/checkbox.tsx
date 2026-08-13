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
          stroke="#fff"
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
