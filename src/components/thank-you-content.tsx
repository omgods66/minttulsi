"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  Gift,
  Home,
  Leaf,
  MailCheck,
  PackageCheck,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Brand } from "@/components/brand";
import { formatNpr, STORE } from "@/lib/product";
import type { OrderSuccessSummary } from "@/types/order";

function isOrderSummary(value: unknown): value is OrderSuccessSummary {
  if (!value || typeof value !== "object") return false;

  const order = value as Partial<OrderSuccessSummary>;
  return (
    typeof order.orderId === "string" &&
    typeof order.productName === "string" &&
    typeof order.dateTime === "string" &&
    typeof order.paidQuantity === "number" &&
    typeof order.freeQuantity === "number" &&
    typeof order.totalPlants === "number" &&
    typeof order.pricePerPiece === "number" &&
    typeof order.subtotal === "number" &&
    typeof order.deliveryZoneLabel === "string" &&
    typeof order.deliveryFee === "number" &&
    typeof order.totalPrice === "number" &&
    Number.isFinite(order.subtotal) &&
    Number.isFinite(order.deliveryFee) &&
    Number.isFinite(order.totalPrice) &&
    order.paymentMethod === "Cash On Delivery"
  );
}

export function ThankYouContent() {
  const storedOrder = useSyncExternalStore(
    subscribeToOrderStorage,
    readStoredOrder,
    () => undefined,
  );
  let order: OrderSuccessSummary | null | undefined;

  try {
    const parsed: unknown = storedOrder ? JSON.parse(storedOrder) : null;
    if (storedOrder === undefined) order = undefined;
    else order = isOrderSummary(parsed) ? parsed : null;
  } catch {
    order = null;
  }

  if (order === undefined) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#edf3e9] text-[#173f2b]">
        <div className="text-center">
          <span className="mx-auto grid size-12 animate-pulse place-items-center rounded-full bg-[#173f2b] text-white">
            <Leaf aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-4 text-sm font-bold text-[#5f7465]">
            Preparing your order confirmation…
          </p>
        </div>
      </main>
    );
  }

  if (order === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#edf3e9] px-5 text-center text-[#173f2b]">
        <div className="max-w-md rounded-[2rem] border border-[#173f2b]/8 bg-white p-8 shadow-[0_24px_70px_rgba(23,63,43,.08)]">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e2ecde] text-[#3e6b4d]">
            <PackageCheck aria-hidden="true" className="size-6" />
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold">
            No recent order found
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#68786c]">
            Order details are shown here immediately after a successful
            checkout.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173f2b] px-6 text-sm font-extrabold text-white"
          >
            <Home aria-hidden="true" className="size-4" />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#edf3e9] text-[#173f2b]">
      <header className="border-b border-[#173f2b]/8 bg-[#fbf8f0]">
        <div className="mx-auto flex h-[78px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <span className="hidden items-center gap-2 text-xs font-bold text-[#617064] sm:flex">
            <ShieldCheck aria-hidden="true" className="size-4 text-[#4f7d4d]" />
            Cash on Delivery order
          </span>
        </div>
      </header>

      <div className="relative overflow-hidden px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -left-32 top-12 size-96 rounded-full border border-[#173f2b]/7" />
        <div className="pointer-events-none absolute -right-24 top-72 size-72 rounded-full border border-[#173f2b]/7" />
        <div className="relative mx-auto max-w-4xl">
          <section className="text-center">
            <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-[#173f2b] text-white shadow-[0_14px_35px_rgba(23,63,43,.22)]">
              <Check aria-hidden="true" className="size-9" strokeWidth={2.3} />
              <span className="absolute -right-1 -top-1 size-5 rounded-full bg-[#c99b4a] ring-4 ring-[#edf3e9]" />
            </div>
            <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.2em] text-[#4f7d4d]">
              Order received successfully
            </p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-[.96] tracking-[-0.05em] sm:text-7xl">
              Thank you for your order!
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#617064] sm:text-lg">
              Your Mint Tulsi is one step closer to home. We&apos;ve sent an
              order confirmation to your email.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#4f7d4d]/15 bg-white/65 px-4 py-2 text-xs font-extrabold text-[#365a45]">
              Order ID
              <span className="text-[#173f2b]">{order.orderId}</span>
            </div>
          </section>

          <section className="mt-10 overflow-hidden rounded-[2rem] border border-[#173f2b]/8 bg-white shadow-[0_25px_80px_rgba(23,63,43,.08)] sm:mt-12">
            <div className="grid md:grid-cols-[.78fr_1.22fr]">
              <div className="relative min-h-72 bg-[#dbe7d7] md:min-h-full">
                <Image
                  src="/images/mint-tulsi-1.webp"
                  alt="Mint Tulsi plant ordered"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173f2b]/45 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-extrabold text-[#245037] backdrop-blur">
                  <BadgeCheck aria-hidden="true" className="size-4" />
                  Order received
                </span>
              </div>

              <div className="p-6 sm:p-9">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#718075]">
                      Product ordered
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold">
                      {order.productName}
                    </h2>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e7f0e3] text-[#3b6a4b]">
                    <Leaf aria-hidden="true" className="size-5" />
                  </span>
                </div>

                {order.freeQuantity > 0 ? (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#eef5e9] p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c99b4a] text-[#2c240f]">
                      <Gift aria-hidden="true" className="size-4" />
                    </span>
                    <p className="text-sm font-extrabold text-[#315b40]">
                      {order.freeQuantity} free{" "}
                      {order.freeQuantity === 1 ? "plant" : "plants"} included
                      with your order
                    </p>
                  </div>
                ) : null}

                <dl className="mt-6 space-y-3 text-sm">
                  <DetailRow
                    label="Plants purchased"
                    value={String(order.paidQuantity)}
                  />
                  <DetailRow
                    label="Free plants"
                    value={String(order.freeQuantity)}
                    green
                  />
                  <DetailRow
                    label="Total plants"
                    value={String(order.totalPlants)}
                  />
                  <DetailRow
                    label="Product subtotal"
                    value={formatNpr(order.subtotal)}
                  />
                  <DetailRow
                    label="Delivery fee"
                    value={
                      order.deliveryFee === 0
                        ? "Free"
                        : formatNpr(order.deliveryFee)
                    }
                    green={order.deliveryFee === 0}
                  />
                  <DetailRow
                    label="Delivery area"
                    value={order.deliveryZoneLabel}
                  />
                </dl>

                <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#173f2b]/10 pt-5">
                  <div>
                    <p className="font-extrabold">Total price</p>
                    <p className="mt-1 text-xs text-[#718075]">
                      Payment method: Cash On Delivery
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold tracking-[-0.04em]">
                    {formatNpr(order.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: MailCheck,
                title: "Email sent",
                text: "Your order details are in your inbox.",
              },
              {
                icon: PhoneCall,
                title: "We'll call soon",
                text: "Our sales representative will confirm your order.",
              },
              {
                icon: PackageCheck,
                title: "24-hour delivery",
                text: "Your plant will be carefully packed for delivery.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-[#173f2b]/8 bg-white/70 p-5 text-center"
              >
                <Icon
                  aria-hidden="true"
                  className="mx-auto size-5 text-[#4f7d4d]"
                />
                <h3 className="mt-3 text-sm font-extrabold">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#718075]">
                  {text}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-[1.75rem] bg-[#173f2b] px-6 py-7 text-center text-white sm:px-10 sm:py-8">
            <p className="font-serif text-2xl font-semibold sm:text-3xl">
              Our sales representative will call you soon to confirm your order.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#b6c9bc]">
              Please keep your phone available. No payment is needed until
              delivery.
            </p>
            <a
              href={`tel:${STORE.supportPhone}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#d8ead7] underline decoration-white/25 underline-offset-4 hover:text-white"
            >
              <PhoneCall aria-hidden="true" className="size-4" />
              Need help? Call {STORE.supportPhone}
            </a>
          </section>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#f6efe1] px-8 text-sm font-extrabold text-[#173f2b] shadow-[0_10px_30px_rgba(23,63,43,.08)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
            >
              <Home aria-hidden="true" className="size-4" />
              Back to Home
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function subscribeToOrderStorage() {
  return () => undefined;
}

function readStoredOrder() {
  return sessionStorage.getItem("mint-tulsi-order");
}

function DetailRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between gap-5 border-b border-[#173f2b]/7 pb-3 last:border-0 last:pb-0">
      <dt className="text-[#718075]">{label}</dt>
      <dd
        className={`text-right font-extrabold ${
          green ? "text-[#3e744e]" : "text-[#173f2b]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
