"use client";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  Gift,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

import { Brand } from "@/components/brand";
import {
  calculateOrder,
  type DeliveryZone,
  formatNpr,
  normaliseQuantity,
  PRODUCT,
  STORE,
} from "@/lib/product";
import type { OrderSuccessSummary } from "@/types/order";

type CustomerFields = {
  fullName: string;
  phone: string;
  email: string;
  exactLocation: string;
};

type FieldErrors = Partial<Record<keyof CustomerFields | "deliveryZone", string>>;

type ApiErrorResponse = {
  message?: string;
  orderRecorded?: boolean;
  orderId?: string;
  fieldErrors?: Record<string, string[]>;
};

const initialCustomerFields: CustomerFields = {
  fullName: "",
  phone: "",
  email: "",
  exactLocation: "",
};

const fieldClassName =
  "mt-2 min-h-13 w-full rounded-2xl border border-[#173f2b]/14 bg-[#fcfdfb] px-4 text-[15px] text-[#173f2b] outline-none transition placeholder:text-[#8a978d] focus:border-[#4f7d4d] focus:ring-4 focus:ring-[#4f7d4d]/10 disabled:cursor-not-allowed disabled:bg-[#f2f4ef]";

function firstServerError(errors: string[] | undefined) {
  return errors?.[0];
}

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const quantity = normaliseQuantity(searchParams.get("quantity"));
  const [customer, setCustomer] = useState(initialCustomerFields);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | "">("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedOrderId, setRecordedOrderId] = useState<string | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const basePricing = useMemo(
    () => calculateOrder(quantity, "kathmandu_valley"),
    [quantity],
  );
  const pricing = useMemo(
    () =>
      deliveryZone
        ? calculateOrder(quantity, deliveryZone)
        : basePricing,
    [basePricing, deliveryZone, quantity],
  );
  const fieldsLocked = Boolean(recordedOrderId);

  function updateCustomerField(field: keyof CustomerFields, value: string) {
    if (fieldsLocked) return;
    setCustomer((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function selectDeliveryZone(zone: DeliveryZone) {
    if (fieldsLocked) return;
    setDeliveryZone(zone);
    setFieldErrors((current) => ({ ...current, deliveryZone: undefined }));
  }

  function validateForm() {
    const errors: FieldErrors = {};

    if (customer.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name.";
    }

    const phone = customer.phone.trim();
    const phoneDigits = phone.replace(/\D/g, "").length;

    if (
      !/^[+0-9][0-9()\-\s]{6,19}$/.test(phone) ||
      phoneDigits < 7 ||
      phoneDigits > 15
    ) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (customer.exactLocation.trim().length < 5) {
      errors.exactLocation = "Kindly share your exact location.";
    }

    if (!deliveryZone) {
      errors.deliveryZone = "Please choose your delivery area.";
    }

    setFieldErrors(errors);
    const firstInvalidField = [
      "fullName",
      "phone",
      "email",
      "deliveryZone",
      "exactLocation",
    ].find((field) => field in errors);

    if (firstInvalidField) {
      requestAnimationFrame(() => {
        document.getElementById(firstInvalidField)?.focus();
      });
    }

    return Object.keys(errors).length === 0;
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !validateForm() || !deliveryZone) return;

    setIsSubmitting(true);
    setFormError(null);
    requestIdRef.current ??=
      sessionStorage.getItem("mint-tulsi-request-id") ?? crypto.randomUUID();
    sessionStorage.setItem("mint-tulsi-request-id", requestIdRef.current);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestIdRef.current,
          productId: PRODUCT.id,
          quantity,
          deliveryZone,
          ...customer,
        }),
      });
      const result = (await response.json()) as
        | { success: true; order: OrderSuccessSummary }
        | ({ success: false } & ApiErrorResponse);

      if (!response.ok || !result.success) {
        const errorResult = result as ApiErrorResponse;

        if (errorResult.fieldErrors) {
          setFieldErrors({
            fullName: firstServerError(errorResult.fieldErrors.fullName),
            phone: firstServerError(errorResult.fieldErrors.phone),
            email: firstServerError(errorResult.fieldErrors.email),
            exactLocation: firstServerError(
              errorResult.fieldErrors.exactLocation,
            ),
            deliveryZone: firstServerError(
              errorResult.fieldErrors.deliveryZone,
            ),
          });
        }

        if (errorResult.orderRecorded) {
          setRecordedOrderId(errorResult.orderId ?? "recorded");
        } else if (response.status === 409) {
          requestIdRef.current = null;
          sessionStorage.removeItem("mint-tulsi-request-id");
        }

        setFormError(
          errorResult.message ??
            "We could not complete your order. Please try again.",
        );
        return;
      }

      sessionStorage.setItem(
        "mint-tulsi-order",
        JSON.stringify(result.order),
      );
      sessionStorage.removeItem("mint-tulsi-request-id");
      window.location.assign("/thank-you");
    } catch {
      setFormError(
        "We could not reach the order service. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2f5ee] text-[#173f2b]">
      <header className="border-b border-[#173f2b]/8 bg-[#fbf8f0]">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <div className="hidden items-center gap-2 text-xs font-bold text-[#617064] sm:flex">
            <Phone aria-hidden="true" className="size-4 text-[#4f7d4d]" />
            Need help? {STORE.supportPhone}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <Link
          href={`/?quantity=${quantity}#discover`}
          className="mb-7 inline-flex items-center gap-2 rounded-full text-sm font-bold text-[#4f6a57] transition hover:text-[#173f2b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to product
        </Link>

        <div className="mb-9 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#4f7d4d]">
            Complete your order
          </p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-[.96] tracking-[-0.045em] sm:text-6xl">
            Almost there.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#617064]">
            Share your delivery details below. No online payment is required—we
            will call you to confirm your order.
          </p>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[1.08fr_.92fr] lg:gap-10">
          <form
            onSubmit={submitOrder}
            noValidate
            className="rounded-[2rem] border border-[#173f2b]/8 bg-white p-5 shadow-[0_22px_70px_rgba(23,63,43,.07)] sm:p-8 lg:p-10"
          >
            <div className="flex items-start justify-between gap-5 border-b border-[#173f2b]/9 pb-6">
              <div>
                <h2 className="font-serif text-3xl font-semibold">
                  Delivery details
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#718075]">
                  Please use information we can reach you with.
                </p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e5eee1] text-[#356347]">
                <Truck aria-hidden="true" className="size-5" />
              </span>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field
                id="fullName"
                label="Full Name"
                icon={User}
                error={fieldErrors.fullName}
              >
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  required
                  aria-required="true"
                  value={customer.fullName}
                  onChange={(event) =>
                    updateCustomerField("fullName", event.target.value)
                  }
                  disabled={fieldsLocked}
                  placeholder="Your full name"
                  className={fieldClassName}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName ? "fullName-error" : undefined
                  }
                />
              </Field>

              <Field
                id="phone"
                label="Phone Number"
                icon={Phone}
                error={fieldErrors.phone}
              >
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  value={customer.phone}
                  onChange={(event) =>
                    updateCustomerField("phone", event.target.value)
                  }
                  disabled={fieldsLocked}
                  placeholder="98XXXXXXXX"
                  className={fieldClassName}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  error={fieldErrors.email}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    value={customer.email}
                    onChange={(event) =>
                      updateCustomerField("email", event.target.value)
                    }
                    disabled={fieldsLocked}
                    placeholder="you@example.com"
                    className={fieldClassName}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  />
                </Field>
              </div>

              <fieldset
                id="deliveryZone"
                tabIndex={-1}
                aria-required="true"
                aria-describedby={
                  fieldErrors.deliveryZone ? "deliveryZone-error" : undefined
                }
                className="sm:col-span-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c99b4a]"
              >
                <legend className="text-sm font-extrabold text-[#294c38]">
                  Delivery Area
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(
                    Object.entries(PRODUCT.deliveryZones) as [
                      DeliveryZone,
                      (typeof PRODUCT.deliveryZones)[DeliveryZone],
                    ][]
                  ).map(([zone, details]) => (
                    <label
                      key={zone}
                      className={`relative flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                        deliveryZone === zone
                          ? "border-[#4f7d4d] bg-[#eef5e9] shadow-[0_0_0_3px_rgba(79,125,77,.09)]"
                          : "border-[#173f2b]/12 bg-[#fcfdfb] hover:border-[#4f7d4d]/45"
                      } ${fieldsLocked ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      <input
                        type="radio"
                        name="deliveryZone"
                        required
                        value={zone}
                        checked={deliveryZone === zone}
                        disabled={fieldsLocked}
                        onChange={() => selectDeliveryZone(zone)}
                        className="size-4 accent-[#356347]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold text-[#173f2b]">
                          {details.label}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-[#5f7465]">
                          {details.feeLabel}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {fieldErrors.deliveryZone ? (
                  <p
                    id="deliveryZone-error"
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#a43e35]"
                  >
                    <AlertCircle aria-hidden="true" className="size-3.5" />
                    {fieldErrors.deliveryZone}
                  </p>
                ) : null}
              </fieldset>

              <div className="sm:col-span-2">
                <Field
                  id="exactLocation"
                  label="Exact Location"
                  icon={MapPin}
                  error={fieldErrors.exactLocation}
                >
                  <textarea
                    id="exactLocation"
                    name="exactLocation"
                    rows={4}
                    autoComplete="street-address"
                    required
                    aria-required="true"
                    value={customer.exactLocation}
                    onChange={(event) =>
                      updateCustomerField("exactLocation", event.target.value)
                    }
                    disabled={fieldsLocked}
                    placeholder="Kindly share your exact location"
                    className={`${fieldClassName} resize-y py-3.5`}
                    aria-invalid={Boolean(fieldErrors.exactLocation)}
                    aria-describedby={
                      fieldErrors.exactLocation
                        ? "exactLocation-error"
                        : undefined
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="mt-8 border-t border-[#173f2b]/9 pt-7">
              <h2 className="font-serif text-2xl font-semibold">
                Product information
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#718075]">
                These values are filled automatically from your selection.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="Product Name" value={PRODUCT.name} />
                <ReadOnlyField
                  label="Quantity"
                  value={`${quantity} purchased${pricing.freeQuantity ? ` + ${pricing.freeQuantity} free` : ""}`}
                />
                <ReadOnlyField
                  label="Price Per Piece"
                  value={formatNpr(PRODUCT.unitPrice)}
                />
                <ReadOnlyField
                  label="Total Price"
                  value={
                    deliveryZone
                      ? formatNpr(pricing.totalPrice)
                      : "Select delivery area"
                  }
                />
              </div>
            </div>

            {formError ? (
              <div
                className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                  recordedOrderId
                    ? "border-[#c99b4a]/35 bg-[#fff8e8] text-[#6a4c17]"
                    : "border-[#bd554b]/25 bg-[#fff3f1] text-[#8d342c]"
                }`}
                role="alert"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0"
                  />
                  <div>
                    <p className="font-extrabold">
                      {recordedOrderId
                        ? "Your order is safely recorded"
                        : "We couldn't submit your order"}
                    </p>
                    <p className="mt-1">{formError}</p>
                    {recordedOrderId ? (
                      <p className="mt-1 text-xs font-semibold">
                        Keep this page open and use the same button to retry the
                        missing notification without creating a duplicate order.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !deliveryZone}
              className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#173f2b] px-6 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(23,63,43,.18)] transition hover:-translate-y-0.5 hover:bg-[#23583b] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c99b4a]"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  Submitting Order...
                </>
              ) : recordedOrderId ? (
                "Retry email confirmation"
              ) : deliveryZone ? (
                `Order Now • ${formatNpr(pricing.totalPrice)}`
              ) : (
                "Choose delivery area to order"
              )}
            </button>

            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-[#718075]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                No online payment
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone aria-hidden="true" className="size-3.5" />
                Delivery within 24 hours
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole aria-hidden="true" className="size-3.5" />
                Private details
              </span>
            </div>
          </form>

          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[2rem] border border-[#173f2b]/8 bg-[#173f2b] text-white shadow-[0_24px_70px_rgba(23,63,43,.17)]">
              <div className="relative h-52 sm:h-64 lg:h-56">
                <Image
                  src="/images/mint-tulsi-1.webp"
                  alt="Healthy Mint Tulsi plant"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173f2b] via-transparent to-transparent" />
                <span className="absolute right-5 top-5 rounded-full bg-[#fff0c9] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#694913]">
                  Buy 3, get 1 free
                </span>
              </div>
              <div className="px-6 pb-7 sm:px-8 sm:pb-8">
                <div className="-mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a9c8aa]">
                      Your order
                    </p>
                    <h2 className="mt-1 font-serif text-3xl font-semibold">
                      {PRODUCT.name}
                    </h2>
                  </div>
                  <p className="text-2xl font-extrabold">
                    {formatNpr(PRODUCT.unitPrice)}
                  </p>
                </div>

                {pricing.freeQuantity > 0 ? (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/8 p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c99b4a] text-[#2c240f]">
                      <Gift aria-hidden="true" className="size-4" />
                    </span>
                    <p className="text-sm font-bold text-[#e8f2e6]">
                      {pricing.freeQuantity} free{" "}
                      {pricing.freeQuantity === 1 ? "plant" : "plants"} added
                      automatically
                    </p>
                  </div>
                ) : null}

                <dl className="mt-6 space-y-3 text-sm">
                  <SummaryRow
                    label="Plants purchased"
                    value={String(pricing.paidQuantity)}
                  />
                  <SummaryRow
                    label="Free plants"
                    value={String(pricing.freeQuantity)}
                    green
                  />
                  <SummaryRow
                    label="Total plants received"
                    value={String(pricing.totalPlants)}
                  />
                  <SummaryRow
                    label="Product subtotal"
                    value={formatNpr(pricing.subtotal)}
                  />
                  <SummaryRow
                    label="Delivery"
                    value={
                      !deliveryZone
                        ? "Select area"
                        : pricing.deliveryFee === 0
                          ? "Free"
                          : formatNpr(pricing.deliveryFee)
                    }
                    green={deliveryZone === "kathmandu_valley"}
                  />
                </dl>
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/12 pt-5">
                  <div>
                    <p className="text-sm font-extrabold">Total amount due</p>
                    <p className="mt-1 text-xs text-[#a9bbae]">
                      Cash On Delivery
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold tracking-[-0.03em]">
                    {deliveryZone ? formatNpr(pricing.totalPrice) : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {[
                { icon: BadgeCheck, text: "COD available" },
                { icon: Truck, text: "24-hour delivery" },
                { icon: Check, text: "Email receipt" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="rounded-2xl border border-[#173f2b]/8 bg-white px-2 py-4 text-center"
                >
                  <Icon
                    aria-hidden="true"
                    className="mx-auto size-4 text-[#4f7d4d]"
                  />
                  <p className="mt-2 text-[10px] font-extrabold leading-4 text-[#4f6355]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: typeof User;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="flex items-center gap-2 text-sm font-extrabold text-[#294c38]"
        htmlFor={id}
      >
        <Icon aria-hidden="true" className="size-4 text-[#668069]" />
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#a43e35]"
        >
          <AlertCircle aria-hidden="true" className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#718075]">
        {label}
      </span>
      <input
        readOnly
        tabIndex={-1}
        value={value}
        className="mt-2 min-h-12 w-full rounded-xl border border-[#173f2b]/8 bg-[#f2f5ee] px-3.5 text-sm font-extrabold text-[#294c38] outline-none"
      />
    </label>
  );
}

function SummaryRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#a9bbae]">{label}</dt>
      <dd className={`font-bold ${green ? "text-[#b8d7b6]" : "text-white"}`}>
        {value}
      </dd>
    </div>
  );
}
