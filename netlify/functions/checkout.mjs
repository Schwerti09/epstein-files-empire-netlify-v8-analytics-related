import Stripe from "stripe";
import { ok, bad, isOptions } from "./_lib/http.mjs";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export default async (event) => {
  if (isOptions(event)) return ok({ ok: true });

  try {
    if (event.httpMethod !== "POST") return bad({ error: "Method not allowed" }, 405);

    const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" });
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:8888";

    const body = JSON.parse(event.body || "{}");
    const mode = (process.env.CHECKOUT_MODE || body.mode || "payment").toLowerCase();

    let session;
    if (mode === "subscription") {
      const price = requireEnv("STRIPE_PRICE_ID");
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price, quantity: 1 }],
        success_url: `${siteUrl}/premium.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/?cancel=1`,
        allow_promotion_codes: true
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: 199,
            product_data: {
              name: "Epstein Files Day Pass (24h)",
              description: "Premium Highlights + Smart Match (24 Stunden)"
            }
          },
          quantity: 1
        }],
        success_url: `${siteUrl}/premium.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/?cancel=1`,
        allow_promotion_codes: true
      });
    }

    return ok({ success: true, url: session.url, mode });
  } catch (err) {
    return bad({ success: false, error: err.message || "Stripe error" }, 500);
  }
};
