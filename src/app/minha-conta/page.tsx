import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";

export const metadata: Metadata = { title: "Minha conta" };

export default function AccountPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><h1 className="mb-7 font-display text-4xl font-bold">Minha conta</h1><AccountView /></section>;
}
