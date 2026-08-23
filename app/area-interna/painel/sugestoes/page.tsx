"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Sugestao = {
  id: number;
  nome: string | null;
  categoria: string | null;
  whatsapp: string | null;
  email: string | null;
  mensagem: string | null;
  status: string | null;
  lida: boolean | null;
  observacao_interna: string | null;
  created_at: string | null;
};

const statusDisponiveis = [
  { valor: "nova", label: "Nova" },
  { valor: "em_analise", label: "Em análise" },
  { valor: "respondida", label: "Respondida" },
  { valor: "arquivada", label: "Arquivada" },
];

export default function SugestoesPage() {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemSistema, setMensagemSistema] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [selecionada, setSelecionada] = useState<Sugestao | null>(null);
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarSugestoes();
  }, []);

  async function carregarSugestoes() {
    setCarregando(true);
    setMensagemSistema("");

    const { data, error } = await supabase
      .from("sugestoes")
      .select(
        "id, nome, categoria, whatsapp, email, mensagem, status, lida, observacao_interna, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar sugestões:", error);
      setMensagemSistema(
        `Erro ao carregar sugestões: ${error.message}`
      );
      setSugestoes([]);
    } else {
      setSugestoes(data ?? []);
    }

    setCarregando(false);
  }

  const sugestoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return sugestoes.filter((sugestao) => {
      const statusAtual = sugestao.status || "nova";

      const correspondeStatus =
        filtroStatus === "todas" || statusAtual === filtroStatus;

      const texto = [
        sugestao.nome,
        sugestao.email,
        sugestao.whatsapp,
        sugestao.categoria,
        sugestao.mensagem,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const correspondeBusca =
        !termo || texto.includes(termo);

      return correspondeStatus && correspondeBusca;
    });
  }, [sugestoes, busca, filtroStatus]);

  const contadores = useMemo(() => {
    return {
      total: sugestoes.length,
      novas: sugestoes.filter(
        (s) => (s.status || "nova") === "nova"
      ).length,
      naoLidas: sugestoes.filter((s) => !s.lida).length,
      respondidas: sugestoes.filter(
        (s) => s.status === "respondida"
      ).length,
    };
  }, [sugestoes]);

  async function abrirSugestao(sugestao: Sugestao) {
    setSelecionada(sugestao);
    setObservacao(sugestao.observacao_interna ?? "");

    if (!sugestao.lida) {
      const { error } = await supabase
        .from("sugestoes")
        .update({
          lida: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sugestao.id);

      if (!error) {
        setSugestoes((atuais) =>
          atuais.map((item) =>
            item.id === sugestao.id
              ? { ...item, lida: true }
              : item
          )
        );

        setSelecionada({
          ...sugestao,
          lida: true,
        });
      }
    }
  }

  async function alterarStatus(
    id: number,
    novoStatus: string
  ) {
    setMensagemSistema("");

    const { error } = await supabase
      .from("sugestoes")
      .update({
        status: novoStatus,
        lida: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMensagemSistema(
        `Erro ao alterar status: ${error.message}`
      );
      return;
    }

    setSugestoes((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              status: novoStatus,
              lida: true,
            }
          : item
      )
    );

    if (selecionada?.id === id) {
      setSelecionada((atual) =>
        atual
          ? {
              ...atual,
              status: novoStatus,
              lida: true,
            }
          : null
      );
    }
  }

  async function salvarObservacao() {
    if (!selecionada) return;

    setSalvando(true);
    setMensagemSistema("");

    const { error } = await supabase
      .from("sugestoes")
      .update({
        observacao_interna: observacao.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selecionada.id);

    if (error) {
      setMensagemSistema(
        `Erro ao salvar observação: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setSugestoes((atuais) =>
      atuais.map((item) =>
        item.id === selecionada.id
          ? {
              ...item,
              observacao_interna:
                observacao.trim() || null,
            }
          : item
      )
    );

    setSelecionada((atual) =>
      atual
        ? {
            ...atual,
            observacao_interna:
              observacao.trim() || null,
          }
        : null
    );

    setMensagemSistema(
      "Observação interna salva com sucesso."
    );
    setSalvando(false);
  }

  async function excluirSugestao(id: number) {
    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir esta sugestão? Essa ação não poderá ser desfeita."
    );

    if (!confirmou) return;

    const { error } = await supabase
      .from("sugestoes")
      .delete()
      .eq("id", id);

    if (error) {
      setMensagemSistema(
        `Erro ao excluir sugestão: ${error.message}`
      );
      return;
    }

    setSugestoes((atuais) =>
      atuais.filter((item) => item.id !== id)
    );

    if (selecionada?.id === id) {
      setSelecionada(null);
      setObservacao("");
    }

    setMensagemSistema(
      "Sugestão excluída com sucesso."
    );
  }

  function formatarData(data: string | null) {
    if (!data) return "Data não informada";

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function nomeStatus(status: string | null) {
    const valor = status || "nova";

    return (
      statusDisponiveis.find(
        (item) => item.valor === valor
      )?.label || "Nova"
    );
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">
            CAIXA DE SUGESTÕES
          </p>

          <h1>Sugestões recebidas</h1>

          <p>
            Visualize, organize e acompanhe as mensagens
            enviadas pelo formulário público do site.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoSecundario"
          onClick={carregarSugestoes}
        >
          Atualizar
        </button>
      </div>

      {mensagemSistema && (
        <div className="painelMensagem">
          {mensagemSistema}
        </div>
      )}

      <section className="sugestoesResumoGrid">
        <div className="sugestoesResumoCard">
          <span>Total</span>
          <strong>{contadores.total}</strong>
          <p>mensagens recebidas</p>
        </div>

        <div className="sugestoesResumoCard">
          <span>Novas</span>
          <strong>{contadores.novas}</strong>
          <p>aguardando análise</p>
        </div>

        <div className="sugestoesResumoCard">
          <span>Não lidas</span>
          <strong>{contadores.naoLidas}</strong>
          <p>precisam de atenção</p>
        </div>

        <div className="sugestoesResumoCard">
          <span>Respondidas</span>
          <strong>{contadores.respondidas}</strong>
          <p>já acompanhadas</p>
        </div>
      </section>

      <section className="sugestoesPainelCard">
        <div className="sugestoesFiltros">
          <label>
            <span>Buscar</span>
            <input
              type="search"
              placeholder="Nome, e-mail, categoria ou mensagem..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>

          <label>
            <span>Status</span>
            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value)
              }
            >
              <option value="todas">
                Todas
              </option>

              {statusDisponiveis.map(
                (status) => (
                  <option
                    key={status.valor}
                    value={status.valor}
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">
            Carregando sugestões...
          </div>
        ) : sugestoesFiltradas.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhuma sugestão encontrada</h3>
            <p>
              Não existem mensagens com os filtros
              selecionados.
            </p>
          </div>
        ) : (
          <div className="sugestoesLista">
            {sugestoesFiltradas.map(
              (sugestao) => (
                <article
                  key={sugestao.id}
                  className={
                    sugestao.lida
                      ? "sugestaoAdminItem"
                      : "sugestaoAdminItem sugestaoNaoLida"
                  }
                >
                  <button
                    type="button"
                    className="sugestaoAdminPrincipal"
                    onClick={() =>
                      abrirSugestao(sugestao)
                    }
                  >
                    <div className="sugestaoAdminTopo">
                      <div>
                        {!sugestao.lida && (
                          <span className="sugestaoNovaBolinha" />
                        )}

                        <strong>
                          {sugestao.nome ||
                            "Sem nome"}
                        </strong>
                      </div>

                      <time>
                        {formatarData(
                          sugestao.created_at
                        )}
                      </time>
                    </div>

                    <div className="sugestaoAdminMeta">
                      <span>
                        {sugestao.categoria ||
                          "Não informado"}
                      </span>

                      <span
                        className={`sugestaoStatus sugestaoStatus-${sugestao.status || "nova"}`}
                      >
                        {nomeStatus(
                          sugestao.status
                        )}
                      </span>
                    </div>

                    <p>
                      {sugestao.mensagem ||
                        "Mensagem não informada."}
                    </p>
                  </button>

                  <div className="sugestaoAdminAcoesRapidas">
                    <select
                      value={
                        sugestao.status || "nova"
                      }
                      onChange={(e) =>
                        alterarStatus(
                          sugestao.id,
                          e.target.value
                        )
                      }
                      aria-label="Alterar status"
                    >
                      {statusDisponiveis.map(
                        (status) => (
                          <option
                            key={status.valor}
                            value={status.valor}
                          >
                            {status.label}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      className="eventoExcluir"
                      onClick={() =>
                        excluirSugestao(
                          sugestao.id
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {selecionada && (
        <div
          className="sugestaoModalOverlay"
          onClick={() => {
            setSelecionada(null);
            setObservacao("");
          }}
        >
          <section
            className="sugestaoModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="sugestaoModalCabecalho">
              <div>
                <p className="painelSubtitulo">
                  DETALHES DA MENSAGEM
                </p>

                <h2>
                  {selecionada.nome ||
                    "Sugestão sem nome"}
                </h2>
              </div>

              <button
                type="button"
                className="eventoFechar"
                onClick={() => {
                  setSelecionada(null);
                  setObservacao("");
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="sugestaoModalInfoGrid">
              <div>
                <span>Categoria</span>
                <strong>
                  {selecionada.categoria ||
                    "Não informada"}
                </strong>
              </div>

              <div>
                <span>Recebida em</span>
                <strong>
                  {formatarData(
                    selecionada.created_at
                  )}
                </strong>
              </div>

              <div>
                <span>E-mail</span>
                {selecionada.email ? (
                  <a
                    href={`mailto:${selecionada.email}`}
                  >
                    {selecionada.email}
                  </a>
                ) : (
                  <strong>Não informado</strong>
                )}
              </div>

              <div>
                <span>WhatsApp</span>
                {selecionada.whatsapp ? (
                  <a
                    href={`https://wa.me/55${selecionada.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selecionada.whatsapp}
                  </a>
                ) : (
                  <strong>Não informado</strong>
                )}
              </div>
            </div>

            <div className="sugestaoModalMensagem">
              <span>Mensagem</span>
              <p>
                {selecionada.mensagem ||
                  "Mensagem não informada."}
              </p>
            </div>

            <div className="sugestaoModalStatus">
              <label>
                <span>Status</span>

                <select
                  value={
                    selecionada.status || "nova"
                  }
                  onChange={(e) =>
                    alterarStatus(
                      selecionada.id,
                      e.target.value
                    )
                  }
                >
                  {statusDisponiveis.map(
                    (status) => (
                      <option
                        key={status.valor}
                        value={status.valor}
                      >
                        {status.label}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div className="sugestaoObservacao">
              <label htmlFor="observacao">
                Observação interna
              </label>

              <textarea
                id="observacao"
                rows={5}
                value={observacao}
                onChange={(e) =>
                  setObservacao(
                    e.target.value
                  )
                }
                placeholder="Ex.: Entramos em contato por WhatsApp em 17/08..."
              />

              <small>
                Esta observação aparece somente no painel administrativo.
              </small>
            </div>

            <div className="sugestaoModalAcoes">
              {selecionada.email && (
                <a
                  href={`mailto:${selecionada.email}`}
                  className="painelBotaoSecundario"
                >
                  Responder por e-mail
                </a>
              )}

              {selecionada.whatsapp && (
                <a
                  href={`https://wa.me/55${selecionada.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="painelBotaoSecundario"
                >
                  Abrir WhatsApp
                </a>
              )}

              <button
                type="button"
                className="painelBotaoPrincipal"
                onClick={salvarObservacao}
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar observação"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}