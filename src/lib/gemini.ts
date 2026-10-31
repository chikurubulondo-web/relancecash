import type { GenerateInput, GenerateResult } from "./types";
import { generateFromTemplates } from "./templates";

const MODEL_CANDIDATES = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

function buildPrompt(input: GenerateInput): string {
  return `Tu es un expert français en recouvrement amiable pour freelances et artisans (France + Afrique francophone).
Génère des relances de paiement PROFESSIONNELLES, naturelles, prêtes à coller (WhatsApp + email).

Données:
- Client: ${input.clientName}
- Montant: ${input.amount} ${input.currency}
- Jours de retard: ${input.daysOverdue}
- Prestation: ${input.productService}
- Ton: ${input.tone} (poli = courtois; ferme = direct + délai; ultime = ultimatum / mise en demeure)
- Expéditeur: ${input.senderName || "le prestataire"}
- Réf facture: ${input.invoiceRef || "non fournie"}

Réponds UNIQUEMENT en JSON valide (pas de markdown), schéma:
{
  "whatsapp": ["msg1","msg2","msg3"],
  "emails": [{"subject":"...","body":"..."},{"subject":"...","body":"..."}]
}

Règles:
- 100% français, tutoiement/vouvoiement cohérent (vouvoiement par défaut)
- WhatsApp: courts, sauts de ligne, 1 emoji max si poli, aucun si ultime
- Emails: objet clair + corps complet avec formule de politesse
- Montants formatés style fr-FR
- Pas d'invention de lois fausses; rester crédible`;
}

export async function generateMessages(
  input: GenerateInput
): Promise<GenerateResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return generateFromTemplates(input);
  }

  for (const model of MODEL_CANDIDATES) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(input) }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(20000),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as {
        whatsapp?: string[];
        emails?: { subject: string; body: string }[];
      };
      if (
        Array.isArray(parsed.whatsapp) &&
        parsed.whatsapp.length >= 3 &&
        Array.isArray(parsed.emails) &&
        parsed.emails.length >= 2
      ) {
        return {
          whatsapp: parsed.whatsapp.slice(0, 3),
          emails: parsed.emails.slice(0, 2),
          source: "gemini",
        };
      }
    } catch {
      // try next model / fall through
    }
  }

  return generateFromTemplates(input);
}
