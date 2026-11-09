export const CATEGORY_IDS = ["mind", "body", "soul"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  mind: "Mind",
  body: "Body",
  soul: "Soul",
};

type Palette = Record<CategoryId | "perfect" | "empty", string>;

export const CATEGORY_HEX: { light: Palette; dark: Palette } = {
  light: { mind: "#6c5ce7", body: "#f2542d", soul: "#0fa47f", perfect: "#d4a017", empty: "#e7e4f1" },
  dark: { mind: "#9c8fff", body: "#ff7d5c", soul: "#35c9a3", perfect: "#ffce54", empty: "#26242f" },
};
