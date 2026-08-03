import { NextResponse } from "next/server";

import { sendOrderEmails } from "@/lib/email";
import {
  getOrderEnvironment,
  OrderConfigurationError,
} from "@/lib/env";
import {
  ExistingOrderConflictError,
  getOrCreateSheetOrder,
  updateSheetEmailStatuses,
} from "@/lib/google-sheets";
import { createOrderId } from "@/lib/order-id";
import { withOrderLock } from "@/lib/order-lock";
import { orderRequestSchema } from "@/lib/order-schema";
import { calculateOrder, PRODUCT } from "@/lib/product";
import type { OrderRecord, OrderSuccessSummary } from "@/types/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const maximumBodySize = 16_384;

function safeErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

function successSummary(order: OrderRecord): OrderSuccessSummary {
  return {
    orderId: order.orderId,
    dateTime: order.dateTime,
    productName: order.productName,
    paidQuantity: order.paidQuantity,
    freeQuantity: order.freeQuantity,
    totalPlants: order.totalPlants,
    pricePerPiece: order.pricePerPiece,
    subtotal: order.subtotal,
    deliveryZoneLabel: order.deliveryZoneLabel,
    deliveryFee: order.deliveryFee,
    totalPrice: order.totalPrice,
    paymentMethod: order.paymentMethod,
  };
}

export async function POST(request: Request) {
  let stage = "request";
  let orderId: string | undefined;

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().startsWith("application/json")) {
      return NextResponse.json(
        { success: false, message: "The order must be sent as JSON." },
        { status: 415 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > maximumBodySize) {
      return NextResponse.json(
        { success: false, message: "The order request is too large." },
        { status: 413 },
      );
    }

    stage = "validation";
    let body: unknown;
    const bodyText = await request.text();

    if (new TextEncoder().encode(bodyText).byteLength > maximumBodySize) {
      return NextResponse.json(
        { success: false, message: "The order request is too large." },
        { status: 413 },
      );
    }

    try {
      body = JSON.parse(bodyText) as unknown;
    } catch {
      return NextResponse.json(
        { success: false, message: "The order request is not valid JSON." },
        { status: 400 },
      );
    }

    const parsed = orderRequestSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten();

      return NextResponse.json(
        {
          success: false,
          message: "Please check the highlighted fields and try again.",
          fieldErrors: errors.fieldErrors,
          formErrors: errors.formErrors,
        },
        { status: 422 },
      );
    }

    const environment = getOrderEnvironment();
    const pricing = calculateOrder(
      parsed.data.quantity,
      parsed.data.deliveryZone,
    );
    orderId = createOrderId(parsed.data.requestId);
    const order: OrderRecord = {
      orderId,
      dateTime: new Date().toISOString(),
      customerName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email.toLowerCase(),
      exactLocation: parsed.data.exactLocation,
      productId: PRODUCT.id,
      productName: PRODUCT.name,
      paidQuantity: pricing.paidQuantity,
      freeQuantity: pricing.freeQuantity,
      totalPlants: pricing.totalPlants,
      pricePerPiece: pricing.pricePerPiece,
      subtotal: pricing.subtotal,
      deliveryZone: pricing.deliveryZone,
      deliveryZoneLabel: pricing.deliveryZoneLabel,
      deliveryFee: pricing.deliveryFee,
      totalPrice: pricing.totalPrice,
      paymentMethod: "Cash On Delivery",
      orderStatus: "New Order",
      notes: "",
    };

    return await withOrderLock(orderId, async () => {
      stage = "spreadsheet";
      const sheetOrder = await getOrCreateSheetOrder(environment, order);
      order.dateTime = sheetOrder.dateTime;

      stage = "email";
      const emailResult = await sendOrderEmails(environment, order, {
        sendBusinessEmail: sheetOrder.businessEmailStatus !== "Sent",
        sendCustomerEmail: sheetOrder.customerEmailStatus !== "Sent",
      });

      try {
        await updateSheetEmailStatuses(
          environment,
          order.orderId,
          emailResult.businessEmailStatus,
          emailResult.customerEmailStatus,
        );
      } catch (statusError) {
        console.error("[order] Could not update email delivery statuses", {
          orderId,
          error: safeErrorName(statusError),
        });
      }

      const allEmailsSent =
        emailResult.businessEmailStatus === "Sent" &&
        emailResult.customerEmailStatus === "Sent";

      if (!allEmailsSent) {
        console.error("[order] One or more order emails failed", {
          orderId,
          businessEmail: emailResult.businessEmailStatus,
          customerEmail: emailResult.customerEmailStatus,
          businessError: safeErrorName(emailResult.businessError),
          customerError: safeErrorName(emailResult.customerError),
        });

        return NextResponse.json(
          {
            success: false,
            orderRecorded: true,
            retryable: true,
            orderId,
            message:
              "Your order was saved, but an email notification could not be completed. Please retry once to finish the confirmation.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { success: true, order: successSummary(order) },
        {
          status: sheetOrder.created ? 201 : 200,
          headers: { "Cache-Control": "no-store" },
        },
      );
    });
  } catch (error) {
    console.error("[order] Order processing failed", {
      orderId,
      stage,
      error: safeErrorName(error),
    });

    if (error instanceof OrderConfigurationError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The order service is not configured yet. Please contact customer support.",
        },
        { status: 500 },
      );
    }

    if (error instanceof ExistingOrderConflictError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This checkout session contains different order details. Please refresh the page and try again.",
        },
        { status: 409 },
      );
    }

    if (stage === "email" && orderId) {
      return NextResponse.json(
        {
          success: false,
          orderRecorded: true,
          retryable: true,
          orderId,
          message:
            "Your order was saved, but email confirmation could not be completed. Please retry once to finish the notification.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          stage === "spreadsheet"
            ? "We could not save your order right now. Please try again shortly."
            : "We could not complete your order right now. Please try again shortly.",
      },
      { status: stage === "spreadsheet" ? 502 : 500 },
    );
  }
}
