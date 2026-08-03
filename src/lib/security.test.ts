import { describe, expect, it } from "vitest";

import { escapeHtml } from "@/lib/html";
import { createOrderId } from "@/lib/order-id";

describe("email HTML escaping", () => {
  it("neutralises customer-controlled markup", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)"> & test')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; test",
    );
  });
});

describe("stable order IDs", () => {
  it("creates the same order ID for retries", () => {
    const requestId = "c6629902-aa3b-4c20-bf68-6b4c761ee529";
    expect(createOrderId(requestId)).toBe(createOrderId(requestId));
    expect(createOrderId(requestId)).toMatch(/^MT-[A-F0-9]{24}$/);
  });

  it("creates different IDs for different requests", () => {
    expect(createOrderId("c6629902-aa3b-4c20-bf68-6b4c761ee529")).not.toBe(
      createOrderId("e55a532b-dcb2-4ac0-8b7d-4b713ea89a89"),
    );
  });
});
