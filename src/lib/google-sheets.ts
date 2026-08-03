import "server-only";

import { google, type sheets_v4 } from "googleapis";

import type { OrderEnvironment } from "@/lib/env";
import type {
  EmailDeliveryStatus,
  OrderRecord,
} from "@/types/order";

export const REQUIRED_SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
] as const;

export const SHEET_HEADERS = [
  ...REQUIRED_SHEET_HEADERS,
  "Free Quantity",
  "Total Plants",
  "Product Subtotal",
  "Delivery Zone",
  "Delivery Fee",
  "Business Email Status",
  "Customer Email Status",
] as const;

export const ORDER_STATUS_OPTIONS = [
  "New Order",
  "Order Confirmed",
  "Order Ongoing",
  "Delivered",
  "Cancelled",
] as const;

type SheetContext = {
  sheets: sheets_v4.Sheets;
  sheetId: number;
  rowCount: number;
  quotedTabName: string;
};

export type SheetOrderState = {
  rowNumber: number;
  dateTime: string;
  businessEmailStatus: EmailDeliveryStatus;
  customerEmailStatus: EmailDeliveryStatus;
  created: boolean;
};

export class ExistingOrderConflictError extends Error {
  constructor() {
    super("This checkout request is already attached to different order details.");
    this.name = "ExistingOrderConflictError";
  }
}

const sheetContextCache = new Map<string, Promise<SheetContext>>();

const SHEET_COLORS = {
  forest: { red: 0.055, green: 0.22, blue: 0.145 },
  forestLight: { red: 0.89, green: 0.95, blue: 0.91 },
  ivory: { red: 1, green: 0.99, blue: 0.955 },
  gold: { red: 0.83, green: 0.64, blue: 0.25 },
  white: { red: 1, green: 1, blue: 1 },
  amber: { red: 1, green: 0.94, blue: 0.74 },
  amberText: { red: 0.55, green: 0.3, blue: 0.02 },
  blue: { red: 0.86, green: 0.92, blue: 1 },
  blueText: { red: 0.08, green: 0.25, blue: 0.55 },
  violet: { red: 0.92, green: 0.88, blue: 1 },
  violetText: { red: 0.32, green: 0.16, blue: 0.58 },
  green: { red: 0.82, green: 0.94, blue: 0.85 },
  greenText: { red: 0.08, green: 0.38, blue: 0.16 },
  red: { red: 1, green: 0.86, blue: 0.86 },
  redText: { red: 0.62, green: 0.08, blue: 0.08 },
} as const;

const COLUMN_WIDTHS = [
  { startIndex: 0, endIndex: 2, pixelSize: 170 },
  { startIndex: 2, endIndex: 3, pixelSize: 180 },
  { startIndex: 3, endIndex: 4, pixelSize: 135 },
  { startIndex: 4, endIndex: 5, pixelSize: 220 },
  { startIndex: 5, endIndex: 6, pixelSize: 280 },
  { startIndex: 6, endIndex: 7, pixelSize: 165 },
  { startIndex: 7, endIndex: 10, pixelSize: 120 },
  { startIndex: 10, endIndex: 12, pixelSize: 155 },
  { startIndex: 12, endIndex: 13, pixelSize: 220 },
  { startIndex: 13, endIndex: 16, pixelSize: 115 },
  { startIndex: 16, endIndex: 17, pixelSize: 175 },
  { startIndex: 17, endIndex: 20, pixelSize: 150 },
] as const;

const STATUS_FORMATS = [
  {
    status: "New Order",
    background: SHEET_COLORS.amber,
    foreground: SHEET_COLORS.amberText,
  },
  {
    status: "Order Confirmed",
    background: SHEET_COLORS.blue,
    foreground: SHEET_COLORS.blueText,
  },
  {
    status: "Order Ongoing",
    background: SHEET_COLORS.violet,
    foreground: SHEET_COLORS.violetText,
  },
  {
    status: "Delivered",
    background: SHEET_COLORS.green,
    foreground: SHEET_COLORS.greenText,
  },
  {
    status: "Cancelled",
    background: SHEET_COLORS.red,
    foreground: SHEET_COLORS.redText,
  },
] as const;

function quoteSheetName(tabName: string): string {
  return `'${tabName.replaceAll("'", "''")}'`;
}

function statusFromCell(value: unknown): EmailDeliveryStatus {
  if (value === "Sent") return "Sent";
  if (value === "Failed") return "Failed";
  return "Pending";
}

function hasExactHeaders(currentHeaders: string[], expected: readonly string[]) {
  return expected.every((header, index) => currentHeaders[index] === header);
}

