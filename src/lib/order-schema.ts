import { z } from "zod";

import { PRODUCT } from "@/lib/product";

const trimmedString = (minimum: number, maximum: number, message: string) =>
  z.string().trim().min(minimum, message).max(maximum, message);

export const orderRequestSchema = z
  .object({
    requestId: z.string().uuid("Please refresh the page and try again."),
    productId: z.literal(PRODUCT.id),
    fullName: trimmedString(2, 100, "Please enter your full name."),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a valid phone number.")
      .max(20, "Please enter a valid phone number.")
      .regex(
        /^[+0-9][0-9()\-\s]{6,19}$/,
        "Please enter a valid phone number.",
      )
      .refine((value) => {
        const digitCount = value.replace(/\D/g, "").length;
        return digitCount >= 7 && digitCount <= 15;
      }, "Please enter a valid phone number."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254, "Please enter a valid email address."),
    exactLocation: trimmedString(
      5,
      300,
      "Kindly share your exact location.",
    ),
    deliveryZone: z.enum(["kathmandu_valley", "outside_valley"], {
      error: "Please choose your delivery area.",
    }),
    quantity: z
      .number()
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1.")
      .max(
        PRODUCT.maximumQuantity,
        `Quantity cannot exceed ${PRODUCT.maximumQuantity}.`,
      ),
  })
  .strict();

export type OrderRequest = z.infer<typeof orderRequestSchema>;
