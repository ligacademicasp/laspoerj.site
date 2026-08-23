"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ProfileAcesso = {
  tipo_usuario: "administrador" | "orientador" | "ligante" | null;
  ativo: boolean | null;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function verificarSessaoAtual() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setVerificandoSessao(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo_usuario, ativo")
        .eq("id", user.id)
        .maybeSingle<ProfileAcesso>();

      if (
        profile?.ativo === true &&
        (profile.tipo_usuario === "administrador" ||
          profile.tipo_usuario === "orientador")
      ) {
        router.replace("/area-interna/painel");
        return;
      }

      setVerificandoSessao(false);
    }

    verificarSessaoAtual();
  }, [router]);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error || !data.user) {
      setErro("E-mail ou senha inválidos. Verifique seus dados e tente novamente.");
      setCarregando(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tipo_usuario, ativo")
      .eq("id", data.user.id)
      .maybeSingle<ProfileAcesso>();

    if (profileError || !profile) {
      await supabase.auth.signOut({ scope: "local" });
      setErro("Não foi possível localizar o perfil desta conta.");
      setCarregando(false);
      return;
    }

    if (!profile.ativo) {
      await supabase.auth.signOut({ scope: "local" });
      setErro("Esta conta está inativa. Entre em contato com a administração da LASPOERJ.");
      setCarregando(false);
      return;
    }

    if (
      profile.tipo_usuario === "administrador" ||
      profile.tipo_usuario === "orientador"
    ) {
      router.replace("/area-interna/painel");
      router.refresh();
      return;
    }

    await supabase.auth.signOut({ scope: "local" });
    setErro("Sua conta está cadastrada como Ligante. O painel administrativo é exclusivo para Diretoria e Orientadores.");
    setCarregando(false);
  }

  if (verificandoSessao) {
    return (
      <main className="loginLaspoerjPagina">
        <div className="loginLaspoerjCard loginLaspoerjCarregando">
          <strong>LASPOERJ</strong>
          <p>Verificando sua sessão...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="loginLaspoerjPagina">
      <section className="loginLaspoerjCard">
        <a href="/" className="loginLaspoerjVoltar">
          ← VOLTAR AO SITE
        </a>

        <div className="loginLaspoerjMarca">
          <span>ÁREA RESTRITA</span>
          <h1>LASPOERJ</h1>
          <p>
            Acesso administrativo da Liga Acadêmica de Saúde Pública Odontológica.
          </p>
        </div>

        <form className="loginLaspoerjForm" onSubmit={entrar}>
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

          <label>
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="loginLaspoerjRecuperarLinha">
            <Link href="/recuperar-senha" className="loginLaspoerjRecuperar">
              Esqueci minha senha
            </Link>
          </div>

          {erro && <div className="loginLaspoerjErro">{erro}</div>}

          <button type="submit" disabled={carregando}>
            {carregando ? "ENTRANDO..." : "ENTRAR NO PAINEL →"}
          </button>
        </form>

        <p className="loginLaspoerjAviso">
          O painel administrativo é destinado à Diretoria e aos Professores Orientadores autorizados.
        </p>
      </section>
    </main>
  );
}