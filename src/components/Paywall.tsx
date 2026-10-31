"use client";

import { useState } from "react";

const PRICE = 19;

export function Paywall({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function unlock() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErr(
          data.error ||
            "Paiement indisponible. Configurez Stripe (voir README)."
        );
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr("URL Checkout manquante.");
    } catch {
      setErr("Erreur réseau. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
        <h2 className="text-xl font-bold">Débloquez RelanceCash</h2>
        <p className="mt-2 text-sm text-slate-600">
          Vous avez utilisé vos 2 générations gratuites. Passez à l&apos;accès
          lifetime early bird pour générer sans limite.
        </p>
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="text-3xl font-extrabold text-emerald-700">
            {PRICE}€
          </div>
          <div className="text-sm text-emerald-800 font-medium">
            Early bird — accès à vie (paiement unique)
          </div>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            <li>✓ Générations illimitées</li>
            <li>✓ WhatsApp + emails pro</li>
            <li>✓ Tons poli / ferme / ultime</li>
            <li>✓ Prix early bird — bientôt plus cher</li>
          </ul>
        </div>
        {err && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">
            {err}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={unlock}
            disabled={loading}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Redirection…" : `Payer ${PRICE}€`}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Paiement sécurisé via Stripe
        </p>
      </div>
    </div>
  );
}
