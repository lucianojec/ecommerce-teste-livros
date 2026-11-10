"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "register" && password !== confirmPassword) {
        setMessage("As senhas não coincidem.");
        return;
      }
      const response = await fetch(`/api/v1/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(mode === "register" ? { full_name: fullName } : {}),
          email,
          password,
          ...(mode === "register" ? { confirm_password: confirmPassword } : {}),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível concluir a operação.");
      if (mode === "register" && body.data.confirmation_required) {
        setMessage("Cadastro criado. Confirme seu e-mail para entrar. No ambiente QA, o administrador pode desativar a confirmação no Supabase.");
        return;
      }
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/minha-conta");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir a operação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {mode === "register" ? (
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold">Nome completo</label>
          <input id="register-name" data-testid="register-name" autoComplete="name" required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3 outline-none focus:border-forest" />
        </div>
      ) : null}
      {mode === "register" ? (
        <div>
          <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-semibold">Confirmar senha</label>
          <input id="register-confirm-password" data-testid="register-confirm-password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3 outline-none focus:border-forest" />
        </div>
      ) : null}
      <div>
        <label htmlFor={`${mode}-email`} className="mb-1.5 block text-sm font-semibold">E-mail</label>
        <input id={`${mode}-email`} data-testid={`${mode}-email`} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3 outline-none focus:border-forest" />
      </div>
      <div>
        <label htmlFor={`${mode}-password`} className="mb-1.5 block text-sm font-semibold">Senha</label>
        <input id={`${mode}-password`} data-testid={`${mode}-password`} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 10 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3 outline-none focus:border-forest" />
        {mode === "register" ? <p className="mt-1 text-xs text-ink/50">Use ao menos 10 caracteres.</p> : null}
      </div>
      {message ? <p role="status" className="rounded-lg bg-[#edf4ee] p-3 text-sm text-forest">{message}</p> : null}
      <button data-testid={mode === "login" ? "login-submit" : "register-submit"} disabled={busy} className="w-full rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white transition hover:bg-leaf disabled:opacity-50">
        {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
      </button>
      {mode === "login" ? (
        <div className="flex justify-between gap-3 text-sm text-ink/60">
          <Link href="/cadastro" className="hover:text-forest">Criar conta</Link>
          <Link href="/recuperar-senha" className="hover:text-forest">Esqueci minha senha</Link>
        </div>
      ) : <p className="text-center text-sm text-ink/60">Já tem uma conta? <Link href="/login" className="font-semibold text-forest">Entre</Link></p>}
    </form>
  );
}
