"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (senha.length < 8) {
      setErro("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
          },
        },
      });

      if (error) {
        setErro(error.message);
        return;
      }

      if (!data.user) {
        setErro("Não foi possível concluir o cadastro.");
        return;
      }

      setSucesso(
        "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta."
      );

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
    } catch {
      setErro("Ocorreu um erro ao realizar o cadastro.");
    } finally {
      setCarregando(false);
    }
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
          <span className="loginEtiqueta">CADASTRO</span>

          <h1>Crie sua conta</h1>

          <p>
            Cadastre-se para fazer parte da área de membros da LASPOERJ.
          </p>
        </div>

        <form
          onSubmit={cadastrar}
          className="loginFormulario"
        >
          <label>
            Nome completo

            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite seu nome completo"
              required
            />
          </label>

          <label>
            E-mail

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />
          </label>

          <label>
            Senha

            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Mínimo de 8 caracteres"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirmar senha

            <input
              type="password"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(event.target.value)
              }
              placeholder="Digite novamente sua senha"
              minLength={8}
              required
            />
          </label>

          {erro && (
            <div className="loginErro">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="cadastroSucesso">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="loginBotao"
            disabled={carregando}
          >
            {carregando
              ? "Criando cadastro..."
              : "Criar minha conta"}
          </button>
        </form>

        <div className="loginCadastro">
          <span>Já possui cadastro?</span>

          <Link
            href="/login"
            className="loginCadastroBotao"
          >
            Fazer login
          </Link>
        </div>
      </section>
    </main>
  );
}