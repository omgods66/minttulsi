export class OrderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderConfigurationError";
  }
}

const requiredOrderEnvironmentVariables = [
  "BUSINESS_EMAIL",
  "EMAIL_FROM",
  "BRAND_NAME",
  "GOOGLE_SHEET_ID",
  "GOOGLE_SHEET_TAB_NAME",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

export type OrderEnvironment = {
  businessEmail: string;
  emailFrom: string;
  brandName: string;
  googleSheetId: string;
  googleSheetTabName: string;
  googleServiceAccountEmail: string;
  googlePrivateKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function addressFromEmailHeader(value: string) {
  return value.match(/<([^<>]+)>/)?.[1]?.trim() || value.trim();
}

export function getOrderEnvironment(): OrderEnvironment {
  const missing = requiredOrderEnvironmentVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missing.length > 0) {
    throw new OrderConfigurationError(
      `Missing order service configuration: ${missing.join(", ")}`,
    );
  }

  const smtpPort = Number(process.env.SMTP_PORT);

  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new OrderConfigurationError("SMTP_PORT must be a valid port number.");
  }

  const businessEmail = process.env.BUSINESS_EMAIL!.trim();
  const emailFrom = process.env.EMAIL_FROM!.trim();
  const smtpUser = process.env.SMTP_USER!.trim();
  const serviceAccountEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  if (
    !emailPattern.test(businessEmail) ||
    !emailPattern.test(addressFromEmailHeader(emailFrom)) ||
    !emailPattern.test(smtpUser) ||
    !emailPattern.test(serviceAccountEmail)
  ) {
    throw new OrderConfigurationError(
      "One or more configured email addresses are invalid.",
    );
  }

  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new OrderConfigurationError(
      "GOOGLE_PRIVATE_KEY is not a valid service-account private key.",
    );
  }

  return {
    businessEmail,
    emailFrom,
    brandName: process.env.BRAND_NAME!.trim(),
    googleSheetId: process.env.GOOGLE_SHEET_ID!.trim(),
    googleSheetTabName: process.env.GOOGLE_SHEET_TAB_NAME!.trim(),
    googleServiceAccountEmail: serviceAccountEmail,
    googlePrivateKey: privateKey,
    smtpHost: process.env.SMTP_HOST!.trim(),
    smtpPort,
    smtpUser,
    smtpPass: process.env.SMTP_PASS!,
  };
}
