import type { Metadata } from "next";

import { ThankYouContent } from "@/components/thank-you-content";

export const metadata: Metadata = {
  title: "Thank You for Your Order | Mint Tulsi",
  description: "Your Mint Tulsi order has been received.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYouContent />;
}
