"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function enviarRecuperacao(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    setSucesso(false);

    const redirectTo = `${window.location.origin}/nova-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    );

    if (error) {
      console.error("Erro ao enviar recuperação:", error);
      setErro("Não foi possível enviar as instruções agora. Tente novamente em alguns minutos.");
      setEnviando(false);
      return;
    }

    setSucesso(true);
    setEnviando(false);
  }

  return (
    <main className="loginLaspoerjPagina">
      <section className="loginLaspoerjCard">
        <Link href="/login" className="loginLaspoerjVoltar">
          ← VOLTAR AO LOGIN
        </Link>

        <div className="loginLaspoerjMarca">
          <span>RECUPERAÇÃO DE ACESSO</span>
          <h1>Redefinir senha</h1>
          <p>
            Informe o e-mail cadastrado na LASPOERJ. Você receberá um link para criar uma nova senha.
          </p>
        </div>

        {!sucesso ? (
          <form className="loginLaspoerjForm" onSubmit={enviarRecuperacao}>
            <label>
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                required
              />
            </label>

            {erro && <div className="loginLaspoerjErro">{erro}</div>}

            <button type="submit" disabled={enviando}>
              {enviando ? "ENVIANDO..." : "ENVIAR LINK DE RECUPERAÇÃO →"}
            </button>
          </form>
        ) : (
          <div className="loginLaspoerjSucesso">
            <strong>Verifique seu e-mail</strong>
            <p>
              Se o endereço estiver cadastrado, você receberá as instruções para redefinir sua senha.
            </p>
            <Link href="/login">Voltar ao login</Link>
          </div>
        )}

        <p className="loginLaspoerjAviso">
          Por segurança, não informamos se um e-mail específico está ou não cadastrado.
        </p>
      </section>
    </main>
  );
}