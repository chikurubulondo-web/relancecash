"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const UNLOCK_KEY = "relancecash_unlocked";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    async function run() {
      if (!sessionId) {
        setStatus("fail");
        return;
      }
      try {
        const res = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (res.ok && data.paid) {
          localStorage.setItem(UNLOCK_KEY, "1");
          // also cookie for soft persistence
          document.cookie = `relancecash_unlocked=1; path=/; max-age=${60 * 60 * 24 * 365 * 5}; SameSite=Lax`;
          setStatus("ok");
        } else {
          setStatus("fail");
        }
      } catch {
        setStatus("fail");
      }
    }
    run();
  }, [sessionId]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full rounded-2xl bg-white shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="text-4xl mb-3">⏳</div>
            <h1 className="text-xl font-bold">Vérification du paiement…</h1>
          </>
        )}
        {status === "ok" && (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h1 className="text-xl font-bold text-emerald-700">
              Accès lifetime activé !
            </h1>
            <p className="mt-2 text-slate-600 text-sm">
              Merci. Vous pouvez générer des relances sans limite sur cet
              appareil.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-500"
            >
              Générer une relance
            </Link>
          </>
        )}
        {status === "fail" && (
          <>
            <div className="text-4xl mb-3">⚠️</div>
            <h1 className="text-xl font-bold">Paiement non confirmé</h1>
            <p className="mt-2 text-slate-600 text-sm">
              Si vous avez été débité, contactez le support avec votre reçu
              Stripe. Sinon, réessayez le paiement.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl border px-5 py-2.5 font-medium"
            >
              Retour
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Chargement…
        </main>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
