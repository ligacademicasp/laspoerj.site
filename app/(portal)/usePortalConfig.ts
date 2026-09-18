"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Configuracoes = Record<string, string>;

export default function usePortalConfig() {
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("configuracoes_site")
        .select("chave, valor");

      if (error) {
        console.error("Erro ao carregar configurações do portal:", error);
        setCarregando(false);
        return;
      }

      const mapa: Configuracoes = {};

      (data ?? []).forEach((item) => {
        mapa[item.chave] = item.valor ?? "";
      });

      setConfiguracoes(mapa);
      setCarregando(false);
    }

    carregar();
  }, []);

  const config = useCallback(
    (chave: string, fallback: string) => {
      const valor = configuracoes[chave];

      return valor && valor.trim() ? valor : fallback;
    },
    [configuracoes]
  );

  return {
    config,
    configuracoes,
    carregando,
  };
}
