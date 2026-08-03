export const PRODUCT = {
  id: "mint-tulsi",
  name: "Mint Tulsi",
  fullName: "Mint Tulsi (Holy Basil)",
  currency: "NPR",
  regularPrice: 55,
  unitPrice: 49,
  maximumQuantity: 99,
  offerThreshold: 3,
  deliveryZones: {
    kathmandu_valley: {
      label: "Inside Kathmandu Valley",
      shortLabel: "Kathmandu Valley",
      fee: 0,
      feeLabel: "Free delivery",
    },
    outside_valley: {
      label: "Outside Kathmandu Valley",
      shortLabel: "Outside Valley",
      fee: 80,
      feeLabel: "Rs 80 delivery",
    },
  },
} as const;

export const STORE = {
  name: "Mint Tulsi",
  supportPhone: "9865777419",
  deliveryPromise: "Delivery within 24 hours",
} as const;

export type DeliveryZone = keyof typeof PRODUCT.deliveryZones;

export type PricingSummary = {
  paidQuantity: number;
  freeQuantity: number;
  totalPlants: number;
  pricePerPiece: number;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  deliveryZone: DeliveryZone;
  deliveryZoneLabel: string;
};

export function calculateOrder(
  quantity: number,
  deliveryZone: DeliveryZone,
): PricingSummary {
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > PRODUCT.maximumQuantity
  ) {
    throw new RangeError(
      `Quantity must be a whole number between 1 and ${PRODUCT.maximumQuantity}.`,
    );
  }

  const zone = PRODUCT.deliveryZones[deliveryZone];

  if (!zone) {
    throw new RangeError("A valid delivery zone is required.");
  }

  const freeQuantity = quantity >= PRODUCT.offerThreshold ? 1 : 0;
  const subtotal = quantity * PRODUCT.unitPrice;

  return {
    paidQuantity: quantity,
    freeQuantity,
    totalPlants: quantity + freeQuantity,
    pricePerPiece: PRODUCT.unitPrice,
    subtotal,
    deliveryFee: zone.fee,
    totalPrice: subtotal + zone.fee,
    deliveryZone,
    deliveryZoneLabel: zone.label,
  };
}

export function formatNpr(amount: number): string {
  return `Rs ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function normaliseQuantity(value: string | null): number {
  const quantity = Number(value ?? 1);

  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > PRODUCT.maximumQuantity
  ) {
    return 1;
  }

  return quantity;
}
