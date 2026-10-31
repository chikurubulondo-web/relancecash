import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured, stripeMode, PRICE_EUR } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_ID dans .env.local (voir README).",
        stripeMode: stripeMode(),
      },
      { status: 503 }
    );
  }

  const stripe = getStripe()!;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    req.headers.get("origin") ||
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        product: "relancecash_early_bird_lifetime",
        price_eur: String(PRICE_EUR),
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      stripeMode: stripeMode(),
    });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    configured: isStripeConfigured(),
    mode: stripeMode(),
    priceEur: PRICE_EUR,
  });
}
