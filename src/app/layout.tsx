import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RelanceCash — Relance facture WhatsApp & email en 10 secondes",
  description:
    "Générez des relances de paiement professionnelles (WhatsApp + email) pour freelances et artisans. Relance facture WhatsApp, relance paiement freelance — poli, ferme ou ultime.",
  keywords: [
    "relance facture WhatsApp",
    "relance paiement freelance",
    "relance client impayé",
    "modèle relance facture",
    "email relance paiement",
  ],
  openGraph: {
    title: "RelanceCash — Relances de paiement pro en 10 secondes",
    description:
      "WhatsApp + email prêts à coller. Pour freelances, artisans et petites boîtes FR / Afrique francophone.",
    locale: "fr_FR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
