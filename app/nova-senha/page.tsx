"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NovaSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [verificando, setVerificando] = useState(true);
  const [podeAlterar, setPodeAlterar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    let montado = true;

    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!montado) return;

      if (session) {
        setPodeAlterar(true);
      }

      setVerificando(false);
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!montado) return;

      if (
        event === "PASSWORD_RECOVERY" ||
        (event === "SIGNED_IN" && session)
      ) {
        setPodeAlterar(true);
        setVerificando(false);
        setErro("");
      }
    });

    return () => {
      montado = false;
      subscription.unsubscribe();
    };
  }, []);

  async function salvarNovaSenha(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (senha.length < 8) {
      setErro("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    if (error) {
      console.error("Erro ao redefinir senha:", error);
      setErro(
        "Não foi possível alterar a senha. O link pode ter expirado. Solicite uma nova recuperação."
      );
      setSalvando(false);
      return;
    }

    setSucesso(true);
    setSenha("");
    setConfirmacao("");
    setSalvando(false);

    await supabase.auth.signOut({ scope: "local" });
  }

  return (
    <main className="loginLaspoerjPagina">
      <section className="loginLaspoerjCard">
        <Link href="/login" className="loginLaspoerjVoltar">
          ← VOLTAR AO LOGIN
        </Link>

        <div className="loginLaspoerjMarca">
          <span>NOVA SENHA</span>
          <h1>Crie uma nova senha</h1>
          <p>Escolha uma nova senha para sua conta da LASPOERJ.</p>
        </div>

        {verificando ? (
          <div className="loginLaspoerjSucesso">
            <strong>Verificando link...</strong>
            <p>Aguarde enquanto validamos sua solicitação de recuperação.</p>
          </div>
        ) : sucesso ? (
          <div className="loginLaspoerjSucesso">
            <strong>Senha alterada com sucesso!</strong>
            <p>
              Sua nova senha já está ativa. Entre novamente para acessar sua conta.
            </p>
            <Link href="/login">Ir para o login →</Link>
          </div>
        ) : !podeAlterar ? (
          <div className="loginLaspoerjErro loginLaspoerjBloco">
            <strong>Link inválido ou expirado.</strong>
            <p>Solicite um novo link de recuperação de senha.</p>
            <Link href="/recuperar-senha">Solicitar novo link</Link>
          </div>
        ) : (
          <form className="loginLaspoerjForm" onSubmit={salvarNovaSenha}>
            <label>
              <span>Nova senha</span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              <span>Confirmar nova senha</span>
              <input
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder="Digite novamente"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            {erro && <div className="loginLaspoerjErro">{erro}</div>}

            <button type="submit" disabled={salvando}>
              {salvando ? "SALVANDO..." : "SALVAR NOVA SENHA →"}
            </button>
          </form>
        )}

        <p className="loginLaspoerjAviso">
          Utilize uma senha exclusiva e não compartilhe suas credenciais.
        </p>
      </section>
    </main>
  );
}
