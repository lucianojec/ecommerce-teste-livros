import type { Metadata } from "next";
import Link from "next/link";
import { BookGrid } from "@/components/book-grid";

const labels: Record<string, string> = {
  ficcao: "Ficção",
  "desenvolvimento-pessoal": "Desenvolvimento pessoal",
  tecnologia: "Tecnologia",
  negocios: "Negócios",
  infantil: "Infantil",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: labels[slug] ?? "Categoria" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = labels[slug];
  if (!title) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><nav className="mb-6 text-sm text-ink/50"><Link href="/" className="hover:text-forest">Início</Link> / Categorias / {title}</nav><p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Explore por assunto</p><h1 className="mb-7 mt-2 font-display text-4xl font-bold">{title}</h1><BookGrid key={slug} category={slug} /></section>;
}
