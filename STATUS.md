# RelanceCash — STATUS (31 oct 2026, Europe/Paris)

## 1. Chemin projet
`/workspace/relancecash/`

## 2. Lancer en local
```bash
cd /workspace/relancecash
npm install
npm run build && npm start   # → http://localhost:3000
# ou: npm run dev
```
Serveur de prod actuellement démarré sur le box : **http://127.0.0.1:3000** (OK 200).

## 3. URL publique
**Pas d’URL publique stable ce soir.**  
Tentatives : Cloudflare quick tunnel (`*.trycloudflare.com`) et localtunnel (`*.loca.lt`) → échec réseau sandbox (QUIC/egress timeout / 502).  
**Bloqueur deploy sans login kkkl :** Vercel / Cloudflare Pages / Railway exigent un compte. Aucun tunnel gratuit ne tient depuis ce box.

**Quand kkkl est réveillé (5 min) :**  
`npx vercel` (ou brancher le repo GitHub) + coller les env vars → URL `*.vercel.app`.

## 4. Stripe
| Champ | Valeur |
|-------|--------|
| Statut | **NON CONFIGURÉ** — aucune clé dans `.env.local` |
| Mode | `unset` (ni test ni live) |
| Prix choisi | **19€ one-time** Early bird lifetime |
| Script produit | `node scripts/create-stripe-product.mjs` |

Checkout API répond `configured:false` honnêtement. **Aucun paiement réel ni test n’est possible tant que kkkl n’a pas collé les clés.**  
Ne pas communiquer « paiements live » avant `sk_live_` + price id.

## 5. Génération
- Gemini (`gemini-3.6-flash` + fallbacks) : **fonctionne** (testé, `source: gemini`).
- Fallback templates FR pro : toujours dispo si Gemini down.
- Soft paywall : 2 free (localStorage) puis modal 19€.

## 6. Pitch FR (à coller demain)
> RelanceCash génère en 10 secondes des relances de paiement professionnelles (3 WhatsApp + 2 emails) pour freelances, artisans et petites boîtes. Choisis le ton — poli, ferme ou ultime — colle, envoie, et arrête de stresser sur le wording à minuit. 2 essais gratuits, puis early bird **19€ à vie**. Pour ceux qui en ont marre des impayés en France et en Afrique francophone.

## 7. Checklist 1ère vente (au réveil)
1. Compte Stripe → clés **LIVE** (+ test d’abord si besoin).
2. `STRIPE_SECRET_KEY=sk_… node scripts/create-stripe-product.mjs` → coller `STRIPE_PRICE_ID`.
3. Remplir `.env.local` / Vercel env : `STRIPE_*`, `NEXT_PUBLIC_*`, `GEMINI_API_KEY`, `NEXT_PUBLIC_APP_URL`.
4. Deploy Vercel/Cloudflare → tester Checkout mobile.
5. Bio TikTok/LinkedIn = URL.
6. Suivre `FIRST_SALE_PLAYBOOK.md` (14 jours).
7. Assets trafic prêts dans `traffic/`.

## Trafic livré
- `traffic/01-tiktok-reels-scripts.md` — 5 scripts
- `traffic/02-linkedin-posts.md` — 3 posts
- `traffic/03-target-places.md` — 10 cibles
- `traffic/04-show-hn.md` — Show HN prêt
- `traffic/05-product-hunt-draft.md`
- `traffic/06-whatsapp-status.md`
- `traffic/07-directories.md`
- `traffic/08-facebook-post.md`
- `FIRST_SALE_PLAYBOOK.md`
