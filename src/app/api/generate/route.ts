import { NextRequest, NextResponse } from "next/server";
import { generateMessages } from "@/lib/gemini";
import type { Currency, Tone } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientName = String(body.clientName || "").trim();
    const amount = Number(body.amount);
    const currency = String(body.currency || "EUR") as Currency;
    const daysOverdue = Number(body.daysOverdue ?? 0);
    const productService = String(body.productService || "").trim();
    const tone = String(body.tone || "poli") as Tone;
    const senderName = String(body.senderName || "").trim();
    const invoiceRef = String(body.invoiceRef || "").trim();

    if (!clientName || !Number.isFinite(amount) || amount <= 0 || !productService) {
      return NextResponse.json(
        { error: "Champs requis : nom client, montant > 0, prestation." },
        { status: 400 }
      );
    }
    if (!["EUR", "USD", "CDF", "XOF", "MAD"].includes(currency)) {
      return NextResponse.json({ error: "Devise invalide." }, { status: 400 });
    }
    if (!["poli", "ferme", "ultime"].includes(tone)) {
      return NextResponse.json({ error: "Ton invalide." }, { status: 400 });
    }

    const result = await generateMessages({
      clientName,
      amount,
      currency,
      daysOverdue: Number.isFinite(daysOverdue) ? Math.max(0, Math.floor(daysOverdue)) : 0,
      productService,
      tone,
      senderName,
      invoiceRef,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erreur de génération. Réessayez." },
      { status: 500 }
    );
  }
}
