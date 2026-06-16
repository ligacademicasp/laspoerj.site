"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const fazerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      alert("E-mail ou senha inválidos.");
      return;
    }

    router.push("/area-interna/sugestoes");
  };

  return (
    <main className="loginPage">
      <form className="loginCard" onSubmit={fazerLogin}>
        <h1>Área Restrita</h1>

        <p>
          Acesso exclusivo para Diretoria e Professores Orientadores da LASPOERJ.
        </p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "ENTRANDO..." : "ENTRAR"}
        </button>
      </form>
    </main>
  );
}