"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Gift,
  Headphones,
  Heart,
  Leaf,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  Sun,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { Brand } from "@/components/brand";
import {
  calculateOrder,
  formatNpr,
  normaliseQuantity,
  PRODUCT,
  STORE,
} from "@/lib/product";

const productImages = [
  {
    src: "/images/mint-tulsi-1.webp",
    alt: "A healthy Mint Tulsi plant with vibrant green leaves",
  },
  {
    src: "/images/mint-tulsi-2.webp",
    alt: "Mint Tulsi product packaging made in Nepal",
  },
  {
    src: "/images/mint-tulsi-3.webp",
    alt: "Fresh Mint Tulsi leaves growing in natural light",
  },
  {
    src: "/images/mint-tulsi-4.webp",
    alt: "Fresh mint leaves held above a green herb garden",
    credit: "Source image supplied with Freepik watermark",
  },
];

const benefits = [
  {
    icon: Leaf,
    title: "Fresh mint-like aroma",
    description: "A naturally refreshing fragrance for your everyday space.",
  },
  {
    icon: Coffee,
    title: "Fresh leaves for tea",
    description: "Pick leaves at home for a soothing herbal drink.",
  },
  {
    icon: Sprout,
    title: "Easy for beginners",
    description: "Simple care, regular sunlight, and no expert skills needed.",
  },
  {
    icon: Heart,
    title: "A living home accent",
    description: "Bring vibrant, natural greenery to balconies and rooms.",
  },
  {
    icon: Sun,
    title: "Made for sunny spaces",
    description: "Grows happily with four to six hours of daily sunlight.",
  },
  {
    icon: Gift,
    title: "A thoughtful green gift",
    description: "A fresh and meaningful present for friends and family.",
  },
];

const testimonials = [
  {
    name: "Sita Sharma",
    location: "Kathmandu",
    quote:
      "I bought the Mint Tulsi for my balcony, and it has grown beautifully. The fresh mint-like fragrance is amazing, and I enjoy making herbal tea with the leaves. I'm very happy with my purchase.",
    initials: "SS",
  },
  {
    name: "Ram Bahadur Thapa",
    location: "Pokhara",
    quote:
      "The plant arrived healthy and was easy to grow. I was surprised by how fresh and vibrant it looked. I highly recommend Mint Tulsi to anyone who loves keeping plants at home.",
    initials: "RT",
  },
  {
    name: "Anisha Gurung",
    location: "Chitwan",
    quote:
      "I wanted a low-maintenance plant for my home, and Mint Tulsi was the perfect choice. It looks beautiful, smells refreshing, and everyone in my family loves it. Great quality and fast delivery!",
    initials: "AG",
  },
];

const faqs = [
  {
    question: "What is Mint Tulsi?",
    answer:
      "Mint Tulsi is a refreshing variety of Holy Basil with a pleasant mint-like aroma. It is easy to grow and is popular for herbal tea, home gardening, and its fresh fragrance.",
  },
  {
    question: "How do I take care of my Mint Tulsi plant?",
    answer:
      "Place it where it receives four to six hours of sunlight, water when the topsoil begins to feel dry, and make sure its pot drains well. Avoid leaving the roots in standing water.",
  },
  {
    question: "Can I grow Mint Tulsi indoors?",
    answer:
      "Yes. Keep it close to a bright window or sunny balcony where it can receive enough natural sunlight and airflow.",
  },
  {
    question: "Can I use the leaves for tea?",
    answer:
      "Yes. Fresh Mint Tulsi leaves can be rinsed and infused in warm water for a naturally refreshing herbal drink.",
  },
  {
    question: "Will I receive a healthy plant?",
    answer:
      "We carefully select and pack healthy, well-grown plants so they are protected during delivery and ready to settle into their new home.",
  },
  {
    question: "Do you deliver all over Nepal?",
    answer:
      "Delivery is free inside Kathmandu Valley. A flat Rs 80 delivery fee applies outside Kathmandu Valley. Orders are delivered within 24 hours in our active service areas.",
  },
  {
    question: "What if my plant is damaged during delivery?",
    answer:
      "Contact our team as soon as possible and share clear photos of the plant and packaging. We will review the issue and help with a suitable solution.",
  },
];

const trustItems = [
  { icon: ShieldCheck, label: "Cash on Delivery" },
  { icon: PackageCheck, label: "Carefully packed" },
  { icon: Truck, label: STORE.deliveryPromise },
  { icon: Headphones, label: `Support: ${STORE.supportPhone}` },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#4f7d4d]">
      <span className="h-px w-7 bg-[#c99b4a]" aria-hidden="true" />
      {children}
    </p>
  );
}

