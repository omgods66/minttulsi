import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout | Mint Tulsi",
  description: "Complete your Mint Tulsi Cash on Delivery order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f2f5ee] text-sm font-bold text-[#4f6a57]">
          Preparing your secure checkout…
        </main>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
