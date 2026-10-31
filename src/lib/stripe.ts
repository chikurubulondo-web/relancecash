import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("REPLACE") || key.length < 20) return null;
  // apiVersion omitted → package default
  return new Stripe(key);
}

export function isStripeConfigured(): boolean {
  return Boolean(
    getStripe() &&
      process.env.STRIPE_PRICE_ID &&
      !process.env.STRIPE_PRICE_ID.includes("REPLACE")
  );
}

export function stripeMode(): "live" | "test" | "unset" {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key || key.includes("REPLACE")) return "unset";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return "unset";
}

export const PRICE_EUR = Number(process.env.PRICE_EUR || 19);
export const FREE_GENERATIONS = Number(process.env.FREE_GENERATIONS || 2);
