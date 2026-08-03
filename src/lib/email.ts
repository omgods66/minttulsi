import "server-only";

import nodemailer from "nodemailer";

import {
  createBusinessEmailHtml,
  createCustomerEmailHtml,
} from "@/lib/email-templates";
import type { OrderEnvironment } from "@/lib/env";
import { formatNpr, STORE } from "@/lib/product";
import type {
  EmailDeliveryStatus,
  OrderRecord,
} from "@/types/order";

type SendOrderEmailsOptions = {
  sendBusinessEmail: boolean;
  sendCustomerEmail: boolean;
};

export type SendOrderEmailsResult = {
  businessEmailStatus: EmailDeliveryStatus;
  customerEmailStatus: EmailDeliveryStatus;
  businessError?: unknown;
  customerError?: unknown;
};

function createTransporter(environment: OrderEnvironment) {
  return nodemailer.createTransport({
    host: environment.smtpHost,
    port: environment.smtpPort,
    secure: environment.smtpPort === 465,
    requireTLS: environment.smtpPort === 587,
    auth: {
      user: environment.smtpUser,
      pass: environment.smtpPass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

function getReplyEmail(emailFrom: string): string {
  return emailFrom.match(/<([^<>]+)>/)?.[1]?.trim() || emailFrom.trim();
}

function smtpAccepted(
  result: PromiseSettledResult<unknown>,
  intendedRecipient: string,
) {
  if (result.status !== "fulfilled" || !result.value) return false;

  const info = result.value as { accepted?: unknown[]; rejected?: unknown[] };
  const intended = intendedRecipient.trim().toLowerCase();
  const accepted = (info.accepted ?? []).map((address) =>
    String(address).trim().toLowerCase(),
  );
  const rejected = (info.rejected ?? []).map((address) =>
    String(address).trim().toLowerCase(),
  );

  return accepted.includes(intended) && !rejected.includes(intended);
}

function businessPlainText(order: OrderRecord, brandName: string) {
  return `${brandName}\n\nNew Product Order Received\n\nOrder ID: ${order.orderId}\nDate & Time: ${order.dateTime}\nOrder Status: ${order.orderStatus}\n\nCustomer Details\nName: ${order.customerName}\nPhone: ${order.phone}\nEmail: ${order.email}\nExact Location: ${order.exactLocation}\nDelivery Zone: ${order.deliveryZoneLabel}\n\nProduct Details\nProduct: ${order.productName}\nPlants Purchased: ${order.paidQuantity}\nFree Plants: ${order.freeQuantity}\nTotal Plants: ${order.totalPlants}\nPrice Per Piece: ${formatNpr(order.pricePerPiece)}\nSubtotal: ${formatNpr(order.subtotal)}\nDelivery Fee: ${order.deliveryFee === 0 ? "Free" : formatNpr(order.deliveryFee)}\nTotal Price: ${formatNpr(order.totalPrice)}\nPayment Method: ${order.paymentMethod}\n\nPlease call the customer soon to confirm this order.`;
}

function customerPlainText(order: OrderRecord, brandName: string) {
  return `Hi ${order.customerName},\n\nThank you for your order.\n\nWe have received your order successfully.\n\nOrder ID: ${order.orderId}\nProduct: ${order.productName}\nPlants Purchased: ${order.paidQuantity}\nFree Plants: ${order.freeQuantity}\nTotal Plants: ${order.totalPlants}\nTotal Price: ${formatNpr(order.totalPrice)}\nPayment Method: ${order.paymentMethod}\n\nOur sales representative will call you soon to confirm your order. Delivery is within 24 hours.\n\nNeed help? Call ${STORE.supportPhone}.\n\nThank you,\n${brandName}`;
}

export async function sendOrderEmails(
  environment: OrderEnvironment,
  order: OrderRecord,
  options: SendOrderEmailsOptions,
): Promise<SendOrderEmailsResult> {
  if (!options.sendBusinessEmail && !options.sendCustomerEmail) {
    return {
      businessEmailStatus: "Sent",
      customerEmailStatus: "Sent",
    };
  }

  const transporter = createTransporter(environment);
  const replyEmail = getReplyEmail(environment.emailFrom);
  const businessPromise = options.sendBusinessEmail
    ? transporter.sendMail({
        from: environment.emailFrom,
        to: environment.businessEmail,
        replyTo: order.email,
        subject: `New Product Order Received - ${order.orderId}`,
        text: businessPlainText(order, environment.brandName),
        html: createBusinessEmailHtml(order, environment.brandName),
      })
    : Promise.resolve(null);
  const customerPromise = options.sendCustomerEmail
    ? transporter.sendMail({
        from: environment.emailFrom,
        to: order.email,
        replyTo: replyEmail,
        subject: `Your Order Has Been Received - ${environment.brandName}`,
        text: customerPlainText(order, environment.brandName),
        html: createCustomerEmailHtml(
          order,
          environment.brandName,
          replyEmail,
        ),
      })
    : Promise.resolve(null);
  const [businessResult, customerResult] = await Promise.allSettled([
    businessPromise,
    customerPromise,
  ]);

  transporter.close();

  const businessAccepted = options.sendBusinessEmail
    ? smtpAccepted(businessResult, environment.businessEmail)
    : true;
  const customerAccepted = options.sendCustomerEmail
    ? smtpAccepted(customerResult, order.email)
    : true;

  return {
    businessEmailStatus: options.sendBusinessEmail
      ? businessAccepted
        ? "Sent"
        : "Failed"
      : "Sent",
    customerEmailStatus: options.sendCustomerEmail
      ? customerAccepted
        ? "Sent"
        : "Failed"
      : "Sent",
    businessError:
      businessResult.status === "rejected"
        ? businessResult.reason
        : businessAccepted
          ? undefined
          : new Error("The business recipient was not accepted by SMTP."),
    customerError:
      customerResult.status === "rejected"
        ? customerResult.reason
        : customerAccepted
          ? undefined
          : new Error("The customer recipient was not accepted by SMTP."),
  };
}
