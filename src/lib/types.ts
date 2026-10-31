export type Currency = "EUR" | "USD" | "CDF" | "XOF" | "MAD";
export type Tone = "poli" | "ferme" | "ultime";

export interface GenerateInput {
  clientName: string;
  amount: number;
  currency: Currency;
  daysOverdue: number;
  productService: string;
  tone: Tone;
  senderName?: string;
  invoiceRef?: string;
}

export interface GenerateResult {
  whatsapp: string[];
  emails: { subject: string; body: string }[];
  source: "gemini" | "templates";
}
