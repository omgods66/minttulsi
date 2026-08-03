import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductLanding } from "@/components/product-landing";
import { PRODUCT } from "@/lib/product";

export const metadata: Metadata = {
  title: "Mint Tulsi | Fresh Holy Basil Delivered Across Nepal",
  description:
    "Order a healthy Mint Tulsi plant for Rs 49 with Cash on Delivery. Buy 3 and get 1 free. Free delivery inside Kathmandu Valley.",
};

export default function Home() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: PRODUCT.name,
    description:
      "A refreshing Holy Basil plant with a pleasant mint-like aroma, suitable for pots, balconies, gardens, and bright indoor spaces.",
    image: [
      "/images/mint-tulsi-1.webp",
      "/images/mint-tulsi-2.webp",
      "/images/mint-tulsi-3.webp",
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: PRODUCT.unitPrice,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Suspense
        fallback={
          <main className="grid min-h-screen place-items-center bg-[#fbf8f0] text-sm font-bold text-[#4f6a57]">
            Preparing Mint Tulsi…
          </main>
        }
      >
        <ProductLanding />
      </Suspense>
    </>
  );
}
