import type { Metadata } from "next";
import { ApiDocsUi } from "@/components/api-docs-ui";

export const metadata: Metadata = { title: "Documentação da API" };

export default function ApiDocsPage() {
  return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><h1 className="mb-5 font-display text-3xl font-bold">Documentação REST</h1><p className="mb-5 text-sm text-ink/60">Pagamentos e frete são simulados. Para testar rotas privadas, use o access token retornado no login clicando em Authorize.</p><div className="overflow-hidden rounded-xl bg-white p-2"><ApiDocsUi /></div></section>;
}
