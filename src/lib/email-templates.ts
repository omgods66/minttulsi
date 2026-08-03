import "server-only";

import { escapeHtml } from "@/lib/html";
import { formatNpr, STORE } from "@/lib/product";
import type { OrderRecord } from "@/types/order";

function formatOrderDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return escapeHtml(value);

  return new Intl.DateTimeFormat("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(date);
}

function detailRow(label: string, value: string | number, emphasize = false) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e7eee7;color:#68756b;font-size:14px;line-height:20px;">${escapeHtml(label)}</td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #e7eee7;color:#183c2a;font-size:14px;line-height:20px;font-weight:${emphasize ? "700" : "600"};">${escapeHtml(value)}</td>
    </tr>`;
}

function emailShell(brandName: string, previewText: string, content: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(previewText)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef3ec;color:#183c2a;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(previewText)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#eef3ec;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(23,63,43,.08);">
            <tr>
              <td align="center" style="padding:24px;background:#173f2b;color:#ffffff;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:34px;font-weight:700;letter-spacing:.2px;">${escapeHtml(brandName)}</div>
                <div style="margin-top:5px;color:#cfe3d1;font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:2px;">Freshly nurtured greenery</div>
              </td>
            </tr>
            ${content}
            <tr>
              <td align="center" style="padding:20px 28px;background:#f8faf6;color:#718075;font-size:12px;line-height:18px;">
                Cash on Delivery &nbsp;&bull;&nbsp; Carefully packed &nbsp;&bull;&nbsp; Delivery within 24 hours
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function createBusinessEmailHtml(
  order: OrderRecord,
  brandName: string,
): string {
  const content = `
    <tr>
      <td style="padding:34px 34px 16px;">
        <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#fff1cf;color:#7a5311;font-size:12px;line-height:16px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;">New Order</div>
        <h1 style="margin:16px 0 8px;color:#173f2b;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:38px;">A new product order has arrived</h1>
        <p style="margin:0;color:#68756b;font-size:15px;line-height:24px;">Review the customer and product details below, then call to confirm the order.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7faf5;border:1px solid #e3ebe1;border-radius:14px;">
          <tr><td style="padding:18px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${detailRow("Order ID", order.orderId, true)}
              ${detailRow("Date & Time", formatOrderDate(order.dateTime))}
              ${detailRow("Order Status", order.orderStatus, true)}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 24px;">
        <h2 style="margin:0 0 10px;color:#173f2b;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:28px;">Customer details</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${detailRow("Customer Name", order.customerName)}
          ${detailRow("Phone Number", order.phone, true)}
          ${detailRow("Email Address", order.email)}
          ${detailRow("Exact Location", order.exactLocation)}
          ${detailRow("Delivery Zone", order.deliveryZoneLabel)}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 24px;">
        <h2 style="margin:0 0 10px;color:#173f2b;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:28px;">Product details</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${detailRow("Product Name", order.productName, true)}
          ${detailRow("Plants Purchased", order.paidQuantity)}
          ${detailRow("Free Plants", order.freeQuantity)}
          ${detailRow("Total Plants", order.totalPlants, true)}
          ${detailRow("Price Per Piece", formatNpr(order.pricePerPiece))}
          ${detailRow("Product Subtotal", formatNpr(order.subtotal))}
          ${detailRow("Delivery Fee", order.deliveryFee === 0 ? "Free" : formatNpr(order.deliveryFee))}
          ${detailRow("Total Price", formatNpr(order.totalPrice), true)}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#173f2b;border-radius:14px;color:#ffffff;">
          <tr>
            <td style="padding:20px;">
              <div style="color:#b9d6bf;font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:1px;">Payment details</div>
              <div style="margin-top:6px;font-size:17px;line-height:24px;font-weight:700;">Cash On Delivery &nbsp;&bull;&nbsp; ${escapeHtml(formatNpr(order.totalPrice))}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 34px;">
        <div style="padding:17px 18px;border-left:4px solid #c99b4a;background:#fff8e8;border-radius:4px 12px 12px 4px;color:#664b1d;font-size:14px;line-height:22px;font-weight:700;">Please call the customer soon to confirm this order.</div>
      </td>
    </tr>`;

  return emailShell(
    brandName,
    `New order ${order.orderId} from ${order.customerName}`,
    content,
  );
}

export function createCustomerEmailHtml(
  order: OrderRecord,
  brandName: string,
  supportEmail: string,
): string {
  const content = `
    <tr>
      <td align="center" style="padding:36px 34px 18px;">
        <div style="display:inline-block;width:54px;height:54px;border-radius:50%;background:#e2f0df;color:#245b3d;font-size:28px;line-height:54px;text-align:center;">&#10003;</div>
        <h1 style="margin:18px 0 8px;color:#173f2b;font-family:Georgia,'Times New Roman',serif;font-size:31px;line-height:38px;">Thank you for your order!</h1>
        <p style="margin:0;color:#68756b;font-size:15px;line-height:24px;">Hi ${escapeHtml(order.customerName)}, we have received your order successfully.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:4px 34px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7faf5;border:1px solid #e3ebe1;border-radius:14px;">
          <tr><td style="padding:18px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${detailRow("Order ID", order.orderId, true)}
              ${detailRow("Product", order.productName, true)}
              ${detailRow("Plants Purchased", order.paidQuantity)}
              ${detailRow("Free Plants", order.freeQuantity)}
              ${detailRow("Total Plants", order.totalPlants)}
              ${detailRow("Delivery", order.deliveryFee === 0 ? "Free" : formatNpr(order.deliveryFee))}
              ${detailRow("Total Price", formatNpr(order.totalPrice), true)}
              ${detailRow("Payment Method", order.paymentMethod)}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 24px;">
        <div style="padding:19px 20px;background:#eef6ea;border-radius:14px;color:#234c35;font-size:15px;line-height:24px;text-align:center;">Our sales representative will call you soon to confirm your order. Delivery is within 24 hours.</div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 34px 34px;color:#68756b;font-size:14px;line-height:22px;">
        <p style="margin:0 0 12px;">No online payment is required. Please pay the total amount when your order is delivered.</p>
        <p style="margin:0;">Need help? Reply to this email, contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#245b3d;font-weight:700;text-decoration:none;">${escapeHtml(supportEmail)}</a>, or call <a href="tel:${escapeHtml(STORE.supportPhone)}" style="color:#245b3d;font-weight:700;text-decoration:none;">${escapeHtml(STORE.supportPhone)}</a>.</p>
        <p style="margin:22px 0 0;color:#173f2b;">Thank you,<br><strong>${escapeHtml(brandName)}</strong></p>
      </td>
    </tr>`;

  return emailShell(
    brandName,
    `We received your ${order.productName} order`,
    content,
  );
}
