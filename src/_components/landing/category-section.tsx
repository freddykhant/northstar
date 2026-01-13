"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface CategorySectionProps {
  id: string;
  category: "mind" | "body" | "soul";
  title: string;
  description: string;
  habits: string[];
  imageSrc: string;
  reverse?: boolean;
}

const CATEGORY_STYLES = {
  mind: {
    gradient: "from-blue-50 to-white",
    text: "text-blue-600",
    bg: "bg-blue-500",
    border: "border-blue-200",
    habits: "bg-blue-50 text-blue-700 border-blue-200",
  },
  body: {
    gradient: "from-red-50 to-white",
    text: "text-red-600",
    bg: "bg-red-500",
    border: "border-red-200",
    habits: "bg-red-50 text-red-700 border-red-200",
  },
  soul: {
    gradient: "from-purple-50 to-white",
    text: "text-purple-600",
    bg: "bg-purple-500",
    border: "border-purple-200",
    habits: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

export function CategorySection({
  id,
  category,
  title,
  description,
  habits,
  imageSrc,
  reverse = false,
}: CategorySectionProps) {
  const styles = CATEGORY_STYLES[category];

  return (
    <section
      id={id}
      className={`scroll-mt-24 bg-gradient-to-b ${styles.gradient} px-4 py-24`}
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={`flex flex-col items-center gap-16 lg:flex-row ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Image/Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex-shrink-0"
          >
            <div className="relative">
              {/* Glow effect */}
              <div
                className={`absolute inset-0 ${styles.bg} opacity-20 blur-3xl`}
              />
              <Image
                src={imageSrc}
                alt={title}
                width={280}
                height={280}
                className="relative drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className={`mb-4 text-5xl font-bold ${styles.text}`}>
              {title}
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-zinc-600">
              {description}
            </p>

            {/* Example habits */}
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {habits.map((habit) => (
                <span
                  key={habit}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${styles.habits}`}
                >
                  {habit}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
