import { describe, expect, it } from "vitest";
import { CATEGORY_HEX, CATEGORY_IDS, CATEGORY_LABELS } from "../src/categories.ts";

describe("categories", () => {
  it("lists ids in order", () => {
    expect(CATEGORY_IDS).toEqual(["mind", "body", "soul"]);
  });
  it("has labels", () => {
    expect(CATEGORY_LABELS).toEqual({ mind: "Mind", body: "Body", soul: "Soul" });
  });
  it("has hex values", () => {
    expect(CATEGORY_HEX.light).toEqual({ mind: "#6c5ce7", body: "#f2542d", soul: "#0fa47f", perfect: "#d4a017", empty: "#e7e4f1" });
    expect(CATEGORY_HEX.dark).toEqual({ mind: "#9c8fff", body: "#ff7d5c", soul: "#35c9a3", perfect: "#ffce54", empty: "#26242f" });
  });
});
