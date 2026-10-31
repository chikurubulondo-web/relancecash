#!/usr/bin/env node
/**
 * Creates RelanceCash Early Bird Lifetime product + 19€ one-time price.
 * Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-product.mjs
 * Then paste the printed STRIPE_PRICE_ID into .env.local
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.");
  process.exit(1);
}

const stripe = new Stripe(key);
const product = await stripe.products.create({
  name: "RelanceCash Early Bird Lifetime",
  description:
    "Accès à vie — générations illimitées de relances WhatsApp + email.",
  metadata: { app: "relancecash" },
});
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 1900,
  currency: "eur",
});
console.log("\n✅ Product created");
console.log("STRIPE_PRICE_ID=" + price.id);
console.log("Product ID:", product.id);
console.log("Amount: 19.00 EUR one-time");
console.log("Mode:", key.startsWith("sk_live_") ? "LIVE" : "TEST");
console.log("\nPaste STRIPE_PRICE_ID into .env.local and restart the app.\n");
