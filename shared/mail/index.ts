import type { MailProvider } from "./types";
import { createResendMailProvider } from "./providers/resend";

export type {
  MailProvider,
  MailContact,
  SendEmailParams,
  UpsertContactParams,
  ListContactsParams,
  UpdateContactParams,
} from "./types";

/**
 * Environment variables used by {@link getMailProvider} to select and configure
 * the active mail provider. Pass `process.env` (Node) or the Cloudflare `env`
 * object here.
 */
export interface MailProviderEnv {
  /** Selects the mail provider. Defaults to `"resend"`. */
  MAIL_PROVIDER?: string;
  /** Required when MAIL_PROVIDER is "resend" (the default). */
  RESEND_API_KEY?: string;
}

/**
 * Returns a {@link MailProvider} driven by the `MAIL_PROVIDER` environment
 * variable, or `null` when the required credentials are absent.
 *
 * Supported values for `MAIL_PROVIDER`:
 * - `"resend"` (default) — requires `RESEND_API_KEY`
 *
 * To add a new provider: implement {@link MailProvider} in `./providers/`,
 * add a `case` here, and set `MAIL_PROVIDER=<name>`.
 */
export function getMailProvider(env: MailProviderEnv): MailProvider | null {
  const providerName = env.MAIL_PROVIDER ?? "resend";
  switch (providerName) {
    case "resend": {
      if (!env.RESEND_API_KEY) return null;
      return createResendMailProvider(env.RESEND_API_KEY);
    }
    default:
      throw new Error(
        `Unknown MAIL_PROVIDER: "${providerName}". Supported values: resend`
      );
  }
}
