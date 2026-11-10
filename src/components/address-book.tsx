"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Address = {
  id: string;
  label: string;
  recipient: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
};

const initialForm = { label: "Casa", recipient: "", postal_code: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" };

export function AddressBook() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const response = await fetch("/api/v1/users/me/addresses");
    if (response.status === 401) {
      router.push("/login?next=/minha-conta/enderecos");
      return;
    }
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar endereços.");
    setAddresses(body.data);
    setLoaded(true);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/users/me/addresses", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push("/login?next=/minha-conta/enderecos");
          return [];
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar endereços.");
        return body.data as Address[];
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setAddresses(data);
          setLoaded(true);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : "Erro ao carregar endereços.");
          setLoaded(true);
        }
      });
    return () => controller.abort();
  }, [router]);

  async function addAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/v1/users/me/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error?.message ?? "Não foi possível salvar endereço.");
      return;
    }
    setForm(initialForm);
    await load();
    setMessage("Endereço adicionado.");
  }

  async function removeAddress(id: string) {
    const response = await fetch(`/api/v1/users/me/addresses/${id}`, { method: "DELETE" });
    const body = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      setMessage(body?.error?.message ?? "Não foi possível remover endereço.");
      return;
    }
    await load();
  }

  if (!loaded) return <div className="h-40 animate-pulse rounded-xl bg-ink/10" />;
  const inputClass = "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        {addresses.length ? addresses.map((address) => (
          <article key={address.id} className="flex justify-between gap-3 rounded-xl bg-white p-5">
            <div className="text-sm leading-6"><p className="font-semibold">{address.label} · {address.recipient}</p><p className="text-ink/65">{address.street}, {address.number}{address.complement ? `, ${address.complement}` : ""}</p><p className="text-ink/65">{address.neighborhood} · {address.city}/{address.state} · {address.postal_code}</p></div>
            <button onClick={() => removeAddress(address.id)} aria-label={`Remover endereço ${address.label}`} className="h-fit text-red-700"><Trash2 size={17} /></button>
          </article>
        )) : <p className="rounded-xl bg-white p-5 text-sm text-ink/55">Nenhum endereço cadastrado.</p>}
      </section>
      <form onSubmit={addAddress} className="grid gap-3 rounded-xl bg-white p-5 sm:grid-cols-2">
        <h2 className="font-display text-xl font-bold sm:col-span-2">Adicionar endereço</h2>
        {[
          ["label", "Identificação"], ["recipient", "Destinatário"], ["postal_code", "CEP"],
          ["street", "Rua"], ["number", "Número"], ["complement", "Complemento"],
          ["neighborhood", "Bairro"], ["city", "Cidade"], ["state", "UF"],
        ].map(([key, title]) => (
          <label key={key} className={key === "street" || key === "recipient" ? "sm:col-span-2" : ""}>
            <span className="mb-1 block text-xs font-semibold">{title}</span>
            <input required={key !== "complement"} maxLength={key === "state" ? 2 : 160} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: key === "state" ? event.target.value.toUpperCase() : event.target.value })} className={inputClass} />
          </label>
        ))}
        {message ? <p role="status" className="text-sm text-leaf sm:col-span-2">{message}</p> : null}
        <button className="rounded-full bg-forest px-5 py-3 text-sm font-bold text-white sm:col-span-2">Salvar endereço</button>
      </form>
    </div>
  );
}
