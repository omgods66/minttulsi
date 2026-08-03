import { Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  light?: boolean;
  compact?: boolean;
};

export function Brand({ light = false, compact = false }: BrandProps) {
  if (!light) {
    return (
      <Link
        href="/"
        aria-label="Mint Tulsi home"
        className={`relative block h-12 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c99b4a] ${
          compact ? "w-[148px] sm:w-[188px]" : "w-[172px] sm:w-[205px]"
        }`}
      >
        <Image
          src="/mint-tulsi-logo.png"
          alt=""
          fill
          priority
          sizes="205px"
          className="object-contain object-left"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Mint Tulsi home"
      className="inline-flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c99b4a]"
    >
      <span
        className="grid size-10 place-items-center rounded-full bg-white/12 text-[#d9ebd7]"
      >
        <Leaf aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </span>
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>
        <span
          className="block font-serif text-xl font-semibold leading-none tracking-[-0.02em] text-white"
        >
          Mint Tulsi
        </span>
        <span
          className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#b9d6bf]"
        >
          Freshly nurtured
        </span>
      </span>
    </Link>
  );
}
