# Mint Tulsi Cash on Delivery Funnel

A production-ready Next.js sales funnel for Mint Tulsi with a conversion-focused
landing page, secure checkout, Google Sheets order recording, two HTML email
notifications, and a thank-you page.

## What is included

- `/` — premium product landing page with one-image hero, product gallery,
  quantity selector, live offer calculation, benefits, testimonials, FAQs, and
  repeated order buttons
- `/checkout` — customer details, delivery-area choice, read-only product
  details, calculated delivery, validation, loading state, and duplicate-click
  protection
- `/thank-you` — successful order summary with quantity, free plants, delivery,
  total, and Cash on Delivery instructions
- `POST /api/order` — strict validation, server-owned price calculation,
  stable order ID, Google Sheets write, business email, and customer email
- Responsive, Gmail-compatible HTML templates plus plain-text fallbacks
- Automated pricing, validation, security-helper, and order-ID tests

The project intentionally has no online payment or reels section.

## Pricing and offer rules

- Regular price: **NPR 55**
- Offer price: **NPR 49 per paid plant**
- Offer: **Buy 3 or more paid plants and receive 1 free plant**
- Inside Kathmandu Valley: **Free delivery**
- Outside Kathmandu Valley: **NPR 80 flat delivery fee per order**
- Delivery target: **within 24 hours**
- Customer support: **9865777419**
- Payment method: **Cash On Delivery**

The API recalculates every price and offer on the server. Product names, prices,
delivery fees, and totals sent from a browser are never trusted.

## How an order works

1. A customer selects the number of plants on the landing page.
2. The checkout reads the product and quantity and asks for the delivery area.
3. The browser sends only customer details, product ID, paid quantity, delivery
   zone, and a stable request ID to `/api/order`.
4. The API validates the data and calculates the free plants, delivery fee, and
   final total from server-owned rules.
5. The API records the order in Google Sheets with status `New Order`.
6. Only after the sheet write succeeds, it sends the business notification and
   the customer's order-received email.
7. A success response is returned only after the sheet and both emails succeed.
8. The browser stores the non-sensitive order summary for the current tab and
   redirects to `/thank-you`.

Each checkout creates one stable order ID. If the sheet succeeds but an email
temporarily fails, retrying the same checkout resumes the missing notification
instead of adding a second row. Google Sheets and SMTP do not provide a fully
transactional exactly-once guarantee, but the status columns make retries
best-effort idempotent and operationally visible.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
copy .env.example .env.local
npm run images:optimize
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local` instead of `copy`.

Open `http://localhost:3000`. The pages render without credentials, but a real
order will return a configuration error until Google Sheets and SMTP values are
present.

## Environment variables

Add these values to `.env.local` locally and to the Vercel project's Environment
Variables for deployment.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Full public site URL, such as `https://example.com` |
| `BUSINESS_EMAIL` | Inbox that receives new-order notifications |
| `EMAIL_FROM` | Customer-visible sender; configured as `Mint Tulsi <omgods66@gmail.com>` |
| `BRAND_NAME` | Brand used in both email templates |
| `GOOGLE_SHEET_ID` | Spreadsheet ID from its Google Sheets URL |
| `GOOGLE_SHEET_TAB_NAME` | Exact, case-sensitive tab name; configured as `Sheet1` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account `client_email` |
| `GOOGLE_PRIVATE_KEY` | Service-account private key |
| `SMTP_HOST` | SMTP server; Gmail uses `smtp.gmail.com` |
| `SMTP_PORT` | Use `465` for SSL or `587` for STARTTLS |
| `SMTP_USER` | Authenticated SMTP mailbox and support address |
| `SMTP_PASS` | Gmail App Password or SMTP credential |
| `EMAIL_SERVICE_API_KEY` | Reserved for a future API-based email provider |
| `FRONTEND_URL` | Public frontend origin; use the same deployed URL |

Never prefix a private variable with `NEXT_PUBLIC_`. Never commit `.env.local`.

## Google Spreadsheet setup

### 1. Create the spreadsheet and tab

1. Create a blank Google Spreadsheet.
2. Keep or rename the working tab to `Sheet1`, or use another exact name and set
   `GOOGLE_SHEET_TAB_NAME` to match it.
3. You may leave row 1 blank. On the first real order, the API creates the
   headers, bold green styling, frozen header row, filter, widths, and Order
   Status dropdown automatically.

If you prefer to add headers yourself, add these required columns in A–M:

1. Order ID
2. Date & Time
3. Customer Name
4. Phone Number
5. Email Address
6. Exact Location
7. Product Name
8. Quantity
9. Price Per Piece
10. Total Price
11. Payment Method
12. Order Status
13. Notes

The API then extends the sheet with these operational columns in N–T:

14. Free Quantity
15. Total Plants
16. Product Subtotal
17. Delivery Zone
18. Delivery Fee
19. Business Email Status
20. Customer Email Status

The required columns remain exactly in A–M. `Notes` is empty by default. The
extra columns preserve delivery/offer details and allow incomplete email steps
to be retried without duplicating a row.

### 2. Add filters manually, if needed

