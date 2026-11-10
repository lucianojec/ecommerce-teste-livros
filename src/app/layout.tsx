import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Livraria QA — Sua próxima história começa aqui",
    template: "%s | Livraria QA",
  },
  description: "Loja demonstrativa de livros para treinamento de Quality Assurance e automação de testes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        <main className="min-h-[65vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
