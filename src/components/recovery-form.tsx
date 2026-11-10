"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function RecoveryForm() {
  const searchParams = useSearchParams();
  const isReset = searchParams.get("reset") === "1";
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
      if (isReset && password !== confirmPassword) {
        setMessage("As senhas não coincidem.");
        return;
      }
      const response = await fetch("/api/v1/auth/recover", {
        method: isReset ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isReset
          ? { password, confirm_password: confirmPassword }
          : { email }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível concluir a operação.");
      setMessage(isReset ? "Senha atualizada. Você já pode entrar." : "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir a operação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {isReset ? (
        <>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Nova senha</span><input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Confirmar nova senha</span><input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3" /></label>
        </>
      ) : (
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">E-mail</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-3 py-3" /></label>
      )}
      {message ? <p role="status" className="rounded-lg bg-[#edf4ee] p-3 text-sm text-forest">{message}</p> : null}
      <button disabled={busy} className="w-full rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Aguarde..." : isReset ? "Atualizar senha" : "Enviar instruções"}</button>
    </form>
  );
}
