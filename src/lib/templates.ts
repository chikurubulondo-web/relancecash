import type { GenerateInput, GenerateResult } from "./types";

function fmtAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "CDF" || currency === "XOF" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function delayLabel(days: number): string {
  if (days <= 0) return "arrivée à échéance";
  if (days === 1) return "en retard d'1 jour";
  if (days < 7) return `en retard de ${days} jours`;
  if (days < 30) return `en retard de ${days} jours (plus d'une semaine)`;
  if (days < 60) return `en retard de ${days} jours (plus d'un mois)`;
  return `en retard de ${days} jours — situation critique`;
}

export function generateFromTemplates(input: GenerateInput): GenerateResult {
  const {
    clientName,
    amount,
    currency,
    daysOverdue,
    productService,
    tone,
    senderName = "votre prestataire",
    invoiceRef,
  } = input;

  const amt = fmtAmount(amount, currency);
  const delay = delayLabel(daysOverdue);
  const ref = invoiceRef?.trim() ? ` (réf. ${invoiceRef.trim()})` : "";
  const first = clientName.trim() || "Madame, Monsieur";
  const me = senderName.trim() || "votre prestataire";
  const svc = productService.trim() || "la prestation réalisée";

  const wa: string[] = [];
  const emails: { subject: string; body: string }[] = [];

  if (tone === "poli") {
    wa.push(
      `Bonjour ${first} 👋\n\nJ'espère que vous allez bien. Je me permets un petit rappel concernant la facture${ref} de ${amt} pour ${svc}, actuellement ${delay}.\n\nPouvez-vous me confirmer la date de règlement prévue ? Merci beaucoup.\n\nCordialement,\n${me}`
    );
    wa.push(
      `Bonjour ${first},\n\nSuite à mon précédent message, je n'ai pas encore reçu le règlement de ${amt} pour ${svc}${ref}.\n\nSerait-il possible de procéder au paiement cette semaine ? Je reste disponible si vous avez une question sur la facture.\n\nMerci d'avance,\n${me}`
    );
    wa.push(
      `Bonjour ${first},\n\nDernier rappel amical : la facture de ${amt} pour ${svc}${ref} est toujours ${delay}.\n\nMerci de me tenir informé(e) du statut du paiement. Une fois réglée, je vous enverrai immédiatement l'accusé de réception.\n\nBien à vous,\n${me}`
    );
    emails.push({
      subject: `Rappel amical — facture ${amt}${ref}`,
      body: `Bonjour ${first},\n\nJ'espère que ce message vous trouve bien.\n\nJe me permets de vous écrire concernant la facture${ref} d'un montant de ${amt} relative à ${svc}. Cette facture est actuellement ${delay}.\n\nPourriez-vous me confirmer la date à laquelle le règlement sera effectué ? Si un problème ou une question bloque le paiement, n'hésitez pas à m'en faire part afin que nous trouvions une solution rapidement.\n\nJe vous remercie par avance pour votre retour.\n\nCordialement,\n${me}`,
    });
    emails.push({
      subject: `Suite — règlement en attente (${amt})`,
      body: `Bonjour ${first},\n\nJe me permets de revenir vers vous au sujet du règlement de ${amt} pour ${svc}${ref}, toujours ${delay}.\n\nSans nouvelle de votre part, je vous serais reconnaissant(e) de bien vouloir procéder au paiement ou de m'indiquer un échéancier.\n\nMerci pour votre collaboration.\n\nCordialement,\n${me}`,
    });
  } else if (tone === "ferme") {
    wa.push(
      `Bonjour ${first},\n\nJe vous contacte concernant la facture${ref} de ${amt} pour ${svc}, ${delay}.\n\nMerci de procéder au règlement sous 5 jours ouvrés et de m'envoyer la preuve de paiement.\n\n${me}`
    );
    wa.push(
      `${first}, rappel : ${amt} toujours impayés pour ${svc}${ref} (${delay}).\n\nSans règlement sous 72h, je serai contraint(e) d'engager les démarches de recouvrement prévues au contrat.\n\nMerci de régulariser rapidement.\n${me}`
    );
    wa.push(
      `${first}, dernière relance avant escalade.\n\nFacture ${amt}${ref} — ${svc} — ${delay}.\n\nRèglement exigé sous 48h. Passé ce délai, mise en demeure formelle.\n\n${me}`
    );
    emails.push({
      subject: `Relance — facture impayée ${amt}${ref}`,
      body: `Bonjour ${first},\n\nMalgré nos précédents échanges, la facture${ref} d'un montant de ${amt} concernant ${svc} demeure impayée (${delay}).\n\nJe vous demande de procéder au règlement complet sous cinq (5) jours ouvrés à compter de la réception de ce message, et de me transmettre la preuve de paiement.\n\nÀ défaut, je me réserve le droit d'engager les procédures de recouvrement prévues par la loi et/ou notre contrat.\n\nCordialement,\n${me}`,
    });
    emails.push({
      subject: `Mise en demeure préalable — ${amt}${ref}`,
      body: `Bonjour ${first},\n\nLe montant de ${amt} relatif à ${svc}${ref} est toujours ${delay}.\n\nCeci constitue une relance ferme. Sans règlement sous 72 heures, une mise en demeure formelle vous sera adressée, avec frais éventuels à votre charge.\n\nJe reste joignable pour un règlement immédiat.\n\nCordialement,\n${me}`,
    });
  } else {
    // ultime
    wa.push(
      `⚠️ ${first} — ULTIMATUM\n\nFacture ${amt}${ref} pour ${svc} : ${delay}.\n\nRèglement INTEGRAL exigé sous 48h. Passé ce délai : mise en demeure + signalement éventuel + frais de recouvrement.\n\nEnvoyez la preuve de virement dès que c'est fait.\n${me}`
    );
    wa.push(
      `${first}, dernier message avant procédure.\n\n${amt} dus pour ${svc}${ref}. Délai de grâce : 24h.\n\nSans paiement, dossier transmis pour recouvrement. Les frais seront ajoutés à la dette.\n\n${me}`
    );
    wa.push(
      `NOTIFICATION FORMELLE — ${first}\n\nCréance : ${amt}\nObjet : ${svc}${ref}\nStatut : ${delay}\n\nDernier délai avant mise en demeure recommandée et/ou action judiciaire selon juridiction applicable.\n\nRégularisez immédiatement.\n${me}`
    );
    emails.push({
      subject: `ULTIMATUM — paiement ${amt} exigé sous 48h${ref}`,
      body: `Madame, Monsieur ${first},\n\nMalgré nos relances, la somme de ${amt} correspondant à ${svc}${ref} reste due (${delay}).\n\nPAR LA PRÉSENTE, je vous mets en demeure de régler l'intégralité de cette créance sous quarante-huit (48) heures.\n\nÀ défaut de paiement dans ce délai, je procéderai sans autre avis à :\n• l'émission d'une mise en demeure formelle ;\n• l'engagement de procédures de recouvrement, y compris judiciaires si nécessaire ;\n• la facturation des frais et intérêts de retard applicables.\n\nSeul un paiement intégral accompagné de la preuve de virement permettra de clore ce dossier à l'amiable.\n\n${me}`,
    });
    emails.push({
      subject: `Mise en demeure — créance ${amt}${ref}`,
      body: `Madame, Monsieur ${first},\n\nLa présente vaut mise en demeure de payer la somme de ${amt} au titre de ${svc}${ref}, actuellement ${delay}.\n\nVous disposez d'un délai de HUIT (8) JOURS à compter de la réception de ce courrier pour régler cette créance.\n\nPassé ce délai, et sans règlement, je saisirai les voies de droit appropriées. Tous frais, dépens et intérêts de retard seront à votre charge.\n\nConservez ce message comme preuve de mise en demeure.\n\n${me}`,
    });
  }

  return { whatsapp: wa, emails, source: "templates" };
}
