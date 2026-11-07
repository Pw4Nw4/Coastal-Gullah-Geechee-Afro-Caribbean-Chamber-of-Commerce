// Receives Stripe's "payment finished" events and saves each paid membership as a `member` entry, so staff see who
// paid in /admin/submissions.csv without opening the Stripe dashboard. Needs STRIPE_WEBHOOK_SECRET (whsec_...) from
// the webhook endpoint set up in Stripe (Developers > Webhooks), for the events listed in HANDLED below.
const crypto = require("node:crypto");
const { store, hasEntry } = require("./forms");

const HANDLED = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const TOLERANCE_SECONDS = 5 * 60; // older events are refused, so a captured request can't be replayed later
const inFlight = new Set();

// Stripe signs "<timestamp>.<raw body>" with the endpoint's secret and sends t=<timestamp>,v1=<hex signature>.
function verified(raw, header, secret) {
  const parts = String(header || "").split(",").map((p) => p.trim().split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !signatures.length || Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_SECONDS) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest();
  return signatures.some((s) => {
    const given = Buffer.from(s, "hex");
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

// Returns [status, body]. raw is the request body exactly as received (the signature covers it byte for byte).
async function handleStripeWebhook(raw, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return [503, { error: "Webhook is not configured." }];
  if (!verified(raw, signature, secret)) return [400, { error: "Invalid signature." }];

  let event;
  try { event = JSON.parse(raw); } catch { return [400, { error: "Invalid request." }]; }
  const s = event.data?.object;
  if (!HANDLED.has(event.type) || !s || s.payment_status !== "paid") return [200, { received: true }];

  // A card payment fires "completed" once; other methods fire "completed" unpaid and then "async_payment_succeeded".
  // Either way the payment is stored once. Stripe may also resend an event, so check before saving.
  if (inFlight.has(s.id)) return [200, { received: true, duplicate: true }];
  inFlight.add(s.id); // before any await, so two simultaneous deliveries can't both pass the check below
  try {
    if (await hasEntry("session", s.id)) return [200, { received: true, duplicate: true }];
    const m = s.metadata || {};
    await store("member", "New paid member", {
      name: m.member_name || s.customer_details?.name || "",
      email: s.customer_details?.email || s.customer_email || "",
      phone: m.phone || s.customer_details?.phone || "",
      zip: m.zip || "",
      business: m.business || "",
      category: m.category || "",
      tier: m.tier || "",
      amount: (s.amount_total / 100).toFixed(2),
      about: m.about || "",
      newsletter: m.newsletter_optin || "",
      sms: m.sms_optin || "",
      session: s.id,
      payment: typeof s.payment_intent === "string" ? s.payment_intent : "",
    });
  } finally { inFlight.delete(s.id); }
  return [200, { received: true }];
}

module.exports = { handleStripeWebhook };