function SparkleMark() {
  return (
    <span className="relative inline-block size-3" aria-hidden="true">
      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-[#c99b4a]" />
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-[#c99b4a]" />
    </span>
  );
}

export function ProductLanding() {
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(() =>
    normaliseQuantity(searchParams.get("quantity")),
  );
  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const pricing = useMemo(
    () => calculateOrder(quantity, "kathmandu_valley"),
    [quantity],
  );
  const checkoutHref = `/checkout?product=${encodeURIComponent(
    PRODUCT.id,
  )}&productName=${encodeURIComponent(PRODUCT.name)}&quantity=${quantity}&price=${PRODUCT.unitPrice}&total=${pricing.subtotal}`;
  const quantityUntilNextFree =
    PRODUCT.offerThreshold - (quantity % PRODUCT.offerThreshold);

  function changeQuantity(nextQuantity: number) {
    setQuantity(Math.min(PRODUCT.maximumQuantity, Math.max(1, nextQuantity)));
  }

  function showPreviousImage() {
    setActiveImage((current) =>
      current === 0 ? productImages.length - 1 : current - 1,
    );
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % productImages.length);
  }

  function finishSwipe(clientX: number) {
    if (touchStartX.current === null) return;

    const distance = clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 48) return;
    if (distance > 0) showPreviousImage();
    else showNextImage();
  }

  return (
    <main className="overflow-x-clip bg-[#fbf8f0] text-[#173f2b]">
      <div className="bg-[#173f2b] px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#e3f0df] sm:text-xs">
        Cash on Delivery across Nepal
        <span className="mx-2 text-[#85a987]">•</span>
        Delivery within 24 hours
      </div>

      <header className="relative z-30 border-b border-[#173f2b]/8 bg-[#fbf8f0]/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <nav
            className="hidden items-center gap-8 text-sm font-semibold text-[#365a45] md:flex"
            aria-label="Main navigation"
          >
            <a className="transition hover:text-[#173f2b]" href="#discover">
              Discover
            </a>
            <a className="transition hover:text-[#173f2b]" href="#benefits">
              Benefits
            </a>
            <a className="transition hover:text-[#173f2b]" href="#reviews">
              Reviews
            </a>
            <a className="transition hover:text-[#173f2b]" href="#faq">
              FAQs
            </a>
          </nav>
          <Link
            href={checkoutHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173f2b] px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(23,63,43,.18)] transition hover:-translate-y-0.5 hover:bg-[#23583b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
          >
            Order now
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </header>

      <section className="px-4 pb-14 pt-5 sm:px-8 sm:pb-20 sm:pt-8 lg:px-10">
        <div className="relative mx-auto grid min-h-[650px] max-w-7xl overflow-hidden rounded-[2rem] bg-[#e7efe1] lg:grid-cols-[1.04fr_.96fr] lg:rounded-[2.75rem]">
          <div className="pointer-events-none absolute -left-24 top-20 size-80 rounded-full border border-[#365a45]/10" />
          <div className="pointer-events-none absolute left-28 top-48 size-44 rounded-full border border-[#365a45]/10" />
          <div className="relative z-10 flex items-center px-6 py-14 sm:px-12 lg:px-16 lg:py-20 xl:px-20">
            <div className="max-w-[620px]">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#6e916e]/25 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#365a45]">
                <SparkleMark /> Freshly nurtured • Easy to grow
              </div>
              <h1 className="font-serif text-[clamp(3.2rem,7vw,6.6rem)] font-semibold leading-[.88] tracking-[-0.055em] text-[#173f2b]">
                Fresh greenery,
                <span className="block italic text-[#4f7d4d]">
                  naturally yours.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#53675a] sm:text-lg sm:leading-8">
                Bring home Mint Tulsi—a vibrant Holy Basil plant loved for its
                refreshing mint-like aroma, easy care, and fresh leaves for
                herbal tea.
              </p>
              <div className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#718075]">
                    Today&apos;s price
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold tracking-[-0.04em] text-[#173f2b]">
                      {formatNpr(PRODUCT.unitPrice)}
                    </span>
                    <span className="text-lg text-[#819087] line-through">
                      {formatNpr(PRODUCT.regularPrice)}
                    </span>
                  </div>
                </div>
                <span className="mb-1 rounded-full bg-[#c99b4a] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#2f250f]">
                  Buy 3, get 1 free
                </span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={checkoutHref}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#173f2b] px-7 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(23,63,43,.22)] transition hover:-translate-y-0.5 hover:bg-[#23583b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
                >
                  <ShoppingBag aria-hidden="true" className="size-4" />
                  Purchase now
                </Link>
                <a
                  href="#discover"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#173f2b]/20 bg-white/50 px-7 text-sm font-extrabold text-[#173f2b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
                >
                  Explore the plant
                </a>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm font-medium text-[#5c7062]">
                <Check
                  aria-hidden="true"
                  className="size-4 text-[#4f7d4d]"
                />
                No online payment required
              </p>
            </div>
          </div>

          <div className="relative min-h-[480px] overflow-hidden bg-[#cedfc8] lg:min-h-full">
            <Image
              src="/images/mint-tulsi-1.webp"
              alt="Healthy Mint Tulsi plant held in natural light"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#173f2b]/24 via-transparent to-white/8" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/25 bg-[#173f2b]/82 px-5 py-4 text-white shadow-xl backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#bdd9c2]">
                  Ready for your home
                </p>
                <p className="mt-1 font-serif text-xl font-semibold">
                  Healthy • Vibrant • Carefully nurtured
                </p>
              </div>
              <span className="hidden size-11 place-items-center rounded-full bg-white/12 sm:grid">
                <Leaf aria-hidden="true" className="size-5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Purchase assurances"
        className="border-y border-[#173f2b]/8 bg-white/60"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#173f2b]/8 px-4 sm:px-8 md:grid-cols-4 md:divide-y-0 lg:px-10">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-h-24 items-center justify-center gap-3 px-3 py-5 text-center text-sm font-bold text-[#365a45]"
            >
              <Icon
                aria-hidden="true"
                className="size-5 shrink-0 text-[#4f7d4d]"
                strokeWidth={1.7}
              />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section
        id="discover"
        className="scroll-mt-24 px-4 py-20 sm:px-8 sm:py-28 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <div
              className="relative touch-pan-y overflow-hidden rounded-[2rem] bg-[#e9eee5]"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                const clientX = event.changedTouches[0]?.clientX;
                if (clientX === undefined) touchStartX.current = null;
                else finishSwipe(clientX);
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeImage * 100}%)` }}
                aria-live="polite"
              >
                {productImages.map((image, index) => (
                  <figure
                    key={image.src}
                    className="relative aspect-[4/4.35] min-w-full"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                      priority={index === 0}
                    />
                    {image.credit ? (
                      <figcaption className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
                        {image.credit}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Show previous product image"
                className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/88 text-[#173f2b] shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99b4a]"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={showNextImage}
                aria-label="Show next product image"
                className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/88 text-[#173f2b] shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99b4a]"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
              <div className="absolute right-5 top-5 rounded-full bg-[#173f2b]/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                {activeImage + 1} / {productImages.length}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={image.src}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show product image ${index + 1}`}
                  aria-current={activeImage === index}
                  className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99b4a] ${
                    activeImage === index
                      ? "border-[#4f7d4d] opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 lg:pt-8">
            <SectionEyebrow>Grow something good</SectionEyebrow>
            <h2 className="max-w-xl font-serif text-5xl font-semibold leading-[.98] tracking-[-0.045em] text-[#173f2b] sm:text-6xl">
              Mint Tulsi{" "}
              <span className="italic text-[#4f7d4d]">
                for everyday freshness.
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#617064] sm:text-lg sm:leading-8">
              Perfect for pots, balconies, gardens, or a bright indoor corner.
              Mint Tulsi is easy to care for and brings refreshing fragrance,
              fresh leaves, and a living touch of green into your home.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Pleasant mint-like aroma",
                "Easy, beginner-friendly care",
                "Fresh leaves for herbal tea",
                "Suitable for pots and balconies",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm font-bold text-[#365a45]"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dfeadb] text-[#2f6847]">
                    <Check
                      aria-hidden="true"
                      className="size-3.5"
                      strokeWidth={2.5}
                    />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-9 rounded-[1.75rem] border border-[#173f2b]/10 bg-white p-5 shadow-[0_20px_60px_rgba(23,63,43,.08)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#173f2b]/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#718075]">
                    Special offer price
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold tracking-[-0.04em] text-[#173f2b]">
                      {formatNpr(PRODUCT.unitPrice)}
                    </span>
                    <span className="text-base text-[#819087] line-through">
                      {formatNpr(PRODUCT.regularPrice)}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-[#fff0c9] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#735015]">
                  Save Rs 6 each
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <label
                    className="text-sm font-extrabold text-[#173f2b]"
                    htmlFor="product-quantity"
                  >
                    Plants to buy
                  </label>
                  <p className="mt-1 text-xs text-[#718075]">
                    Buy 3 plants and get 1 free
                  </p>
                </div>
                <div className="flex items-center rounded-full border border-[#173f2b]/15 bg-[#f7f9f4] p-1">
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity - 1)}
                    disabled={quantity === 1}
                    aria-label="Decrease quantity"
                    className="grid size-11 place-items-center rounded-full text-[#173f2b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[#c99b4a]"
                  >
                    <Minus aria-hidden="true" className="size-4" />
                  </button>
                  <output
                    id="product-quantity"
                    aria-live="polite"
                    className="min-w-11 text-center text-lg font-extrabold text-[#173f2b]"
                  >
                    {quantity}
                  </output>
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity + 1)}
                    disabled={quantity === PRODUCT.maximumQuantity}
                    aria-label="Increase quantity"
                    className="grid size-11 place-items-center rounded-full text-[#173f2b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[#c99b4a]"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>

              <div
                className="mt-5 rounded-2xl bg-[#edf4e8] p-4"
                aria-live="polite"
              >
                {pricing.freeQuantity > 0 ? (
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#4f7d4d] text-white">
                      <Gift aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[#244e37]">
                        You&apos;ve unlocked {pricing.freeQuantity} free{" "}
                        {pricing.freeQuantity === 1 ? "plant" : "plants"}!
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#5c7062]">
                        Pay for {pricing.paidQuantity} and receive{" "}
                        {pricing.totalPlants} plants in total.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dbe8d7] text-[#315d42]">
                      <Gift aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[#244e37]">
                        Add {quantityUntilNextFree} more to get 1 free
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#5c7062]">
                        Our Buy 3, Get 1 FREE offer is applied automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-[#617064]">
                  <dt>Plants purchased</dt>
                  <dd className="font-bold text-[#173f2b]">
                    {pricing.paidQuantity}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 text-[#617064]">
                  <dt>Free plants</dt>
                  <dd className="font-bold text-[#2f6847]">
                    {pricing.freeQuantity}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 text-[#617064]">
                  <dt>Product subtotal</dt>
                  <dd className="font-bold text-[#173f2b]">
                    {formatNpr(pricing.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-[#173f2b]/10 pt-4">
                  <dt className="font-extrabold text-[#173f2b]">
                    Total before delivery
                  </dt>
                  <dd className="text-xl font-extrabold text-[#173f2b]">
                    {formatNpr(pricing.subtotal)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-[#718075]">
                Delivery: free inside Kathmandu Valley; Rs 80 outside the
                Valley.
              </p>

              <Link
                href={checkoutHref}
                className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#173f2b] px-6 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(23,63,43,.2)] transition hover:-translate-y-0.5 hover:bg-[#23583b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
              >
                Buy now • {formatNpr(pricing.subtotal)}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#718075]">
                <BadgeCheck
                  aria-hidden="true"
                  className="size-4 text-[#4f7d4d]"
                />
                Pay only when your order arrives
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="scroll-mt-24 bg-[#173f2b] px-4 py-20 text-white sm:px-8 sm:py-28 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_.65fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a9c8aa]">
                <span className="h-px w-7 bg-[#c99b4a]" /> Why you&apos;ll
                love it
              </p>
              <h2 className="max-w-3xl font-serif text-5xl font-semibold leading-[.98] tracking-[-0.045em] sm:text-6xl">
                A small plant with a{" "}
                <span className="italic text-[#b6d2b2]">
                  beautiful daily presence.
                </span>
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#b9cbbf] lg:justify-self-end">
              From your morning tea to your balcony view, Mint Tulsi gives you
              a fresh, easy way to enjoy more nature at home.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="group min-h-56 bg-[#173f2b] p-7 transition hover:bg-[#1d4933] sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/8 text-[#c5ddc3] transition group-hover:bg-[#c99b4a] group-hover:text-[#2c240f]">
                    <Icon
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={1.7}
                    />
                  </span>
                  <span className="text-xs font-bold text-white/25">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-7 font-serif text-2xl font-semibold">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#aebfb4]">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={checkoutHref}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#f2ead8] px-7 text-sm font-extrabold text-[#173f2b] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
            >
              Order Mint Tulsi
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="reviews"
        className="scroll-mt-24 px-4 py-20 sm:px-8 sm:py-28 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>Loved in homes across Nepal</SectionEyebrow>
            <h2 className="font-serif text-5xl font-semibold leading-[.98] tracking-[-0.045em] text-[#173f2b] sm:text-6xl">
              Fresh stories from{" "}
              <span className="italic text-[#4f7d4d]">
                happy plant parents.
              </span>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex min-h-80 flex-col rounded-[1.75rem] border border-[#173f2b]/9 bg-white p-7 shadow-[0_18px_50px_rgba(23,63,43,.055)] sm:p-8"
              >
                <div
                  className="flex gap-1 text-[#c99b4a]"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      aria-hidden="true"
                      className="size-4 fill-current"
                    />
                  ))}
                </div>
                <blockquote className="mt-6 flex-1 font-serif text-[1.35rem] leading-8 text-[#294c38]">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-[#173f2b]/8 pt-5">
                  <span className="grid size-11 place-items-center rounded-full bg-[#dfeadb] text-xs font-extrabold text-[#315d42]">
                    {testimonial.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-[#173f2b]">
                      {testimonial.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#718075]">
                      {testimonial.location}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-24 bg-[#edf2e8] px-4 py-20 sm:px-8 sm:py-28 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <SectionEyebrow>Good to know</SectionEyebrow>
            <h2 className="font-serif text-5xl font-semibold leading-[.98] tracking-[-0.045em] text-[#173f2b] sm:text-6xl">
              Your questions,{" "}
              <span className="italic text-[#4f7d4d]">answered.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#617064]">
              Everything you need to know before welcoming Mint Tulsi into your
              home.
            </p>
            <Link
              href={checkoutHref}
              className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#173f2b] px-6 text-sm font-extrabold text-white transition hover:bg-[#23583b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
            >
              Purchase now
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="divide-y divide-[#173f2b]/10 border-y border-[#173f2b]/10">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group"
                open={index === 0}
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base font-extrabold text-[#173f2b] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99b4a] sm:text-lg">
                  <span>{faq.question}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#173f2b]/15 transition group-open:rotate-45 group-open:bg-[#173f2b] group-open:text-white">
                    <Plus aria-hidden="true" className="size-4" />
                  </span>
                </summary>
                <div className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-[#617064] sm:text-base">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#dfe9d9] px-6 py-14 text-center sm:px-12 sm:py-20 lg:rounded-[2.75rem]">
          <div className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full border border-[#173f2b]/10" />
          <div className="pointer-events-none absolute -bottom-44 -right-20 size-96 rounded-full border border-[#173f2b]/10" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#173f2b] text-white">
              <Leaf aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-6 font-serif text-5xl font-semibold leading-[.96] tracking-[-0.05em] text-[#173f2b] sm:text-7xl">
              Bring home a little more{" "}
              <span className="italic text-[#4f7d4d]">freshness.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#596c5e] sm:text-lg">
              Order Mint Tulsi today for {formatNpr(PRODUCT.unitPrice)} per
              plant. Buy 3 and receive 1 extra plant free.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={checkoutHref}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#173f2b] px-8 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(23,63,43,.2)] transition hover:-translate-y-0.5 hover:bg-[#23583b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
              >
                Order now
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={checkoutHref}
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#173f2b]/18 bg-white/55 px-8 text-sm font-extrabold text-[#173f2b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
              >
                Buy now • COD
              </Link>
            </div>
            <p className="mt-5 text-xs font-semibold text-[#657668]">
              Delivery within 24 hours • Cash on Delivery • Confirmation call
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#102d20] px-4 py-10 text-[#a9bbae] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <Brand light />
          <p className="max-w-md text-xs leading-5">
            Mint Tulsi plants are living products; natural variation in size,
            shape, and colour is expected.
          </p>
          <a
            href={`tel:${STORE.supportPhone}`}
            className="text-xs font-bold text-[#d9e8da] transition hover:text-white"
          >
            Call {STORE.supportPhone}
          </a>
          <p className="text-xs">
            © {new Date().getFullYear()} Mint Tulsi
          </p>
        </div>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/20 bg-[#173f2b]/95 p-2.5 shadow-[0_18px_50px_rgba(23,63,43,.35)] backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 pl-2">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#b9d6bf]">
              Mint Tulsi • Qty {quantity}
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-white">
              {formatNpr(pricing.subtotal)}
            </p>
          </div>
          <Link
            href={checkoutHref}
            className="ml-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f2ead8] px-5 text-sm font-extrabold text-[#173f2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99b4a]"
          >
            Order now
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </main>
  );
}
