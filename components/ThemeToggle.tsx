"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;

  raiz.dataset.theme = tema;
  raiz.style.colorScheme = tema;

  localStorage.setItem("laspoerj-theme", tema);
}

export default function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("light");
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const temaAtual =
      document.documentElement.dataset.theme === "dark"
        ? "dark"
        : "light";

    setTema(temaAtual);
    setPronto(true);
  }, []);

  function alternarTema() {
    const novoTema: Tema = tema === "dark" ? "light" : "dark";

    setTema(novoTema);
    aplicarTema(novoTema);
  }

  const escuro = tema === "dark";

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={alternarTema}
      aria-label={
        escuro ? "Ativar modo claro" : "Ativar modo escuro"
      }
      title={
        escuro ? "Ativar modo claro" : "Ativar modo escuro"
      }
      suppressHydrationWarning
    >
      <span className="themeToggleIcone" aria-hidden="true">
        {pronto && escuro ? (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        )}
      </span>

      <span className="themeToggleTexto">
        {pronto && escuro ? "Claro" : "Escuro"}
      </span>
    </button>
  );
}
