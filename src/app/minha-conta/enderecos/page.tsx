import type { Metadata } from "next";
import Link from "next/link";
import { AddressBook } from "@/components/address-book";

export const metadata: Metadata = { title: "Meus endereços" };

export default function AddressesPage() {
  return <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Link href="/minha-conta" className="text-sm text-forest hover:underline">← Minha conta</Link><h1 className="mb-7 mt-3 font-display text-4xl font-bold">Meus endereços</h1><AddressBook /></section>;
}
