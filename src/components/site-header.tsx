"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Heart, Search, ShoppingBag, UserRound } from "lucide-react";

export function SiteHeader() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((response) => setSignedIn(response.ok))
      .catch(() => setSignedIn(false));
  }, []);

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/livros${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    setSignedIn(false);
    router.replace("/");
  }

  return (
    <>
      <div className="bg-forest px-4 py-2 text-center text-xs tracking-wide text-white sm:text-sm">
        Frete grátis em compras acima de R$ 150 · Experiência de compra simulada para QA
      </div>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-forest" aria-label="Livraria QA, início">
            <BookOpen size={27} strokeWidth={2.2} />
            <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">livraria<span className="text-gold">qa</span></span>
          </Link>
          <form onSubmit={search} className="mx-auto hidden w-full max-w-xl sm:block">
            <label className="sr-only" htmlFor="header-search">Buscar livros</label>
            <div className="flex items-center rounded-full border border-ink/15 bg-white px-4 focus-within:ring-2 focus-within:ring-gold">
              <Search size={18} className="text-ink/45" />
              <input
                id="header-search"
                data-testid="book-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Título, autor ou assunto"
                className="w-full border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
              />
              <button className="text-sm font-semibold text-forest hover:text-leaf" type="submit">Buscar</button>
            </div>
          </form>
          <nav aria-label="Navegação principal" className="ml-auto flex items-center gap-3 sm:ml-0 sm:gap-5">
            <Link href="/favoritos" className="hidden items-center gap-1.5 text-sm text-ink/75 hover:text-forest md:flex">
              <Heart size={19} /><span>Favoritos</span>
            </Link>
            <Link href="/carrinho" className="flex items-center gap-1.5 text-sm text-ink/75 hover:text-forest" aria-label="Carrinho">
              <ShoppingBag size={20} /><span className="hidden sm:inline">Carrinho</span>
            </Link>
            {signedIn ? (
              <div className="flex items-center gap-2 text-sm">
                <Link href="/minha-conta" className="flex items-center gap-1.5 text-ink/75 hover:text-forest">
                  <UserRound size={19} /><span className="hidden sm:inline">Minha conta</span>
                </Link>
                <button onClick={logout} className="hidden text-ink/55 hover:text-forest lg:inline">Sair</button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-sm text-ink/75 hover:text-forest">
                <UserRound size={19} /><span className="hidden sm:inline">Entrar</span>
              </Link>
            )}
          </nav>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 pb-3 text-sm text-ink/65 sm:px-6 lg:px-8" aria-label="Categorias">
          <Link href="/livros" className="shrink-0 hover:text-forest">Todos os livros</Link>
          <Link href="/categorias/ficcao" className="shrink-0 hover:text-forest">Ficção</Link>
          <Link href="/categorias/tecnologia" className="shrink-0 hover:text-forest">Tecnologia</Link>
          <Link href="/categorias/desenvolvimento-pessoal" className="shrink-0 hover:text-forest">Desenvolvimento pessoal</Link>
          <Link href="/categorias/infantil" className="shrink-0 hover:text-forest">Infantil</Link>
        </nav>
      </header>
    </>
  );
}
