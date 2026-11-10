import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookDetails } from "@/components/book-details";

export const metadata: Metadata = { title: "Detalhes do livro" };

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-ink/50">
        <Link href="/" className="hover:text-forest">Início</Link><ChevronRight size={14} /><Link href="/livros" className="hover:text-forest">Livros</Link><ChevronRight size={14} /><span className="text-ink/75">Detalhes</span>
      </nav>
      <BookDetails slug={slug} />
    </section>
  );
}
