# RelanceCash

SaaS MVP — génère en ~10 secondes des **relances de paiement pro** (WhatsApp + email) à coller.  
Cible : freelances, artisans, petites boîtes FR / Afrique francophone.

**Prix early bird : 19€ paiement unique (lifetime)** — soft paywall après 2 générations gratuites.

## Lancer en local

```bash
cd /workspace/relancecash
cp .env.example .env.local   # si besoin
# Coller GEMINI_API_KEY (optionnel) + clés Stripe (obligatoire pour encaisser)
npm install
npm run build && npm start
# ou: npm run dev  → http://localhost:3000
```

## Stripe — activer les paiements (OBLIGATOIRE pour vendre)

> Tant que seules des clés **test** (`sk_test_…`) sont branchées, **aucun vrai argent** n’est encaissé.  
> Passez en **live** (`sk_live_…` / `pk_live_…`) pour monétiser.

1. Créez un compte [Stripe](https://dashboard.stripe.com/register) (FR OK).
2. **Developers → API keys** : copiez Secret + Publishable.
3. Créez le produit (test d’abord) :

```bash
STRIPE_SECRET_KEY=sk_test_xxx node scripts/create-stripe-product.mjs
```

4. Collez dans `.env.local` :

```
STRIPE_SECRET_KEY=sk_test_...          # puis sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # puis pk_live_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://VOTRE-DOMAINE
GEMINI_API_KEY=...                     # optionnel — templates FR pro sinon
```

5. Relancez l’app. Le bandeau bas du formulaire indique `Stripe test` ou `Stripe live`.

**Carte test Stripe :** `4242 4242 4242 4242`, date future, CVC quelconque.

## Déployer

- **Vercel** : `npx vercel` (login kkkl requis) — ajoutez les mêmes env vars.
- **Cloudflare Pages** : build `npm run build`, output `.next` (ou adapter OpenNext) — login requis.
- Sans compte cloud : `npm run build && npm start` + reverse proxy / tunnel.

## Contenu acquisition

Voir dossier `traffic/` + `FIRST_SALE_PLAYBOOK.md` + `STATUS.md`.
