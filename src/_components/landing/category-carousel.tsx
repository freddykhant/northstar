"use client";

import { motion } from "framer-motion";
import { Brain, Dumbbell, Sparkles } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  icon: "mind" | "body" | "soul";
  description: string;
  textGradient: string;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: "mind",
    name: "Mind",
    icon: "mind",
    description:
      "Feed your curiosity. Every page, every lesson, every thought—building your mental fortress.",
    textGradient: "from-blue-400 via-cyan-400 to-blue-600",
    color: "blue",
  },
  {
    id: "body",
    name: "Body",
    icon: "body",
    description:
      "Sweat today, smile tomorrow. Your future self will thank you for every rep.",
    textGradient: "from-red-400 via-orange-400 to-red-600",
    color: "red",
  },
  {
    id: "soul",
    name: "Soul",
    icon: "soul",
    description:
      "Find your center. Breathe in peace, breathe out gratitude. Your inner garden awaits.",
    textGradient: "from-purple-400 via-pink-400 to-purple-600",
    color: "purple",
  },
];

const ICONS = {
  mind: Brain,
  body: Dumbbell,
  soul: Sparkles,
};

// Mind card with animated reading progress
function MindContent() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="relative h-48 rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-cyan-950/30">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-500 p-2">
            <span className="text-2xl">📚</span>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Atomic Habits
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
            <motion.div
              className="h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/50"
              onViewportEnter={() => {
                const interval = setInterval(() => {
                  setProgress((p) => {
                    if (p >= 67) {
                      clearInterval(interval);
                      return 67;
                    }
                    return p + 1;
                  });
                }, 20);
              }}
            >
              <motion.div
                className="h-full bg-linear-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </motion.div>
            <p className="mt-2 text-xs text-blue-700">
              Reading streak: 12 days 🔥
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {["📖", "✍️", "🧩", "🎓"].map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 + 0.5 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Body card with workout checklist and sweat
function BodyContent() {
  const [checked, setChecked] = useState<number[]>([]);
  const workouts = ["Push-ups", "Squats", "Plank", "Cardio"];

  return (
    <div className="relative h-48 rounded-xl border border-red-200 bg-linear-to-br from-red-50 to-orange-50 p-4 dark:border-red-900/50 dark:from-red-950/30 dark:to-orange-950/30">
      <div className="space-y-2">
        {workouts.map((workout, i) => (
          <motion.button
            key={i}
            onClick={() =>
              setChecked((prev) =>
                prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
              )
            }
            className="flex w-full items-center gap-2 rounded-lg bg-white/70 px-3 py-2 transition-all hover:bg-white dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                checked.includes(i)
                  ? "border-red-500 bg-red-500"
                  : "border-red-300"
              }`}
            >
              {checked.includes(i) && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
            </div>
            <span className="text-sm font-medium text-red-900 dark:text-red-100">
              {workout}
            </span>
            {checked.includes(i) && <span className="ml-auto">💪</span>}
          </motion.button>
        ))}
      </div>
      {/* Sweat drops */}
      {checked.length > 0 && (
        <>
          {[...Array(checked.length)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ y: -10, x: 20 + i * 30, opacity: 1 }}
              animate={{ y: 180, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              💧
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

// Soul card with breathing meditation
function SoulContent() {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-900/50 dark:from-purple-950/30 dark:to-pink-950/30">
      <div className="flex h-full flex-col items-center justify-center">
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="h-24 w-24 rounded-full bg-linear-to-br from-purple-400 to-pink-400 opacity-30 blur-2xl"
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            ✨
          </div>
        </motion.div>
        <motion.div
          className="mt-4 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Breathe in... Breathe out...
          </p>
          <div className="mt-2 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-purple-400"
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const Icon = ICONS[category.icon];

  return (
    <motion.div
      id={category.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <motion.div
        className="group relative h-[520px] w-[380px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-white/10 dark:bg-zinc-900"
        whileHover={{ y: -4 }}
      >
        {/* Gradient title with icon (like feature badge) */}
        <div className="mb-4 flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${
              category.color === "blue"
                ? "text-blue-500"
                : category.color === "red"
                  ? "text-red-500"
                  : "text-purple-500"
            }`}
          />
          <span
            className={`animate-shimmer bg-linear-to-r ${category.textGradient} bg-size-[200%_100%] bg-clip-text text-lg font-bold text-transparent`}
          >
            {category.name}
          </span>
        </div>

        {/* Interactive content */}
        <div className="mb-6">
          {category.id === "mind" && <MindContent />}
          {category.id === "body" && <BodyContent />}
          {category.id === "soul" && <SoulContent />}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
            Track {category.name}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {category.description}
          </p>
        </div>

        {/* Arrow button */}
        <button
          className="absolute right-6 bottom-6 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-800 dark:hover:border-white/20 dark:hover:bg-zinc-700"
          aria-label={`Learn more about ${category.name}`}
        >
          <svg
            className="h-4 w-4 text-zinc-600 dark:text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function CategoryCarousel() {
  return (
    <section className="bg-white px-4 py-24 dark:bg-black">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-5xl font-bold text-black dark:text-white">
            Three dimensions of growth
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            Track habits across mind, body, and soul.
          </p>
        </div>

        {/* Centered cards grid */}
        <div className="flex flex-wrap items-start justify-center gap-6">
          {CATEGORIES.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