async function initialiseSheet(
  context: SheetContext,
  spreadsheetId: string,
) {
  const headerRange = `${context.quotedTabName}!A1:T1`;

  await context.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: "RAW",
    requestBody: { values: [[...SHEET_HEADERS]] },
  });

  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSpreadsheetProperties: {
        properties: { timeZone: "Asia/Kathmandu" },
        fields: "timeZone",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: SHEET_HEADERS.length,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: SHEET_COLORS.forest,
            textFormat: {
              foregroundColor: SHEET_COLORS.white,
              bold: true,
              fontSize: 11,
            },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            borders: {
              bottom: {
                style: "SOLID_THICK",
                color: SHEET_COLORS.gold,
              },
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: context.sheetId,
          dimension: "ROWS",
          startIndex: 0,
          endIndex: 1,
        },
        properties: { pixelSize: 44 },
        fields: "pixelSize",
      },
    },
    {
      updateSheetProperties: {
        properties: {
          sheetId: context.sheetId,
          gridProperties: { frozenRowCount: 1 },
          tabColor: SHEET_COLORS.forest,
        },
        fields: "gridProperties.frozenRowCount,tabColor",
      },
    },
    {
      setBasicFilter: {
        filter: {
          range: {
            sheetId: context.sheetId,
            startRowIndex: 0,
            endRowIndex: context.rowCount,
            startColumnIndex: 0,
            endColumnIndex: SHEET_HEADERS.length,
          },
        },
      },
    },
    {
      setDataValidation: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 1,
          endRowIndex: context.rowCount,
          startColumnIndex: 11,
          endColumnIndex: 12,
        },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: ORDER_STATUS_OPTIONS.map((status) => ({
              userEnteredValue: status,
            })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      addBanding: {
        bandedRange: {
          range: {
            sheetId: context.sheetId,
            startRowIndex: 0,
            endRowIndex: context.rowCount,
            startColumnIndex: 0,
            endColumnIndex: SHEET_HEADERS.length,
          },
          rowProperties: {
            headerColor: SHEET_COLORS.forest,
            firstBandColor: SHEET_COLORS.ivory,
            secondBandColor: SHEET_COLORS.forestLight,
          },
        },
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 1,
          endRowIndex: context.rowCount,
          startColumnIndex: 0,
          endColumnIndex: SHEET_HEADERS.length,
        },
        cell: {
          userEnteredFormat: {
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields:
          "userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 1,
          endRowIndex: context.rowCount,
          startColumnIndex: 7,
          endColumnIndex: 12,
        },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 1,
          endRowIndex: context.rowCount,
          startColumnIndex: 13,
          endColumnIndex: 20,
        },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 1,
          endRowIndex: context.rowCount,
          startColumnIndex: 8,
          endColumnIndex: 10,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: '"Rs" #,##0' },
          },
        },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    ...[15, 17].map<sheets_v4.Schema$Request>((columnIndex) => ({
      repeatCell: {
        range: {
          sheetId: context.sheetId,
          startRowIndex: 1,
          endRowIndex: context.rowCount,
          startColumnIndex: columnIndex,
          endColumnIndex: columnIndex + 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: '"Rs" #,##0' },
          },
        },
        fields: "userEnteredFormat.numberFormat",
      },
    })),
    ...COLUMN_WIDTHS.map<sheets_v4.Schema$Request>((width) => ({
      updateDimensionProperties: {
        range: {
          sheetId: context.sheetId,
          dimension: "COLUMNS",
          startIndex: width.startIndex,
          endIndex: width.endIndex,
        },
        properties: { pixelSize: width.pixelSize },
        fields: "pixelSize",
      },
    })),
    ...STATUS_FORMATS.map<sheets_v4.Schema$Request>((statusFormat) => ({
      addConditionalFormatRule: {
        index: 0,
        rule: {
          ranges: [
            {
              sheetId: context.sheetId,
              startRowIndex: 1,
              endRowIndex: context.rowCount,
              startColumnIndex: 11,
              endColumnIndex: 12,
            },
          ],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [
                { userEnteredValue: `=$L2="${statusFormat.status}"` },
              ],
            },
            format: {
              backgroundColor: statusFormat.background,
              textFormat: {
                foregroundColor: statusFormat.foreground,
                bold: true,
              },
            },
          },
        },
      },
    })),
  ];

  await context.sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests,
    },
  });
}

async function createSheetContext(
  environment: OrderEnvironment,
): Promise<SheetContext> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: environment.googleServiceAccountEmail,
      private_key: environment.googlePrivateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: environment.googleSheetId,
    includeGridData: false,
    fields:
      "sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))",
  });
  const worksheet = spreadsheet.data.sheets?.find(
    (sheet) =>
      sheet.properties?.title === environment.googleSheetTabName,
  );
  const sheetId = worksheet?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    throw new Error(
      `Google Sheet tab "${environment.googleSheetTabName}" was not found.`,
    );
  }

  const context: SheetContext = {
    sheets,
    sheetId,
    rowCount: worksheet?.properties?.gridProperties?.rowCount ?? 1000,
    quotedTabName: quoteSheetName(environment.googleSheetTabName),
  };
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: environment.googleSheetId,
    range: `${context.quotedTabName}!A1:T1`,
  });
  const currentHeaders = (headerResponse.data.values?.[0] ?? []).map(String);
  const isBlank = currentHeaders.every((header) => !header.trim());
  const hasRequiredOnly =
    currentHeaders.length <= REQUIRED_SHEET_HEADERS.length &&
    hasExactHeaders(currentHeaders, REQUIRED_SHEET_HEADERS);

  if (isBlank || hasRequiredOnly) {
    await initialiseSheet(context, environment.googleSheetId);
  } else if (!hasExactHeaders(currentHeaders, SHEET_HEADERS)) {
    throw new Error(
      "The Google Sheet header row does not match the required order columns.",
    );
  }

  return context;
}

