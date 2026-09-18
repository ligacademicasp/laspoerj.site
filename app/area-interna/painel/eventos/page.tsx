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

const vazio = {
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
  const [formulario, setFormulario] = useState(vazio);
  const [editando, setEditando] = useState<number | null>(null);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("eventos")
      .select("id, titulo, descricao, data_evento, horario, local, destaque, publicado")
      .order("data_evento", { ascending: true });

    if (error) {
      console.error(error);
      setMensagem(`Erro ao carregar eventos: ${error.message}`);
      setEventos([]);
    } else {
      setEventos(data ?? []);
    }

    setCarregando(false);
  }

  function novo() {
    setEditando(null);
    setFormulario(vazio);
    setMensagem("");
    setAberto(true);
  }

  function editar(evento: Evento) {
    setEditando(evento.id);
    setFormulario({
      titulo: evento.titulo,
      descricao: evento.descricao ?? "",
      data_evento: evento.data_evento,
      horario: evento.horario?.slice(0, 5) ?? "",
      local: evento.local ?? "",
      destaque: evento.destaque,
      publicado: evento.publicado,
    });
    setAberto(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fechar() {
    setAberto(false);
    setEditando(null);
    setFormulario(vazio);
  }

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formulario.titulo.trim() || !formulario.data_evento) {
      setMensagem("Preencha o título e a data do evento.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    const dados = {
      titulo: formulario.titulo.trim(),
      descricao: formulario.descricao.trim() || null,
      data_evento: formulario.data_evento,
      horario: formulario.horario || null,
      local: formulario.local.trim() || null,
      destaque: formulario.destaque,
      publicado: formulario.publicado,
      updated_at: new Date().toISOString(),
    };

    const resultado = editando
      ? await supabase.from("eventos").update(dados).eq("id", editando)
      : await supabase.from("eventos").insert(dados);

    if (resultado.error) {
      console.error(resultado.error);
      setMensagem(`Erro ao salvar evento: ${resultado.error.message}`);
      setSalvando(false);
      return;
    }

    setMensagem(editando ? "Evento atualizado com sucesso." : "Evento criado com sucesso.");
    fechar();
    await carregarEventos();
    setSalvando(false);
  }

  async function excluir(id: number) {
    if (!window.confirm("Tem certeza de que deseja excluir este evento?")) return;

    const { error } = await supabase.from("eventos").delete().eq("id", id);

    if (error) {
      setMensagem(`Erro ao excluir evento: ${error.message}`);
      return;
    }

    setMensagem("Evento excluído com sucesso.");
    await carregarEventos();
  }

  function dataBR(data: string) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">PROGRAMAÇÃO</p>
          <h1>Eventos</h1>
          <p>Cadastre e organize os eventos exibidos no site da LASPOERJ.</p>
        </div>

        <button type="button" className="painelBotaoPrincipal" onClick={novo}>
          + Novo evento
        </button>
      </div>

      {mensagem && <div className="painelMensagem">{mensagem}</div>}

      {aberto && (
        <section className="eventoFormularioCard">
          <div className="eventoFormularioCabecalho">
            <div>
              <p className="painelSubtitulo">{editando ? "EDITAR EVENTO" : "NOVO EVENTO"}</p>
              <h2>{editando ? "Editar evento" : "Cadastrar evento"}</h2>
            </div>

            <button type="button" className="eventoFechar" onClick={fechar}>×</button>
          </div>

          <form className="eventoFormulario" onSubmit={salvar}>
            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="evento-titulo">Título</label>
              <input
                id="evento-titulo"
                value={formulario.titulo}
                onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                required
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="evento-descricao">Descrição</label>
              <textarea
                id="evento-descricao"
                rows={4}
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="evento-data">Data</label>
              <input
                id="evento-data"
                type="date"
                value={formulario.data_evento}
                onChange={(e) => setFormulario({ ...formulario, data_evento: e.target.value })}
                required
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="evento-horario">Horário</label>
              <input
                id="evento-horario"
                type="time"
                value={formulario.horario}
                onChange={(e) => setFormulario({ ...formulario, horario: e.target.value })}
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="evento-local">Local</label>
              <input
                id="evento-local"
                value={formulario.local}
                onChange={(e) => setFormulario({ ...formulario, local: e.target.value })}
              />
            </div>

            <label className="eventoCheckbox">
              <input
                type="checkbox"
                checked={formulario.destaque}
                onChange={(e) => setFormulario({ ...formulario, destaque: e.target.checked })}
              />
              <span>Destacar evento</span>
            </label>

            <label className="eventoCheckbox">
              <input
                type="checkbox"
                checked={formulario.publicado}
                onChange={(e) => setFormulario({ ...formulario, publicado: e.target.checked })}
              />
              <span>Publicar no site</span>
            </label>

            <div className="eventoFormularioAcoes">
              <button type="button" className="painelBotaoSecundario" onClick={fechar}>
                Cancelar
              </button>
              <button type="submit" className="painelBotaoPrincipal" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar evento"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="eventosAdministracao">
        <div className="eventosAdministracaoCabecalho">
          <div>
            <h2>Eventos cadastrados</h2>
            <p>{eventos.length} {eventos.length === 1 ? "evento" : "eventos"}</p>
          </div>

          <button type="button" className="painelBotaoSecundario" onClick={carregarEventos}>
            Atualizar lista
          </button>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">Carregando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhum evento cadastrado</h3>
            <p>Clique em “Novo evento” para criar o primeiro.</p>
          </div>
        ) : (
          <div className="eventosTabela">
            {eventos.map((evento) => (
              <article className="eventoAdminCard" key={evento.id}>
                <div className="eventoAdminConteudo">
                  <div className="eventoAdminStatus">
                    <span className={evento.publicado ? "statusPublicado" : "statusRascunho"}>
                      {evento.publicado ? "Publicado" : "Rascunho"}
                    </span>
                    {evento.destaque && <span className="statusDestaque">Destaque</span>}
                  </div>

                  <h3>{evento.titulo}</h3>
                  <p className="eventoAdminDescricao">{evento.descricao || "Sem descrição."}</p>

                  <div className="eventoAdminDetalhes">
                    <span>{dataBR(evento.data_evento)}</span>
                    {evento.horario && <span>{evento.horario.slice(0, 5)}</span>}
                    {evento.local && <span>{evento.local}</span>}
                  </div>
                </div>

                <div className="eventoAdminAcoes">
                  <button type="button" onClick={() => editar(evento)}>Editar</button>
                  <button type="button" className="eventoExcluir" onClick={() => excluir(evento.id)}>
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
