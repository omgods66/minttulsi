import type { DeliveryZone } from "@/lib/product";

export type OrderRecord = {
  orderId: string;
  dateTime: string;
  customerName: string;
  phone: string;
  email: string;
  exactLocation: string;
  productId: "mint-tulsi";
  productName: string;
  paidQuantity: number;
  freeQuantity: number;
  totalPlants: number;
  pricePerPiece: number;
  subtotal: number;
  deliveryZone: DeliveryZone;
  deliveryZoneLabel: string;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  notes: string;
};

export type OrderSuccessSummary = Pick<
  OrderRecord,
  | "orderId"
  | "dateTime"
  | "productName"
  | "paidQuantity"
  | "freeQuantity"
  | "totalPlants"
  | "pricePerPiece"
  | "subtotal"
  | "deliveryZoneLabel"
  | "deliveryFee"
  | "totalPrice"
  | "paymentMethod"
>;

export type EmailDeliveryStatus = "Pending" | "Sent" | "Failed";
