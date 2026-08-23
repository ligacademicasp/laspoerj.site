"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Evento = {
  id: number;
  titulo: string;
  descricao: string | null;
  data_evento: string;
  horario: string | null;
  local: string | null;
  destaque: boolean;
  publicado: boolean;
};

type FormularioEvento = {
  titulo: string;
  descricao: string;
  data_evento: string;
  horario: string;
  local: string;
  destaque: boolean;
  publicado: boolean;
};

const formularioInicial: FormularioEvento = {
  titulo: "",
  descricao: "",
  data_evento: "",
  horario: "",
  local: "",
  destaque: false,
  publicado: true,
};

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const diasSemana = [
  "DOM",
  "SEG",
  "TER",
  "QUA",
  "QUI",
  "SEX",
  "SÁB",
];

export default function AgendaPage() {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] =
    useState<Evento | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioEvento>(formularioInicial);

  async function carregarEventos() {
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("eventos")
      .select(
        "id, titulo, descricao, data_evento, horario, local, destaque, publicado"
      )
      .order("data_evento", { ascending: true })
      .order("horario", { ascending: true });

    if (error) {
      console.error("Erro ao carregar agenda:", error);
      setMensagem(
        `Erro ao carregar agenda: ${error.message}`
      );
      setEventos([]);
    } else {
      setEventos((data ?? []) as Evento[]);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarEventos();
  }, []);

  const ano = mesAtual.getFullYear();
  const numeroMes = mesAtual.getMonth();

  const primeiroDiaSemana = new Date(
    ano,
    numeroMes,
    1
  ).getDay();

  const quantidadeDias = new Date(
    ano,
    numeroMes + 1,
    0
  ).getDate();

  const diasMesAnterior = new Date(
    ano,
    numeroMes,
    0
  ).getDate();

  const diasCalendario = Array.from(
    { length: 42 },
    (_, indice) => {
      let dia: number;
      let mesRelativo = 0;
      let muted = false;

      if (indice < primeiroDiaSemana) {
        dia =
          diasMesAnterior -
          primeiroDiaSemana +
          indice +
          1;

        mesRelativo = -1;
        muted = true;
      } else if (
        indice >=
        primeiroDiaSemana + quantidadeDias
      ) {
        dia =
          indice -
          primeiroDiaSemana -
          quantidadeDias +
          1;

        mesRelativo = 1;
        muted = true;
      } else {
        dia =
          indice -
          primeiroDiaSemana +
          1;
      }

      const data = new Date(
        ano,
        numeroMes + mesRelativo,
        dia
      );

      const dataISO =
        `${data.getFullYear()}-${String(
          data.getMonth() + 1
        ).padStart(2, "0")}-${String(
          data.getDate()
        ).padStart(2, "0")}`;

      return {
        dia,
        dataISO,
        muted,
      };
    }
  );

  const eventosDoMes = useMemo(() => {
    return eventos.filter((evento) => {
      const [anoEvento, mesEvento] =
        evento.data_evento
          .split("-")
          .map(Number);

      return (
        anoEvento === ano &&
        mesEvento === numeroMes + 1
      );
    });
  }, [eventos, ano, numeroMes]);

  const eventosPorData = useMemo(() => {
    const mapa = new Map<string, Evento[]>();

    eventos.forEach((evento) => {
      const lista = mapa.get(
        evento.data_evento
      ) ?? [];

      lista.push(evento);
      mapa.set(evento.data_evento, lista);
    });

    return mapa;
  }, [eventos]);

  const eventosPublicados = eventos.filter(
    (evento) => evento.publicado
  ).length;

  const eventosOcultos = eventos.length - eventosPublicados;

  function formatarData(data: string) {
    const [anoData, mesData, diaData] =
      data.split("-").map(Number);

    return new Date(
      anoData,
      mesData - 1,
      diaData
    ).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function mudarMes(
    quantidade: number
  ) {
    setMesAtual(
      new Date(
        ano,
        numeroMes + quantidade,
        1
      )
    );
  }

  function voltarParaHoje() {
    const agora = new Date();

    setMesAtual(
      new Date(
        agora.getFullYear(),
        agora.getMonth(),
        1
      )
    );
  }

  function abrirNovoEvento(
    dataInicial = ""
  ) {
    setEventoEditando(null);

    setFormulario({
      ...formularioInicial,
      data_evento:
        dataInicial ||
        `${ano}-${String(
          numeroMes + 1
        ).padStart(2, "0")}-01`,
    });

    setMensagem("");
    setModalAberto(true);
  }

  function abrirEdicao(
    evento: Evento
  ) {
    setEventoEditando(evento);

    setFormulario({
      titulo: evento.titulo,
      descricao: evento.descricao ?? "",
      data_evento: evento.data_evento,
      horario: evento.horario
        ? evento.horario.slice(0, 5)
        : "",
      local: evento.local ?? "",
      destaque: evento.destaque,
      publicado: evento.publicado,
    });

    setMensagem("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEventoEditando(null);
    setFormulario(formularioInicial);
  }

  async function salvarEvento(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !formulario.titulo.trim() ||
      !formulario.data_evento
    ) {
      setMensagem(
        "Informe o título e a data do evento."
      );
      return;
    }

    setSalvando(true);
    setMensagem("");

    const payload = {
      titulo: formulario.titulo.trim(),
      descricao:
        formulario.descricao.trim() || null,
      data_evento:
        formulario.data_evento,
      horario:
        formulario.horario || null,
      local:
        formulario.local.trim() || null,
      destaque: formulario.destaque,
      publicado: formulario.publicado,
    };

    const resultado = eventoEditando
      ? await supabase
          .from("eventos")
          .update(payload)
          .eq("id", eventoEditando.id)
      : await supabase
          .from("eventos")
          .insert(payload);

    if (resultado.error) {
      console.error(
        "Erro ao salvar evento:",
        resultado.error
      );

      setMensagem(
        `Erro ao salvar evento: ${resultado.error.message}`
      );

      setSalvando(false);
      return;
    }

    setModalAberto(false);
    setEventoEditando(null);
    setFormulario(formularioInicial);

    await carregarEventos();

    setMensagem(
      eventoEditando
        ? "Evento atualizado com sucesso."
        : "Evento criado com sucesso."
    );

    setSalvando(false);
  }

  async function alternarPublicado(
    evento: Evento
  ) {
    const { error } = await supabase
      .from("eventos")
      .update({
        publicado: !evento.publicado,
      })
      .eq("id", evento.id);

    if (error) {
      setMensagem(
        `Erro ao alterar publicação: ${error.message}`
      );
      return;
    }

    await carregarEventos();

    setMensagem(
      evento.publicado
        ? "Evento ocultado do site."
        : "Evento publicado no site."
    );
  }

  async function excluirEvento(
    evento: Evento
  ) {
    const confirmou =
      window.confirm(
        `Excluir o evento "${evento.titulo}"?`
      );

    if (!confirmou) return;

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", evento.id);

    if (error) {
      setMensagem(
        `Erro ao excluir evento: ${error.message}`
      );
      return;
    }

    await carregarEventos();

    setMensagem(
      "Evento excluído com sucesso."
    );
  }

  function renderizarEvento(
    evento: Evento
  ) {
    return (
      <article
        className="agendaAdminEventoCard"
        key={evento.id}
      >
        <div className="agendaAdminEventoData">
          <strong>
            {evento.data_evento
              .split("-")[2]
              ?.padStart(2, "0")}
          </strong>

          <span>
            {(() => {
              const [
                anoEvento,
                mesEvento,
              ] =
                evento.data_evento
                  .split("-")
                  .map(Number);

              return new Date(
                anoEvento,
                mesEvento - 1,
                1
              )
                .toLocaleDateString(
                  "pt-BR",
                  {
                    month: "short",
                  }
                )
                .replace(".", "")
                .toUpperCase();
            })()}
          </span>
        </div>

        <div className="agendaAdminEventoInfo">
          <div className="agendaAdminEventoTags">
            <span
              className={
                evento.publicado
                  ? "agendaTagPublicado"
                  : "agendaTagOculto"
              }
            >
              {evento.publicado
                ? "Publicado"
                : "Oculto"}
            </span>

            {evento.destaque && (
              <span className="agendaTagDestaque">
                Destaque
              </span>
            )}
          </div>

          <h3>{evento.titulo}</h3>

          <p>
            {evento.descricao ||
              "Sem descrição cadastrada."}
          </p>

          <div className="agendaAdminEventoDetalhes">
            {evento.horario && (
              <span>
                🕒 {evento.horario.slice(0, 5)}
              </span>
            )}

            {evento.local && (
              <span>
                📍 {evento.local}
              </span>
            )}
          </div>

          <small>
            {formatarData(
              evento.data_evento
            )}
          </small>
        </div>

        <div className="agendaAdminEventoAcoes">
          <button
            type="button"
            onClick={() =>
              abrirEdicao(evento)
            }
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() =>
              alternarPublicado(evento)
            }
          >
            {evento.publicado
              ? "Ocultar"
              : "Publicar"}
          </button>

          <button
            type="button"
            className="agendaAcaoExcluir"
            onClick={() =>
              excluirEvento(evento)
            }
          >
            Excluir
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">
            PROGRAMAÇÃO
          </p>

          <h1>Agenda</h1>

          <p>
            Organize os eventos da LASPOERJ
            diretamente pelo calendário.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={() =>
            abrirNovoEvento()
          }
        >
          + Novo evento
        </button>
      </div>

      {mensagem && (
        <div className="painelMensagem">
          {mensagem}
        </div>
      )}

      <div className="agendaAdminResumo">
        <div>
          <span>Total</span>
          <strong>{eventos.length}</strong>
          <small>eventos cadastrados</small>
        </div>

        <div>
          <span>Publicados</span>
          <strong>{eventosPublicados}</strong>
          <small>visíveis no site</small>
        </div>

        <div>
          <span>Ocultos</span>
          <strong>{eventosOcultos}</strong>
          <small>não aparecem no site</small>
        </div>

        <div>
          <span>No mês</span>
          <strong>
            {eventosDoMes.length}
          </strong>
          <small>
            {nomesMeses[numeroMes]}{" "}
            {ano}
          </small>
        </div>
      </div>

      <section className="agendaAdminCalendario">
        <div className="agendaAdminCalendarioTopo">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
          >
            ‹
          </button>

          <div>
            <h2>
              {nomesMeses[numeroMes]}{" "}
              {ano}
            </h2>

            <button
              type="button"
              className="agendaHojeBtn"
              onClick={voltarParaHoje}
            >
              Hoje
            </button>
          </div>

          <button
            type="button"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

        <div className="agendaAdminSemana">
          {diasSemana.map((dia) => (
            <span key={dia}>
              {dia}
            </span>
          ))}
        </div>

        <div className="agendaAdminDias">
          {diasCalendario.map(
            (item, indice) => {
              const eventosDoDia =
                eventosPorData.get(
                  item.dataISO
                ) ?? [];

              const hojeISO =
                `${hoje.getFullYear()}-${String(
                  hoje.getMonth() + 1
                ).padStart(2, "0")}-${String(
                  hoje.getDate()
                ).padStart(2, "0")}`;

              const ehHoje =
                item.dataISO === hojeISO;

              return (
                <button
                  type="button"
                  key={`${item.dataISO}-${indice}`}
                  className={[
                    "agendaAdminDia",
                    item.muted
                      ? "agendaDiaMutado"
                      : "",
                    ehHoje
                      ? "agendaDiaHoje"
                      : "",
                    eventosDoDia.length
                      ? "agendaDiaComEvento"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    item.muted
                      ? abrirNovoEvento(
                          item.dataISO
                        )
                      : abrirNovoEvento(
                          item.dataISO
                        )
                  }
                >
                  <span>{item.dia}</span>

                  {eventosDoDia.length > 0 && (
                    <div className="agendaPontos">
                      {eventosDoDia
                        .slice(0, 3)
                        .map((evento) => (
                          <i
                            key={evento.id}
                            className={
                              evento.publicado
                                ? "agendaPontoPublicado"
                                : "agendaPontoOculto"
                            }
                          />
                        ))}
                    </div>
                  )}

                  {eventosDoDia.length > 0 && (
                    <small>
                      {eventosDoDia.length}
                    </small>
                  )}
                </button>
              );
            }
          )}
        </div>
      </section>

      <section className="agendaAdminLista">
        <div className="agendaAdminListaTopo">
          <div>
            <p className="painelSubtitulo">
              EVENTOS DO MÊS
            </p>

            <h2>
              {nomesMeses[numeroMes]}{" "}
              {ano}
            </h2>
          </div>

          <button
            type="button"
            className="painelBotaoSecundario"
            onClick={carregarEventos}
          >
            Atualizar
          </button>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">
            Carregando agenda...
          </div>
        ) : eventosDoMes.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>
              Nenhum evento neste mês
            </h3>

            <p>
              Clique em um dia do calendário
              ou use “Novo evento” para
              cadastrar a programação.
            </p>
          </div>
        ) : (
          <div className="agendaAdminEventosGrid">
            {eventosDoMes.map(
              renderizarEvento
            )}
          </div>
        )}
      </section>

      {modalAberto && (
        <div
          className="usuarioModalOverlay"
          onClick={fecharModal}
        >
          <section
            className="usuarioModal agendaAdminModal"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >
            <div className="usuarioModalCabecalho">
              <div>
                <p className="painelSubtitulo">
                  {eventoEditando
                    ? "EDITAR EVENTO"
                    : "NOVO EVENTO"}
                </p>

                <h2>
                  {eventoEditando
                    ? eventoEditando.titulo
                    : "Criar evento"}
                </h2>
              </div>

              <button
                type="button"
                className="eventoFechar"
                onClick={fecharModal}
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form
              className="agendaAdminFormulario"
              onSubmit={salvarEvento}
            >
              <label>
                <span>Título</span>

                <input
                  type="text"
                  value={
                    formulario.titulo
                  }
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      titulo:
                        e.target.value,
                    })
                  }
                  placeholder="Ex.: Reunião geral da Liga"
                  required
                />
              </label>

              <label>
                <span>Data</span>

                <input
                  type="date"
                  value={
                    formulario.data_evento
                  }
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      data_evento:
                        e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span>Horário</span>

                <input
                  type="time"
                  value={
                    formulario.horario
                  }
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      horario:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>Local</span>

                <input
                  type="text"
                  value={
                    formulario.local
                  }
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      local:
                        e.target.value,
                    })
                  }
                  placeholder="Ex.: Estácio - Campus Recreio"
                />
              </label>

              <label>
                <span>Descrição</span>

                <textarea
                  rows={5}
                  value={
                    formulario.descricao
                  }
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      descricao:
                        e.target.value,
                    })
                  }
                  placeholder="Explique o que acontecerá neste evento..."
                />
              </label>

              <div className="agendaAdminOpcoes">
                <label className="agendaCheck">
                  <input
                    type="checkbox"
                    checked={
                      formulario.publicado
                    }
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        publicado:
                          e.target.checked,
                      })
                    }
                  />

                  <div>
                    <strong>
                      Publicar no site
                    </strong>

                    <small>
                      O evento aparecerá na
                      programação e na agenda
                      pública.
                    </small>
                  </div>
                </label>

                <label className="agendaCheck">
                  <input
                    type="checkbox"
                    checked={
                      formulario.destaque
                    }
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        destaque:
                          e.target.checked,
                      })
                    }
                  />

                  <div>
                    <strong>
                      Destacar evento
                    </strong>

                    <small>
                      Usa o destaque visual na
                      seção de próximos eventos.
                    </small>
                  </div>
                </label>
              </div>

              <div className="usuarioModalAcoes">
                <button
                  type="button"
                  className="painelBotaoSecundario"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="painelBotaoPrincipal"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : eventoEditando
                    ? "Salvar alterações"
                    : "Criar evento"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}