"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Paywall } from "@/components/Paywall";

const FREE_LIMIT = 2;
const USAGE_KEY = "relancecash_usage";
const UNLOCK_KEY = "relancecash_unlocked";

type Result = {
  whatsapp: string[];
  emails: { subject: string; body: string }[];
  source: "gemini" | "templates";
};

function readUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(UNLOCK_KEY) === "1") return true;
  if (document.cookie.includes("relancecash_unlocked=1")) {
    localStorage.setItem(UNLOCK_KEY, "1");
    return true;
  }
  return false;
}

function readUsage(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(localStorage.getItem(USAGE_KEY) || "0");
  return Number.isFinite(n) ? n : 0;
}

export default function Home() {
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [daysOverdue, setDaysOverdue] = useState("7");
  const [productService, setProductService] = useState("");
  const [tone, setTone] = useState<"poli" | "ferme" | "ultime">("poli");
  const [senderName, setSenderName] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [usage, setUsage] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [stripeInfo, setStripeInfo] = useState<{
    configured: boolean;
    mode: string;
    priceEur: number;
  } | null>(null);

  useEffect(() => {
    setUsage(readUsage());
    setUnlocked(readUnlocked());
    fetch("/api/checkout")
      .then((r) => r.json())
      .then(setStripeInfo)
      .catch(() => null);
  }, []);

  const remaining = useMemo(() => {
    if (unlocked) return Infinity;
    return Math.max(0, FREE_LIMIT - usage);
  }, [unlocked, usage]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!unlocked && usage >= FREE_LIMIT) {
      setPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          amount: Number(amount.replace(",", ".")),
          currency,
          daysOverdue: Number(daysOverdue),
          productService,
          tone,
          senderName,
          invoiceRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de génération");
        setLoading(false);
        return;
      }
      setResult(data);
      if (!unlocked) {
        const next = usage + 1;
        localStorage.setItem(USAGE_KEY, String(next));
        setUsage(next);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
              RC
            </span>
            <span className="font-bold text-slate-900">RelanceCash</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-600">
            {unlocked ? (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 font-medium">
                Accès lifetime ✓
              </span>
            ) : (
              <span>
                {remaining} essai{remaining > 1 ? "s" : ""} gratuit
                {remaining > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <section className="text-center max-w-2xl mx-auto">
          <p className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1">
            Early bird 19€ à vie — puis prix plus élevé
          </p>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Relances de paiement{" "}
            <span className="text-emerald-600">pro en 10 secondes</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            WhatsApp + email prêts à coller. Pour freelances, artisans et
            petites boîtes qui en ont marre des impayés.
          </p>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-sm">
            {[
              "3 messages WhatsApp selon le ton",
              "2 emails avec objet + corps",
              "Poli, ferme ou ultime — vous choisissez",
            ].map((b) => (
              <li
                key={b}
                className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm"
              >
                <span className="text-emerald-600 font-bold mr-1">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid lg:grid-cols-2 gap-6 items-start">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4"
          >
            <h2 className="font-bold text-lg text-slate-900">
              Générer la relance
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Nom du client *</span>
                <input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex. Dupont SARL"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Votre nom</span>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex. Marie — Graphiste"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Montant *</span>
                <input
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="1200"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Devise</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="EUR">EUR €</option>
                  <option value="USD">USD $</option>
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="CDF">CDF</option>
                  <option value="MAD">MAD</option>
                </select>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Jours de retard</span>
                <input
                  type="number"
                  min={0}
                  value={daysOverdue}
                  onChange={(e) => setDaysOverdue(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Réf. facture</span>
                <input
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="FAC-2026-042"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">
                Prestation / produit *
              </span>
              <input
                required
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Création site web, rénovation salle de bain…"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700 mb-2">
                Ton de la relance
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["poli", "Poli"],
                    ["ferme", "Ferme"],
                    ["ultime", "Ultime"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTone(v)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      tone === v
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 text-base shadow-sm disabled:opacity-60 transition"
            >
              {loading
                ? "Génération…"
                : !unlocked && usage >= FREE_LIMIT
                  ? "Débloquer pour générer (19€)"
                  : "Générer 3 WhatsApp + 2 emails"}
            </button>

            {!unlocked && usage >= FREE_LIMIT && (
              <button
                type="button"
                onClick={() => setPaywall(true)}
                className="w-full text-sm text-emerald-700 font-medium underline"
              >
                Voir l&apos;offre early bird 19€ à vie
              </button>
            )}

            {stripeInfo && (
              <p className="text-[11px] text-slate-400 text-center">
                Paiement :{" "}
                {stripeInfo.configured
                  ? `Stripe ${stripeInfo.mode} · ${stripeInfo.priceEur}€`
                  : "Stripe non configuré (clés à coller — voir README)"}
              </p>
            )}
          </form>

          <div className="space-y-4">
            {!result && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500 text-sm">
                Vos messages apparaîtront ici. Un clic pour tout copier.
              </div>
            )}

            {result && (
              <>
                <p className="text-xs text-slate-500">
                  Source :{" "}
                  {result.source === "gemini"
                    ? "IA Gemini"
                    : "moteur de templates FR pro"}
                </p>
                {result.whatsapp.map((msg, i) => (
                  <article
                    key={`wa-${i}`}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-slate-800">
                        WhatsApp #{i + 1}
                      </h3>
                      <CopyButton text={msg} />
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                      {msg}
                    </pre>
                  </article>
                ))}
                {result.emails.map((em, i) => (
                  <article
                    key={`em-${i}`}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-slate-800">
                        Email #{i + 1}
                      </h3>
                      <CopyButton
                        text={`Objet: ${em.subject}\n\n${em.body}`}
                        label="Copier tout"
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-2">
                      Objet : {em.subject}
                    </p>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                      {em.body}
                    </pre>
                  </article>
                ))}
              </>
            )}
          </div>
        </section>

        <section className="mt-14 max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Pourquoi RelanceCash ?
          </h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm text-left">
            {[
              {
                t: "Arrêtez de bloquer",
                d: "Plus besoin de chercher les mots justes à 23h. Collez et envoyez.",
              },
              {
                t: "Ton adapté",
                d: "Poli pour démarrer, ferme pour accélérer, ultime avant mise en demeure.",
              },
              {
                t: "Pensé FR / Afrique",
                d: "EUR, USD, FCFA, CDF, MAD. Langage pro compréhensible partout.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-xl bg-white border border-slate-200 p-4"
              >
                <div className="font-semibold text-slate-900">{x.t}</div>
                <p className="mt-1 text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        RelanceCash — relance facture WhatsApp & email pour freelances · ©{" "}
        {new Date().getFullYear()}
      </footer>

      <Paywall open={paywall} onClose={() => setPaywall(false)} />
    </div>
  );
}
