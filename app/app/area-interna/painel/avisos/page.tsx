"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Aviso = {
  id: number;
  titulo: string;
  mensagem: string;
  publico: string;
  destaque: boolean;
  publicado: boolean;
  data_expiracao: string | null;
};

const formularioInicial = {
  titulo: "",
  mensagem: "",
  publico: "todos",
  destaque: false,
  publicado: true,
  data_expiracao: "",
};

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [avisoEditando, setAvisoEditando] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagemSistema, setMensagemSistema] = useState("");

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    carregarAvisos();
  }, []);

  async function carregarAvisos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("avisos")
      .select(
        "id, titulo, mensagem, publico, destaque, publicado, data_expiracao"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMensagemSistema(`Erro ao carregar avisos: ${error.message}`);
      setAvisos([]);
    } else {
      setAvisos(data ?? []);
    }

    setCarregando(false);
  }

  function abrirNovoAviso() {
    setAvisoEditando(null);
    setFormulario(formularioInicial);
    setMensagemSistema("");
    setFormularioAberto(true);
  }

  function abrirEdicao(aviso: Aviso) {
    setAvisoEditando(aviso.id);

    setFormulario({
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      publico: aviso.publico,
      destaque: aviso.destaque,
      publicado: aviso.publicado,
      data_expiracao: aviso.data_expiracao ?? "",
    });

    setFormularioAberto(true);
  }

  function fecharFormulario() {
    setFormularioAberto(false);
    setAvisoEditando(null);
    setFormulario(formularioInicial);
  }

  async function salvarAviso(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formulario.titulo.trim() || !formulario.mensagem.trim()) {
      setMensagemSistema("Preencha o título e a mensagem.");
      return;
    }

    setSalvando(true);
    setMensagemSistema("");

    const dadosAviso = {
      titulo: formulario.titulo.trim(),
      mensagem: formulario.mensagem.trim(),
      publico: formulario.publico,
      destaque: formulario.destaque,
      publicado: formulario.publicado,
      data_expiracao: formulario.data_expiracao || null,
      updated_at: new Date().toISOString(),
    };

    if (avisoEditando) {
      const { error } = await supabase
        .from("avisos")
        .update(dadosAviso)
        .eq("id", avisoEditando);

      if (error) {
        setMensagemSistema(`Erro ao editar aviso: ${error.message}`);
        setSalvando(false);
        return;
      }

      setMensagemSistema("Aviso atualizado com sucesso.");
    } else {
      const { error } = await supabase
        .from("avisos")
        .insert(dadosAviso);

      if (error) {
        setMensagemSistema(`Erro ao criar aviso: ${error.message}`);
        setSalvando(false);
        return;
      }

      setMensagemSistema("Aviso criado com sucesso.");
    }

    fecharFormulario();
    await carregarAvisos();
    setSalvando(false);
  }

  async function excluirAviso(id: number) {
    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir este aviso?"
    );

    if (!confirmou) return;

    const { error } = await supabase
      .from("avisos")
      .delete()
      .eq("id", id);

    if (error) {
      setMensagemSistema(`Erro ao excluir aviso: ${error.message}`);
      return;
    }

    setMensagemSistema("Aviso excluído com sucesso.");
    await carregarAvisos();
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">COMUNICAÇÃO</p>
          <h1>Avisos</h1>
          <p>Crie comunicados e informações importantes da LASPOERJ.</p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={abrirNovoAviso}
        >
          + Novo aviso
        </button>
      </div>

      {mensagemSistema && (
        <div className="painelMensagem">
          {mensagemSistema}
        </div>
      )}

      {formularioAberto && (
        <section className="eventoFormularioCard">
          <div className="eventoFormularioCabecalho">
            <div>
              <p className="painelSubtitulo">
                {avisoEditando ? "EDITAR AVISO" : "NOVO AVISO"}
              </p>

              <h2>
                {avisoEditando ? "Editar aviso" : "Criar aviso"}
              </h2>
            </div>

            <button
              type="button"
              className="eventoFechar"
              onClick={fecharFormulario}
            >
              ×
            </button>
          </div>

          <form className="eventoFormulario" onSubmit={salvarAviso}>
            <div className="eventoCampo eventoCampoGrande">
              <label>Título</label>

              <input
                type="text"
                value={formulario.titulo}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    titulo: e.target.value,
                  })
                }
                placeholder="Ex.: Reunião extraordinária"
                required
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label>Mensagem</label>

              <textarea
                rows={5}
                value={formulario.mensagem}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    mensagem: e.target.value,
                  })
                }
                placeholder="Digite o comunicado."
                required
              />
            </div>

            <div className="eventoCampo">
              <label>Público</label>

              <select
                value={formulario.publico}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    publico: e.target.value,
                  })
                }
              >
                <option value="todos">Todos</option>
                <option value="ligantes">Ligantes</option>
                <option value="administradores">Administradores</option>
              </select>
            </div>

            <div className="eventoCampo">
              <label>Data de expiração</label>

              <input
                type="date"
                value={formulario.data_expiracao}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    data_expiracao: e.target.value,
                  })
                }
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

              <span>Destacar aviso</span>
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

              <span>Publicar aviso</span>
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
                  : avisoEditando
                  ? "Salvar alterações"
                  : "Criar aviso"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="eventosAdministracao">
        <div className="eventosAdministracaoCabecalho">
          <div>
            <h2>Avisos cadastrados</h2>
            <p>{avisos.length} avisos encontrados</p>
          </div>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">
            Carregando avisos...
          </div>
        ) : avisos.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhum aviso cadastrado</h3>
            <p>Clique em “Novo aviso” para começar.</p>
          </div>
        ) : (
          <div className="eventosTabela">
            {avisos.map((aviso) => (
              <article className="eventoAdminCard" key={aviso.id}>
                <div className="eventoAdminConteudo">
                  <div className="eventoAdminStatus">
                    <span
                      className={
                        aviso.publicado
                          ? "statusPublicado"
                          : "statusRascunho"
                      }
                    >
                      {aviso.publicado ? "Publicado" : "Oculto"}
                    </span>

                    {aviso.destaque && (
                      <span className="statusDestaque">
                        Destaque
                      </span>
                    )}
                  </div>

                  <h3>{aviso.titulo}</h3>

                  <p className="eventoAdminDescricao">
                    {aviso.mensagem}
                  </p>

                  <div className="eventoAdminDetalhes">
                    <span>Público: {aviso.publico}</span>

                    {aviso.data_expiracao && (
                      <span>
                        Expira em {aviso.data_expiracao}
                      </span>
                    )}
                  </div>
                </div>

                <div className="eventoAdminAcoes">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(aviso)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="eventoExcluir"
                    onClick={() => excluirAviso(aviso.id)}
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