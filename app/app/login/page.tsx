"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ProfileAcesso = {
  tipo_usuario: "administrador" | "orientador" | "ligante";
  ativo: boolean;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo_usuario, ativo")
        .eq("id", user.id)
        .maybeSingle();

      const perfil = profile as ProfileAcesso | null;

      if (
        perfil?.ativo &&
        (perfil.tipo_usuario === "administrador" ||
          perfil.tipo_usuario === "orientador")
      ) {
        router.replace("/area-interna/painel");
      }
    }

    verificarSessao();
  }, [router]);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error || !data.user) {
        setErro("E-mail ou senha inválidos.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("tipo_usuario, ativo")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();

        setErro(
          "Não foi possível localizar seu perfil. Entre em contato com a diretoria."
        );
        return;
      }

      const perfil = profile as ProfileAcesso;

      if (!perfil.ativo) {
        await supabase.auth.signOut();

        setErro("Seu cadastro está desativado.");
        return;
      }

      if (
        perfil.tipo_usuario === "administrador" ||
        perfil.tipo_usuario === "orientador"
      ) {
        router.replace("/area-interna/painel");
        router.refresh();
        return;
      }

      await supabase.auth.signOut();

      setErro(
        "Seu cadastro está ativo, mas sua área de acesso ainda não está disponível."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="loginPagina">
      <section className="loginCard">
        <Link href="/" className="loginVoltar">
          ← Voltar ao site
        </Link>

        <div className="loginMarca">
          <span>LASPOERJ</span>
          <small>LIGA ACADÊMICA • ESTÁCIO RJ</small>
        </div>

        <div className="loginCabecalho">
          <span className="loginEtiqueta">ÁREA INTERNA</span>

          <h1>Bem-vindo</h1>

          <p>
            Entre com seu e-mail e senha para acessar a área interna da
            LASPOERJ.
          </p>
        </div>

        <form onSubmit={entrar} className="loginFormulario">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="loginEsqueciSenha">
            <Link href="/recuperar-senha">
              Esqueci minha senha
            </Link>
          </div>

          {erro && <div className="loginErro">{erro}</div>}

          <button
            type="submit"
            className="loginBotao"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="loginCadastro">
          <span>Ainda não possui uma conta?</span>

          <Link href="/cadastro" className="loginCadastroBotao">
            Criar cadastro
          </Link>
        </div>
      </section>
    </main>
  );
}