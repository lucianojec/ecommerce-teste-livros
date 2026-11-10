import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BookGrid } from "@/components/book-grid";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-6 -top-14 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80"><Sparkles size={14} className="text-gold" /> Descubra algo novo hoje</p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Sua próxima história <span className="text-gold">começa aqui.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70 sm:text-lg">Encontre livros que inspiram ideias, abrem caminhos e fazem companhia. Escolha sua próxima leitura.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/livros" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-[#e6bd70]">Explorar livros <ArrowRight size={17} /></Link>
              <Link href="/sobre" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Conheça a Livraria QA</Link>
            </div>
            <p className="mt-6 text-xs text-white/45">Ambiente de treinamento · Compras e pagamentos simulados</p>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="relative h-[330px] w-[390px]">
              <div className="book-cover absolute left-10 top-4 flex h-72 w-52 -rotate-6 items-end rounded-lg p-5 text-white shadow-2xl">
                <span className="font-display text-2xl font-bold">O mapa das pequenas coragens</span>
              </div>
              <div className="absolute right-4 top-12 flex h-64 w-44 rotate-6 items-end rounded-lg bg-gradient-to-br from-gold to-[#804b32] p-5 text-white shadow-2xl">
                <span className="font-display text-xl font-bold">Tempo para o essencial</span>
              </div>
              <div className="absolute bottom-1 left-32 flex h-48 w-36 rotate-2 items-end rounded-lg bg-gradient-to-br from-[#738c92] to-[#263e48] p-4 text-white shadow-2xl">
                <span className="font-display text-lg font-bold">A cidade das janelas azuis</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Uma boa história espera</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Em destaque</h2>
          </div>
          <Link href="/livros" className="hidden items-center gap-1 text-sm font-semibold text-forest hover:text-leaf sm:inline-flex">Ver catálogo <ArrowRight size={16} /></Link>
        </div>
        <BookGrid />
      </section>
      <section className="bg-[#eeeae0]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ["01", "Catálogo conectado", "Livros carregados diretamente do banco de dados Supabase."],
            ["02", "Compra demonstrativa", "Carrinho, frete, pedidos e pagamentos em modo de simulação."],
            ["03", "Feito para QA", "APIs REST com dados previsíveis e seletores estáveis para automação."],
          ].map(([number, title, copy]) => (
            <div key={number} className="flex gap-4">
              <span className="font-display text-3xl font-bold text-gold">{number}</span>
              <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-ink/60">{copy}</p></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
