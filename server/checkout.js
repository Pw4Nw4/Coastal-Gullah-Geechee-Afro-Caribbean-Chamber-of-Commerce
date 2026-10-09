// Starts a Stripe Checkout session for a chamber membership.
// Prices live HERE (server side) so a visitor can't change what they're charged. Keep ids, names and prices in
// sync with TIERS in js/data.js. Each checkout has two line items, the membership and the registration fee, so
// both show on the Stripe page and the receipt.
const TIERS = {
  "youngpreneur": ["Youngpreneur", 5000],
  "solopreneur": ["Solopreneur", 15000],
  "legacy-partners": ["Legacy Partners", 14000],
  "legacy-partners-2": ["Legacy Partners II", 27500],
  "the-blueprint": ["The Blueprint", 32500],
  "the-black-card": ["The Black Card", 72500],
  "gold-partners": ["Gold Partners", 252500],
  "platinum-partners": ["Platinum Partners", 552500],
};
const REGISTRATION_FEE = 2500;
const clip = (v, n = 450) => String(v ?? "").trim().slice(0, n);

// Returns [status, body]. baseUrl is the public site address used for Stripe's return links.
async function createCheckout(d, baseUrl) {
  if (!process.env.STRIPE_SECRET_KEY) return [500, { error: "Payments are not configured yet." }];
  if (d.website) return [200, { url: "/" }]; // honeypot: bots fill this hidden field

  const tier = TIERS[d.tier];
  const name = clip(d.name, 120), email = clip(d.email, 200), phone = clip(d.phone, 40), zip = clip(d.zip, 12);
  if (!tier) return [400, { error: "Please choose a membership level." }];
  if (!name || !phone || !zip || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return [400, { error: "Please fill in your name, a valid email, phone and zip code." }];

  const meta = {
    member_name: name, business: clip(d.business, 200), phone, zip, category: clip(d.category, 80),
    tier: tier[0], about: clip(d.about), newsletter_optin: d.newsletter ? "yes" : "no", sms_optin: d.sms ? "yes" : "no",
  };

  const p = new URLSearchParams({
    mode: "payment", customer_email: email, customer_creation: "always",
    billing_address_collection: "required", "phone_number_collection[enabled]": "true",
    success_url: `${baseUrl}/membership-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/membership.html?tier=${encodeURIComponent(d.tier)}#join`,
    "line_items[0][quantity]": "1", "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(tier[1]), "line_items[0][price_data][product_data][name]": `${tier[0]} membership`,
    "line_items[1][quantity]": "1", "line_items[1][price_data][currency]": "usd",
    "line_items[1][price_data][unit_amount]": String(REGISTRATION_FEE), "line_items[1][price_data][product_data][name]": "Registration fee",
    "payment_intent_data[description]": `${tier[0]} membership: ${name}`,
  });
  for (const [k, v] of Object.entries(meta)) { p.set(`metadata[${k}]`, v); p.set(`payment_intent_data[metadata][${k}]`, v); }

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: p,
    signal: AbortSignal.timeout(15000),
  });
  const s = await r.json();
  if (!r.ok) { console.error("Stripe error:", s.error?.message); return [502, { error: "We couldn't start checkout." }]; }
  return [200, { url: s.url }];
}

module.exports = { createCheckout };
