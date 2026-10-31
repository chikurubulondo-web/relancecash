# First-sale playbook — 14 jours (2 min de lecture)

**Objectif :** 1er paiement live 19€ ≤ J14.  
**Prix :** Early bird lifetime 19€ (pas d’abo).

## Avant J1 (30–45 min au réveil)
1. Stripe Dashboard → activer compte + **clés LIVE** (`sk_live_` / `pk_live_`).
2. `STRIPE_SECRET_KEY=sk_live_… node scripts/create-stripe-product.mjs` → coller `STRIPE_PRICE_ID`.
3. Mettre `.env` LIVE + `NEXT_PUBLIC_APP_URL` = URL publique → redéployer.
4. Tester 1 paiement réel 19€ (ou 0,50€ temporaire) puis rembourser.
5. Bio TikTok/IG/LinkedIn = URL RelanceCash.

## Calendrier

| Jour | Action (≤20 min sauf *) |
|------|-------------------------|
| **J1** | Poster LinkedIn Post A + 1 groupe FB freelance + Story WA |
| **J2** | Filmer Script TikTok 1 → publier Reels + TikTok |
| **J3** | LinkedIn Post B + Reddit r/vosfinances (conseil, lien en com) |
| **J4** | TikTok Script 2 + DM 10 freelances (script cold DM) |
| **J5** | Groupe FB artisans + WhatsApp status |
| **J6** | TikTok Script 3 (artisan) |
| **J7** | LinkedIn Post C + Show HN si URL stable |
| **J8** | Product Hunt draft → schedule |
| **J9** | TikTok Script 4 avant/après |
| **J10** | Relancer les DM qui ont ouvert ; 1 témoignage si user |
| **J11** | TikTok Script 5 FCFA + groupes Afrique |
| **J12** | Indie Hackers post + directories (Betalist/Uneed) |
| **J13** | Recap : ce qui convertit → doubler ce canal |
| **J14** | Offre « early bird se termine bientôt » sur tous canaux chauds |

## Si 0 vente à J7
- Vérifier Stripe **live** + Checkout OK sur mobile.
- Baisser friction : story « 2 gratuits » + capture écran résultat.
- Poster dans **1** communauté où kkkl a déjà de la confiance (pas 10 froides).

## Métrique unique
Visiteurs → essais gratuits → checkouts → **paiements live**.  
1 paiement = succès MVP.
