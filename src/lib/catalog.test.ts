import { describe, expect, it } from "vitest";
import { extractAuthorNames } from "./catalog-utils";
import { getSafeImageUrl } from "./image";
import { formatPrice } from "./money";

describe("formatPrice", () => {
  it("formats cents as Brazilian reais", () => {
    expect(formatPrice(2590)).toContain("25,90");
  });

  describe("getSafeImageUrl", () => {
    it("only accepts HTTPS image locations", () => {
      expect(getSafeImageUrl("https://images.example.test/book.jpg")).toBe("https://images.example.test/book.jpg");
      expect(getSafeImageUrl("javascript:alert(1)")).toBeNull();
      expect(getSafeImageUrl("not a URL")).toBeNull();
    });
  });

  describe("extractAuthorNames", () => {
    it("supports embedded object and array relationship shapes", () => {
      expect(extractAuthorNames([
        { authors: { name: "Ana Ribeiro" } },
        { authors: [{ name: "Caio Martins" }] },
        { authors: null },
      ])).toEqual(["Ana Ribeiro", "Caio Martins"]);
    });
  });
});
