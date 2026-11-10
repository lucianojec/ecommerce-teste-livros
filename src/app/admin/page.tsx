import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = { title: "Administração" };

export default function AdminPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Área restrita</p><h1 className="mb-7 mt-2 font-display text-4xl font-bold">Painel administrativo</h1><AdminDashboard /></section>;
}
