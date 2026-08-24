"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NovaSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSessaoValida(true);
      }

      setVerificando(false);
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessaoValida(true);
        setVerificando(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function alterarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        setErro("Não foi possível alterar sua senha. Solicite um novo link.");
        return;
      }

      setSucesso("Senha alterada com sucesso.");

      setSenha("");
      setConfirmarSenha("");

      await supabase.auth.signOut();
    } catch {
      setErro("Ocorreu um erro ao alterar sua senha.");
    } finally {
      setCarregando(false);
    }
  }

  if (verificando) {
    return (
      <main className="loginPagina">
        <section className="loginCard">
          <p>Verificando link de recuperação...</p>
        </section>
      </main>
    );
  }

  if (!sessaoValida && !sucesso) {
    return (
      <main className="loginPagina">
        <section className="loginCard">
          <Link href="/login" className="loginVoltar">
            ← Voltar ao login
          </Link>

          <div className="loginMarca">
            <span>LASPOERJ</span>
            <small>LIGA ACADÊMICA • ESTÁCIO RJ</small>
          </div>

          <div className="loginCabecalho">
            <span className="loginEtiqueta">RECUPERAÇÃO DE SENHA</span>

            <h1>Link inválido</h1>

            <p>
              Este link de recuperação é inválido ou expirou. Solicite um novo
              e-mail para redefinir sua senha.
            </p>
          </div>

          <Link
            href="/recuperar-senha"
            className="loginCadastroBotao"
          >
            Solicitar novo link
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="loginPagina">
      <section className="loginCard">
        <Link href="/login" className="loginVoltar">
          ← Voltar ao login
        </Link>

        <div className="loginMarca">
          <span>LASPOERJ</span>
          <small>LIGA ACADÊMICA • ESTÁCIO RJ</small>
        </div>

        <div className="loginCabecalho">
          <span className="loginEtiqueta">NOVA SENHA</span>

          <h1>Crie uma nova senha</h1>

          <p>
            Digite abaixo a nova senha que deseja utilizar para acessar sua
            conta.
          </p>
        </div>

        {sucesso ? (
          <>
            <div className="cadastroSucesso">
              Sua senha foi alterada com sucesso.
            </div>

            <Link
              href="/login"
              className="loginCadastroBotao"
              style={{ marginTop: "20px" }}
            >
              Ir para o login
            </Link>
          </>
        ) : (
          <form onSubmit={alterarSenha} className="loginFormulario">
            <label>
              Nova senha

              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirmar nova senha

              <input
                type="password"
                value={confirmarSenha}
                onChange={(event) =>
                  setConfirmarSenha(event.target.value)
                }
                placeholder="Digite novamente a nova senha"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            {erro && <div className="loginErro">{erro}</div>}

            <button
              type="submit"
              className="loginBotao"
              disabled={carregando}
            >
              {carregando ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}