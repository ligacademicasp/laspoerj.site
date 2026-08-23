"use client";

import { FormEvent, useEffect, useState } from "react";
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

const formularioInicial = {
  titulo: "",
  descricao: "",
  data_evento: "",
  horario: "",
  local: "",
  destaque: false,
  publicado: true,
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("eventos")
      .select(
        "id, titulo, descricao, data_evento, horario, local, destaque, publicado"
      )
      .order("data_evento", { ascending: true });

    if (error) {
  console.error("ERRO COMPLETO:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  setMensagem(
    `Erro ao carregar eventos: ${error.message}${
      error.hint ? ` | Dica: ${error.hint}` : ""
    }`
  );

  setEventos([]);
  setCarregando(false);
  return;
} else {
      setEventos(data ?? []);
    }

    setCarregando(false);
  }

  function abrirNovoEvento() {
    setEventoEditando(null);
    setFormulario(formularioInicial);
    setMensagem("");
    setFormularioAberto(true);
  }

  function abrirEdicao(evento: Evento) {
    setEventoEditando(evento.id);

    setFormulario({
      titulo: evento.titulo,
      descricao: evento.descricao ?? "",
      data_evento: evento.data_evento,
      horario: evento.horario?.slice(0, 5) ?? "",
      local: evento.local ?? "",
      destaque: evento.destaque,
      publicado: evento.publicado,
    });

    setMensagem("");
    setFormularioAberto(true);
  }

  function fecharFormulario() {
    setFormularioAberto(false);
    setEventoEditando(null);
    setFormulario(formularioInicial);
  }

  async function salvarEvento(eventoFormulario: FormEvent<HTMLFormElement>) {
    eventoFormulario.preventDefault();

    if (!formulario.titulo.trim() || !formulario.data_evento) {
      setMensagem("Preencha o título e a data do evento.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    const dadosEvento = {
      titulo: formulario.titulo.trim(),
      descricao: formulario.descricao.trim() || null,
      data_evento: formulario.data_evento,
      horario: formulario.horario || null,
      local: formulario.local.trim() || null,
      destaque: formulario.destaque,
      publicado: formulario.publicado,
      updated_at: new Date().toISOString(),
    };

    if (eventoEditando) {
      const { error } = await supabase
        .from("eventos")
        .update(dadosEvento)
        .eq("id", eventoEditando);

      if (error) {
        console.error(error);
        setMensagem(`Erro ao editar evento: ${error.message}`);
        setSalvando(false);
        return;
      }

      setMensagem("Evento atualizado com sucesso.");
    } else {
      const { error } = await supabase.from("eventos").insert(dadosEvento);

      if (error) {
        console.error(error);
        setMensagem(`Erro ao criar evento: ${error.message}`);
        setSalvando(false);
        return;
      }

      setMensagem("Evento criado com sucesso.");
    }

    fecharFormulario();
    await carregarEventos();
    setSalvando(false);
  }

  async function excluirEvento(id: number) {
    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir este evento?"
    );

    if (!confirmou) return;

    setMensagem("");

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMensagem(`Erro ao excluir evento: ${error.message}`);
      return;
    }

    setMensagem("Evento excluído com sucesso.");
    await carregarEventos();
  }

  function formatarData(data: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${data}T00:00:00Z`));
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">CONTEÚDO DO SITE</p>
          <h1>Eventos</h1>
          <p>Crie e gerencie os eventos exibidos na página inicial.</p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={abrirNovoEvento}
        >
          + Novo evento
        </button>
      </div>

      {mensagem && <div className="painelMensagem">{mensagem}</div>}

      {formularioAberto && (
        <section className="eventoFormularioCard">
          <div className="eventoFormularioCabecalho">
            <div>
              <p className="painelSubtitulo">
                {eventoEditando ? "EDITAR CONTEÚDO" : "NOVO CONTEÚDO"}
              </p>

              <h2>
                {eventoEditando ? "Editar evento" : "Cadastrar novo evento"}
              </h2>
            </div>

            <button
              type="button"
              className="eventoFechar"
              onClick={fecharFormulario}
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form className="eventoFormulario" onSubmit={salvarEvento}>
            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="titulo">Título</label>

              <input
                id="titulo"
                type="text"
                value={formulario.titulo}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    titulo: e.target.value,
                  })
                }
                placeholder="Ex.: Workshop de Saúde Coletiva"
                required
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="descricao">Descrição</label>

              <textarea
                id="descricao"
                value={formulario.descricao}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    descricao: e.target.value,
                  })
                }
                placeholder="Descreva brevemente o evento."
                rows={5}
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="data_evento">Data</label>

              <input
                id="data_evento"
                type="date"
                value={formulario.data_evento}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    data_evento: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="horario">Horário</label>

              <input
                id="horario"
                type="time"
                value={formulario.horario}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    horario: e.target.value,
                  })
                }
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="local">Local</label>

              <input
                id="local"
                type="text"
                value={formulario.local}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    local: e.target.value,
                  })
                }
                placeholder="Ex.: Estácio RJ — Biblioteca"
              />
            </div>

            <label className="eventoCheckbox">
              <input
                type="checkbox"
                checked={formulario.destaque}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    destaque: e.target.checked,
                  })
                }
              />

              <span>Destacar evento na página inicial</span>
            </label>

            <label className="eventoCheckbox">
              <input
                type="checkbox"
                checked={formulario.publicado}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    publicado: e.target.checked,
                  })
                }
              />

              <span>Publicar evento no site</span>
            </label>

            <div className="eventoFormularioAcoes">
              <button
                type="button"
                className="painelBotaoSecundario"
                onClick={fecharFormulario}
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
      )}

      <section className="eventosAdministracao">
        <div className="eventosAdministracaoCabecalho">
          <div>
            <h2>Eventos cadastrados</h2>

            <p>
              {eventos.length}{" "}
              {eventos.length === 1 ? "evento encontrado" : "eventos encontrados"}
            </p>
          </div>

          <button
            type="button"
            className="painelBotaoSecundario"
            onClick={carregarEventos}
          >
            Atualizar lista
          </button>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">Carregando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhum evento cadastrado</h3>
            <p>Clique em “Novo evento” para adicionar o primeiro.</p>
          </div>
        ) : (
          <div className="eventosTabela">
            {eventos.map((evento) => (
              <article className="eventoAdminCard" key={evento.id}>
                <div className="eventoAdminData">
                  <strong>
                    {new Date(`${evento.data_evento}T00:00:00Z`).getUTCDate()}
                  </strong>

                  <span>
                    {new Intl.DateTimeFormat("pt-BR", {
                      month: "short",
                      timeZone: "UTC",
                    })
                      .format(new Date(`${evento.data_evento}T00:00:00Z`))
                      .replace(".", "")}
                  </span>
                </div>

                <div className="eventoAdminConteudo">
                  <div className="eventoAdminStatus">
                    <span
                      className={
                        evento.publicado
                          ? "statusPublicado"
                          : "statusRascunho"
                      }
                    >
                      {evento.publicado ? "Publicado" : "Oculto"}
                    </span>

                    {evento.destaque && (
                      <span className="statusDestaque">Destaque</span>
                    )}
                  </div>

                  <h3>{evento.titulo}</h3>

                  <p className="eventoAdminDescricao">
                    {evento.descricao || "Evento sem descrição."}
                  </p>

                  <div className="eventoAdminDetalhes">
                    <span>{formatarData(evento.data_evento)}</span>

                    {evento.horario && (
                      <span>{evento.horario.slice(0, 5)}</span>
                    )}

                    {evento.local && <span>{evento.local}</span>}
                  </div>
                </div>

                <div className="eventoAdminAcoes">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(evento)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="eventoExcluir"
                    onClick={() => excluirEvento(evento.id)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}