async function getSheetContext(
  environment: OrderEnvironment,
): Promise<SheetContext> {
  const cacheKey = `${environment.googleSheetId}:${environment.googleSheetTabName}`;
  const cached = sheetContextCache.get(cacheKey);

  if (cached) return cached;

  const contextPromise = createSheetContext(environment).catch((error) => {
    sheetContextCache.delete(cacheKey);
    throw error;
  });

  sheetContextCache.set(cacheKey, contextPromise);
  return contextPromise;
}

function assertExistingOrderMatches(row: unknown[], order: OrderRecord) {
  const matches =
    String(row[2] ?? "") === order.customerName &&
    String(row[3] ?? "") === order.phone &&
    String(row[4] ?? "") === order.email &&
    String(row[5] ?? "") === order.exactLocation &&
    Number(row[7]) === order.paidQuantity &&
    Number(row[9]) === order.totalPrice &&
    String(row[16] ?? "") === order.deliveryZoneLabel;

  if (!matches) {
    throw new ExistingOrderConflictError();
  }
}

async function findOrder(
  context: SheetContext,
  spreadsheetId: string,
  orderId: string,
) {
  const idResponse = await context.sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${context.quotedTabName}!A2:A`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const ids = idResponse.data.values ?? [];
  const index = ids.findIndex((row) => String(row[0] ?? "") === orderId);

  if (index === -1) return null;

  const rowNumber = index + 2;
  const rowResponse = await context.sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${context.quotedTabName}!A${rowNumber}:T${rowNumber}`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  return { row: rowResponse.data.values?.[0] ?? [], rowNumber };
}

export async function getOrCreateSheetOrder(
  environment: OrderEnvironment,
  order: OrderRecord,
): Promise<SheetOrderState> {
  const context = await getSheetContext(environment);
  const existing = await findOrder(
    context,
    environment.googleSheetId,
    order.orderId,
  );

  if (existing) {
    assertExistingOrderMatches(existing.row, order);

    return {
      rowNumber: existing.rowNumber,
      dateTime: String(existing.row[1] ?? order.dateTime),
      businessEmailStatus: statusFromCell(existing.row[18]),
      customerEmailStatus: statusFromCell(existing.row[19]),
      created: false,
    };
  }

  const response = await context.sheets.spreadsheets.values.append({
    spreadsheetId: environment.googleSheetId,
    range: `${context.quotedTabName}!A:T`,
    valueInputOption: "RAW",
    insertDataOption: "OVERWRITE",
    requestBody: {
      values: [
        [
          order.orderId,
          order.dateTime,
          order.customerName,
          order.phone,
          order.email,
          order.exactLocation,
          order.productName,
          order.paidQuantity,
          order.pricePerPiece,
          order.totalPrice,
          order.paymentMethod,
          order.orderStatus,
          order.notes,
          order.freeQuantity,
          order.totalPlants,
          order.subtotal,
          order.deliveryZoneLabel,
          order.deliveryFee,
          "Pending",
          "Pending",
        ],
      ],
    },
  });
  const updatedRange = response.data.updates?.updatedRange ?? "";
  const rowNumber = Number(updatedRange.match(/![A-Z]+(\d+):/i)?.[1]);

  if (!Number.isInteger(rowNumber) || rowNumber < 2) {
    throw new Error("Google Sheets did not return the appended order row.");
  }

  return {
    rowNumber,
    dateTime: order.dateTime,
    businessEmailStatus: "Pending",
    customerEmailStatus: "Pending",
    created: true,
  };
}

export async function updateSheetEmailStatuses(
  environment: OrderEnvironment,
  orderId: string,
  businessEmailStatus: EmailDeliveryStatus,
  customerEmailStatus: EmailDeliveryStatus,
) {
  const context = await getSheetContext(environment);
  const currentOrder = await findOrder(
    context,
    environment.googleSheetId,
    orderId,
  );

  if (!currentOrder) {
    throw new Error("The recorded order could not be found for status update.");
  }

  await context.sheets.spreadsheets.values.update({
    spreadsheetId: environment.googleSheetId,
    range: `${context.quotedTabName}!S${currentOrder.rowNumber}:T${currentOrder.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[businessEmailStatus, customerEmailStatus]],
    },
  });
}
