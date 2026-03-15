import {
  handleNewsletterConfirmGet,
  type NewsletterConfirmHandlerEnv,
} from "../../shared/handlers/newsletter-confirm";
import { SITE_URL } from "../../src/lib/site-config";

type Env = Omit<NewsletterConfirmHandlerEnv, "siteUrl">;

export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  return handleNewsletterConfirmGet(context.request, {
    ...context.env,
    siteUrl: SITE_URL,
  });
}
