// Enforces the mosaic palette rules. Lightness alone is the wrong metric for
// "can you tell these apart" — hue does most of the work — so category colours
// are compared by perceptual distance (CIE76 dE) in Lab. Lightness IS the right
// metric against the empty tile, where the question is "does a marked day read
// as darker than an unmarked one".

type RGB = [number, number, number];
type Lab = [number, number, number];

const THEMES = {
  light: {
    mind: "#6c5ce7",
    body: "#f2542d",
    soul: "#0fa47f",
    tileEmpty: "#e7e4f1",
    surface: "#ffffff",
    mindInk: "#5346b8",
    bodyInk: "#b83c1c",
    soulInk: "#0a7a5e",
    perfect: "#d4a017",
  },
  dark: {
    mind: "#9c8fff",
    body: "#ff7d5c",
    soul: "#35c9a3",
    tileEmpty: "#26242f",
    surface: "#1c1b25",
    mindInk: "#b3a8ff",
    bodyInk: "#ff9a80",
    soulInk: "#5fd8b8",
    perfect: "#ffce54",
  },
} as const;

const MIN_DELTA_E = 40; // between category colours
const MIN_DELTA_L = 18; // between a category colour and the empty tile
const MIN_TEXT_CONTRAST = 4.5; // category-as-text on surface

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance per WCAG. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(linearize) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** sRGB -> CIE Lab (D65). */
function toLab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex).map(linearize) as RGB;
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function lightness(hex: string): number {
  return toLab(hex)[0];
}

const failures: string[] = [];

for (const [themeName, t] of Object.entries(THEMES)) {
  const cats = [
    ["mind", t.mind],
    ["body", t.body],
    ["soul", t.soul],
  ] as const;

  for (let i = 0; i < cats.length; i++) {
    for (let j = i + 1; j < cats.length; j++) {
      const d = deltaE(cats[i]![1], cats[j]![1]);
      if (d < MIN_DELTA_E) {
        failures.push(
          `${themeName}: ${cats[i]![0]} vs ${cats[j]![0]} dE ${d.toFixed(1)} < ${MIN_DELTA_E}`,
        );
      }
    }
  }

  for (const [name, hex] of cats) {
    const dl = Math.abs(lightness(hex) - lightness(t.tileEmpty));
    if (dl < MIN_DELTA_L) {
      failures.push(
        `${themeName}: ${name} vs empty tile dL* ${dl.toFixed(1)} < ${MIN_DELTA_L}`,
      );
    }
  }

  // `perfect` is a fourth meaning (all three categories kept), not a member
  // of the category set — it must still read as distinct from each of them,
  // and from the empty tile, by the same rules.
  for (const [name, hex] of cats) {
    const d = deltaE(t.perfect, hex);
    if (d < MIN_DELTA_E) {
      failures.push(
        `${themeName}: perfect vs ${name} dE ${d.toFixed(1)} < ${MIN_DELTA_E}`,
      );
    }
  }

  const perfectDl = Math.abs(lightness(t.perfect) - lightness(t.tileEmpty));
  if (perfectDl < MIN_DELTA_L) {
    failures.push(
      `${themeName}: perfect vs empty tile dL* ${perfectDl.toFixed(1)} < ${MIN_DELTA_L}`,
    );
  }

  const inks = [
    ["mind-ink", t.mindInk],
    ["body-ink", t.bodyInk],
    ["soul-ink", t.soulInk],
  ] as const;

  for (const [name, hex] of inks) {
    const ratio = contrast(hex, t.surface);
    if (ratio < MIN_TEXT_CONTRAST) {
      failures.push(
        `${themeName}: ${name} on surface ${ratio.toFixed(2)}:1 < ${MIN_TEXT_CONTRAST}:1`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Palette check FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("Palette check passed.");
