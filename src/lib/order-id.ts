import { createHash } from "node:crypto";

export function createOrderId(requestId: string): string {
  const digest = createHash("sha256")
    .update(requestId)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();

  return `MT-${digest}`;
}
