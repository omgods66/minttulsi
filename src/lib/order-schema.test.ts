import { describe, expect, it } from "vitest";

import { orderRequestSchema } from "@/lib/order-schema";

const validRequest = {
  requestId: "c6629902-aa3b-4c20-bf68-6b4c761ee529",
  productId: "mint-tulsi",
  fullName: "Sita Sharma",
  phone: "+977 9812345678",
  email: "sita@example.com",
  exactLocation: "Baneshwor, Kathmandu near the main chowk",
  deliveryZone: "kathmandu_valley",
  quantity: 3,
} as const;

describe("orderRequestSchema", () => {
  it("accepts a valid Cash on Delivery request", () => {
    expect(orderRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects missing and malformed customer information", () => {
    const result = orderRequestSchema.safeParse({
      ...validRequest,
      fullName: " ",
      phone: "123",
      email: "not-an-email",
      exactLocation: "x",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid quantities and zones", () => {
    expect(
      orderRequestSchema.safeParse({
        ...validRequest,
        quantity: 0,
        deliveryZone: "somewhere_else",
      }).success,
    ).toBe(false);
  });

  it("rejects browser-supplied price manipulation fields", () => {
    expect(
      orderRequestSchema.safeParse({
        ...validRequest,
        pricePerPiece: 1,
        totalPrice: 1,
      }).success,
    ).toBe(false);
  });
});
