"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Configuracao = {
  id: number;
  chave: string;
  valor: string | null;
  descricao: string | null;
};

const grupos = [
  {
    titulo: "Sobre a LASPOERJ",
    descricao:
      "Textos institucionais exibidos na seção Sobre do site.",
    chaves: [
      "sobre_titulo",
      "sobre_texto_1",
      "sobre_texto_2",
      "sobre_texto_3",
      "compromisso_titulo",
      "compromisso_texto",
    ],
  },
  {
    titulo: "Contato",
    descricao:
      "Informações públicas utilizadas na seção de contato.",
    chaves: [
      "instagram",
      "email_contato",
      "endereco",
    ],
  },
];

const rotulos: Record<string, string> = {
  sobre_titulo: "Título da seção Sobre",
  sobre_texto_1: "Primeiro parágrafo",
  sobre_texto_2: "Segundo parágrafo",
  sobre_texto_3: "Terceiro parágrafo",
  compromisso_titulo: "Título do compromisso",
  compromisso_texto: "Texto do compromisso",
  instagram: "Instagram",
  email_contato: "E-mail de contato",
  endereco: "Endereço",
};

const camposLongos = new Set([
  "sobre_texto_1",
  "sobre_texto_2",
  "sobre_texto_3",
  "compromisso_texto",
  "endereco",
]);

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] =
    useState<Configuracao[]>([]);
  const [valores, setValores] =
    useState<Record<string, string>>({});
  const [carregando, setCarregando] =
    useState(true);
  const [salvando, setSalvando] =
    useState(false);
  const [mensagem, setMensagem] =
    useState("");

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("configuracoes_site")
      .select("id, chave, valor, descricao")
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Erro ao carregar configurações:",
        error
      );

      setMensagem(
        `Erro ao carregar configurações: ${error.message}`
      );
      setCarregando(false);
      return;
    }

    const lista = (data ?? []) as Configuracao[];

    setConfiguracoes(lista);

    const mapa: Record<string, string> = {};

    lista.forEach((item) => {
      mapa[item.chave] = item.valor ?? "";
    });

    setValores(mapa);
    setCarregando(false);
  }

  function alterarValor(
    chave: string,
    valor: string
  ) {
    setValores((atual) => ({
      ...atual,
      [chave]: valor,
    }));
  }

  async function salvarTudo() {
    setSalvando(true);
    setMensagem("");

    try {
      for (const configuracao of configuracoes) {
        const { error } = await supabase
          .from("configuracoes_site")
          .update({
            valor:
              valores[configuracao.chave] ?? "",
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", configuracao.id);

        if (error) {
          throw error;
        }
      }

      setMensagem(
        "Configurações salvas com sucesso."
      );
    } catch (error: any) {
      console.error(
        "Erro ao salvar configurações:",
        error
      );

      setMensagem(
        `Erro ao salvar: ${
          error?.message ||
          "não foi possível concluir a alteração."
        }`
      );
    } finally {
      setSalvando(false);
    }
  }

  function obterConfiguracao(chave: string) {
    return configuracoes.find(
      (item) => item.chave === chave
    );
  }

  if (carregando) {
    return (
      <div className="painelDashboard">
        <div className="painelEstadoVazio">
          Carregando configurações...
        </div>
      </div>
    );
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">
            IDENTIDADE DO SITE
          </p>

          <h1>Configurações</h1>

          <p>
            Edite textos institucionais e
            informações públicas sem precisar
            alterar o código do site.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={salvarTudo}
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : "Salvar alterações"}
        </button>
      </div>

      {mensagem && (
        <div className="painelMensagem">
          {mensagem}
        </div>
      )}

      <div className="configuracoesGrid">
        {grupos.map((grupo) => (
          <section
            className="configuracoesCard"
            key={grupo.titulo}
          >
            <div className="configuracoesCardTopo">
              <h2>{grupo.titulo}</h2>
              <p>{grupo.descricao}</p>
            </div>

            <div className="configuracoesCampos">
              {grupo.chaves.map((chave) => {
                const configuracao =
                  obterConfiguracao(chave);

                if (!configuracao) {
                  return null;
                }

                const longo =
                  camposLongos.has(chave);

                return (
                  <label key={chave}>
                    <span>
                      {rotulos[chave] || chave}
                    </span>

                    {longo ? (
                      <textarea
                        rows={
                          chave === "endereco"
                            ? 3
                            : 5
                        }
                        value={
                          valores[chave] ?? ""
                        }
                        onChange={(e) =>
                          alterarValor(
                            chave,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <input
                        type={
                          chave ===
                          "email_contato"
                            ? "email"
                            : "text"
                        }
                        value={
                          valores[chave] ?? ""
                        }
                        onChange={(e) =>
                          alterarValor(
                            chave,
                            e.target.value
                          )
                        }
                      />
                    )}

                    {configuracao.descricao && (
                      <small>
                        {configuracao.descricao}
                      </small>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="configuracoesRodape">
        <button
          type="button"
          className="painelBotaoSecundario"
          onClick={carregarConfiguracoes}
          disabled={salvando}
        >
          Descartar alterações
        </button>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={salvarTudo}
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}