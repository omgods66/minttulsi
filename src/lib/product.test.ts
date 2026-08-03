import { describe, expect, it } from "vitest";

import { calculateOrder, formatNpr, normaliseQuantity } from "@/lib/product";

describe("calculateOrder", () => {
  it("prices one plant inside Kathmandu Valley", () => {
    expect(calculateOrder(1, "kathmandu_valley")).toMatchObject({
      paidQuantity: 1,
      freeQuantity: 0,
      totalPlants: 1,
      subtotal: 49,
      deliveryFee: 0,
      totalPrice: 49,
    });
  });

  it("adds the outside-Valley fee", () => {
    expect(calculateOrder(2, "outside_valley")).toMatchObject({
      paidQuantity: 2,
      freeQuantity: 0,
      totalPlants: 2,
      subtotal: 98,
      deliveryFee: 80,
      totalPrice: 178,
    });
  });

  it("applies Buy 3 Get 1 Free inside the Valley", () => {
    expect(calculateOrder(3, "kathmandu_valley")).toMatchObject({
      paidQuantity: 3,
      freeQuantity: 1,
      totalPlants: 4,
      subtotal: 147,
      deliveryFee: 0,
      totalPrice: 147,
    });
  });

  it("applies the offer and delivery outside the Valley", () => {
    expect(calculateOrder(3, "outside_valley")).toMatchObject({
      freeQuantity: 1,
      totalPlants: 4,
      subtotal: 147,
      deliveryFee: 80,
      totalPrice: 227,
    });
  });

  it("caps the Buy 3 Get 1 offer at one free plant", () => {
    expect(calculateOrder(6, "outside_valley")).toMatchObject({
      paidQuantity: 6,
      freeQuantity: 1,
      totalPlants: 7,
      subtotal: 294,
      deliveryFee: 80,
      totalPrice: 374,
    });
  });

  it.each([0, -1, 1.5, 100, Number.NaN])(
    "rejects invalid quantity %s",
    (quantity) => {
      expect(() => calculateOrder(quantity, "kathmandu_valley")).toThrow();
    },
  );
});

describe("pricing display helpers", () => {
  it("formats Nepalese rupee values", () => {
    expect(formatNpr(227)).toBe("Rs 227");
  });

  it("normalises unsafe query quantities", () => {
    expect(normaliseQuantity("3")).toBe(3);
    expect(normaliseQuantity("0")).toBe(1);
    expect(normaliseQuantity("4.5")).toBe(1);
    expect(normaliseQuantity("not-a-number")).toBe(1);
  });
});