Select row 1 and choose **Data → Create a filter**. The API applies this when it
initializes a blank sheet, so manual setup is normally unnecessary.

### 3. Add the Order Status dropdown manually, if needed

1. Select `L2:L`.
2. Choose **Data → Data validation → Dropdown**.
3. Add these exact options:
   - New Order
   - Order Confirmed
   - Order Ongoing
   - Delivered
   - Cancelled
4. Set invalid data to be rejected and save.

The API applies this dropdown automatically when it initializes a blank sheet.

### 4. Get the Google Sheet ID

In this URL:

```text
https://docs.google.com/spreadsheets/d/1AbCExampleSheetIdXYZ/edit#gid=0
```

the ID is the text between `/d/` and `/edit`:

```text
1AbCExampleSheetIdXYZ
```

Use that value for `GOOGLE_SHEET_ID`.

### 5. Create Google credentials

1. Open Google Cloud Console and create or select a project.
2. Enable the **Google Sheets API**.
3. Open **IAM & Admin → Service Accounts**.
4. Create a service account for the order funnel.
5. Open the service account, choose **Keys → Add key → Create new key → JSON**.
6. Download the JSON file and read:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`

For a local `.env.local`, either keep escaped line breaks:

```dotenv
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

or paste the value in the multiline format accepted by your environment. The
server converts escaped `\n` sequences back into real line breaks.

### 6. Share the sheet with the service account

Open the spreadsheet's **Share** dialog, add the complete service-account email,
and give it **Editor** access. Without this step, the API cannot append orders or
format the sheet.

## Gmail order notifications

The project uses Nodemailer through SMTP and sends two emails after a successful
sheet write:

1. `BUSINESS_EMAIL` receives the full customer, product, delivery, payment, and
   status summary.
2. The customer's submitted email receives a branded Order Received message.

For Gmail:

1. Enable two-step verification on the Gmail/Google Workspace account.
2. Create a Google **App Password** for this application.
3. Configure:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=omgods66@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM="Mint Tulsi <omgods66@gmail.com>"
BUSINESS_EMAIL=omgods66@gmail.com
BRAND_NAME=Mint Tulsi
```

Do not use the normal Gmail password. `EMAIL_FROM` should match the authenticated
Gmail address or a sender alias authorized for that account. Port 587 also works;
the code automatically uses STARTTLS for that port.

## Test a successful order

### Automated checks

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

### Real end-to-end check

1. Add valid Google and SMTP credentials to `.env.local`.
2. Run `npm run dev`.
3. On the landing page, choose quantity 3. Confirm the UI shows 3 purchased,
   1 free, and 4 total plants.
4. Continue to checkout and choose a delivery zone.
5. Use a customer email inbox you can inspect, then submit once.
6. Confirm all four outcomes:
   - one new Google Sheets row appears;
   - the business inbox receives `New Product Order Received - [Order ID]`;
   - the customer receives `Your Order Has Been Received - Mint Tulsi`;
   - the browser redirects to `/thank-you` with the same order ID and total.
7. Test quantity 3 outside the Valley. The expected total is
   `3 × Rs 49 + Rs 80 = Rs 227`, with one free plant.

If a credential, sheet permission, or email step fails, checkout stays on the
page and shows an error. When the sheet was already saved, the same button
retries only the incomplete email step.

## Deploy to Vercel

1. Push this project to a Git repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Next.js automatically. Keep the standard commands:
   - Install: `npm install`
   - Build: `npm run build`
4. Add every variable from `.env.example` in **Project Settings → Environment
   Variables**. Add them to Production and any Preview environment you test.
5. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to the final HTTPS site URL.
6. Paste `GOOGLE_PRIVATE_KEY` exactly from the service-account JSON. Vercel
   accepts multiline secret values; escaped `\n` values also work.
7. Deploy or redeploy after adding variables.
8. Place a live test order and verify the sheet, both emails, and redirect.

The API route explicitly uses the Node.js runtime because Google authentication
and Nodemailer are not Edge-runtime services. SMTP ports 465 or 587 should be
used; do not use port 25.

## Product images

Original supplied files live in `assets/source-images`. Run:

```bash
npm run images:optimize
```

to regenerate high-quality PNG and WebP assets in `public/images`.

The small `mint2.jpg` cannot gain missing detail through conversion. The
supplied `mint4.webp` has a visible Freepik watermark and should be replaced
with a licensed, higher-resolution file before public launch. The optimization
script does not remove attribution or alter the underlying product.

## Security and reliability notes

- Google credentials, SMTP credentials, sheet ID, and email secrets are used
  only inside the server API route.
- Zod validates all required fields and rejects unknown request properties.
- Sheet writes use `valueInputOption: RAW`, preventing customer text beginning
  with `=` from being interpreted as a spreadsheet formula.
- Customer-controlled email content is HTML-escaped.
- The order button disables during submission and the stable request ID reduces
  duplicate rows on network retries.
- Before a high-volume public campaign, add a managed rate limiter or CAPTCHA.
  In-memory rate limits are not reliable across Vercel serverless instances.
