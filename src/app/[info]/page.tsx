import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const pages: Record<string, { title: string; lead: string; paragraphs: string[] }> = {
  sobre: {
    title: "Sobre a Livraria QA",
    lead: "Sua próxima história começa aqui.",
    paragraphs: [
      "A Livraria QA é um ambiente fictício criado para praticar testes de software em uma jornada de e-commerce próxima de situações reais.",
      "O catálogo e os pedidos são persistidos no Supabase. Frete e pagamento são demonstrações controladas e não representam serviços financeiros ou logísticos reais.",
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    lead: "Informações sobre este ambiente de treinamento.",
    paragraphs: [
      "As compras são reais? Não. O ambiente não processa pagamentos e não gera cobranças.",
      "Como entrar? Crie uma conta ou use uma conta de teste configurada no projeto Supabase.",
      "Como simular um pagamento? Um administrador pode usar o painel de pagamentos após receber perfil ADMIN.",
      "Por que não consigo acessar um recurso? Algumas áreas previstas para QA ainda estão pendentes; consulte a documentação do projeto.",
    ],
  },
  contato: {
    title: "Contato",
    lead: "Este ambiente é dedicado a treinamento de qualidade.",
    paragraphs: [
      "Não há atendimento externo conectado. Não informe dados pessoais reais, dados de cartão ou informações confidenciais.",
      "Para suporte técnico ao projeto, consulte o README e a documentação no repositório.",
    ],
  },
  termos: {
    title: "Termos de uso",
    lead: "Aplicação demonstrativa sem operação comercial.",
    paragraphs: [
      "Esta aplicação destina-se exclusivamente a treinamento e automação de testes. Produtos, preços, pedidos, pagamentos e entregas são fictícios.",
      "Não há venda, processamento de cartão, emissão fiscal, transporte ou garantia comercial. Use apenas contas e dados fictícios.",
    ],
  },
  "politica-de-privacidade": {
    title: "Privacidade",
    lead: "Use somente informações fictícias neste ambiente.",
    paragraphs: [
      "O projeto armazena os dados de conta, endereços de teste, carrinho e pedidos no Supabase configurado pelo operador da instância.",
      "Não insira dados pessoais reais nem credenciais que você use em outros serviços. O administrador do projeto é responsável por retenção e remoção dos dados de treinamento.",
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ info: string }> }): Promise<Metadata> {
  const { info } = await params;
  return { title: pages[info]?.title ?? "Página não encontrada" };
}

export default async function InformationPage({ params }: { params: Promise<{ info: string }> }) {
  const { info } = await params;
  const page = pages[info];
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Livraria QA</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{page.title}</h1>
      <p className="mt-4 text-lg text-ink/60">{page.lead}</p>
      <div className="mt-8 space-y-5 text-sm leading-7 text-ink/70">
        {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <Link href="/" className="mt-8 inline-flex rounded-full border border-forest px-5 py-3 text-sm font-semibold text-forest hover:bg-forest hover:text-white">Voltar à loja</Link>
    </article>
  );
}
