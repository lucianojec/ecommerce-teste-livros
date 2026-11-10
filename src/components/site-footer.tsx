import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <p className="font-display text-2xl font-bold">Livraria QA</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">Sua próxima história começa aqui. Uma loja fictícia criada para praticar qualidade de software com cenários reais de e-commerce.</p>
        </div>
        <div>
          <p className="font-semibold">Institucional</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/sobre" className="hover:text-white">Sobre a livraria</Link>
            <Link href="/faq" className="hover:text-white">Perguntas frequentes</Link>
            <Link href="/contato" className="hover:text-white">Contato</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Projeto de treinamento</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/api-docs" className="hover:text-white">Documentação da API</Link>
            <Link href="/admin" className="hover:text-white">Área administrativa</Link>
            <span>Pagamentos e frete são simulados.</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Livraria QA · Ambiente fictício, sem transações financeiras reais.
      </div>
    </footer>
  );
}
