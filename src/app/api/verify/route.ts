import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id manquant" }, { status: 400 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  try {
    const stripe = getStripe()!;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.payment_status === "paid" || session.status === "complete";
    return NextResponse.json({
      paid,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }
}
