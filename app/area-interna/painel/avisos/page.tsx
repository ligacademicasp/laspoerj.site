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

const vazio = {
  titulo: "",
  mensagem: "",
  publico: "todos",
  destaque: false,
  publicado: true,
  data_expiracao: "",
};

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [formulario, setFormulario] = useState(vazio);
  const [editando, setEditando] = useState<number | null>(null);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarAvisos();
  }, []);

  async function carregarAvisos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("avisos")
      .select("id, titulo, mensagem, publico, destaque, publicado, data_expiracao")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMensagem(`Erro ao carregar avisos: ${error.message}`);
      setAvisos([]);
    } else {
      setAvisos(data ?? []);
    }

    setCarregando(false);
  }

  function novo() {
    setEditando(null);
    setFormulario(vazio);
    setMensagem("");
    setAberto(true);
  }

  function editar(aviso: Aviso) {
    setEditando(aviso.id);
    setFormulario({
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      publico: aviso.publico || "todos",
      destaque: aviso.destaque,
      publicado: aviso.publicado,
      data_expiracao: aviso.data_expiracao ?? "",
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

    if (!formulario.titulo.trim() || !formulario.mensagem.trim()) {
      setMensagem("Preencha o título e a mensagem do aviso.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    const dados = {
      titulo: formulario.titulo.trim(),
      mensagem: formulario.mensagem.trim(),
      publico: formulario.publico,
      destaque: formulario.destaque,
      publicado: formulario.publicado,
      data_expiracao: formulario.data_expiracao || null,
      updated_at: new Date().toISOString(),
    };

    const resultado = editando
      ? await supabase.from("avisos").update(dados).eq("id", editando)
      : await supabase.from("avisos").insert(dados);

    if (resultado.error) {
      console.error(resultado.error);
      setMensagem(`Erro ao salvar aviso: ${resultado.error.message}`);
      setSalvando(false);
      return;
    }

    setMensagem(editando ? "Aviso atualizado com sucesso." : "Aviso criado com sucesso.");
    fechar();
    await carregarAvisos();
    setSalvando(false);
  }

  async function excluir(id: number) {
    if (!window.confirm("Tem certeza de que deseja excluir este aviso?")) return;

    const { error } = await supabase.from("avisos").delete().eq("id", id);

    if (error) {
      setMensagem(`Erro ao excluir aviso: ${error.message}`);
      return;
    }

    setMensagem("Aviso excluído com sucesso.");
    await carregarAvisos();
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">COMUNICAÇÃO</p>
          <h1>Avisos</h1>
          <p>Gerencie os comunicados que aparecem na página pública da LASPOERJ.</p>
        </div>

        <button type="button" className="painelBotaoPrincipal" onClick={novo}>
          + Novo aviso
        </button>
      </div>

      {mensagem && <div className="painelMensagem">{mensagem}</div>}

      {aberto && (
        <section className="eventoFormularioCard">
          <div className="eventoFormularioCabecalho">
            <div>
              <p className="painelSubtitulo">{editando ? "EDITAR AVISO" : "NOVO AVISO"}</p>
              <h2>{editando ? "Editar aviso" : "Criar aviso"}</h2>
            </div>

            <button type="button" className="eventoFechar" onClick={fechar}>×</button>
          </div>

          <form className="eventoFormulario" onSubmit={salvar}>
            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="aviso-titulo">Título</label>
              <input
                id="aviso-titulo"
                value={formulario.titulo}
                onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                required
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="aviso-mensagem">Mensagem</label>
              <textarea
                id="aviso-mensagem"
                rows={6}
                value={formulario.mensagem}
                onChange={(e) => setFormulario({ ...formulario, mensagem: e.target.value })}
                required
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="aviso-publico">Público</label>
              <select
                id="aviso-publico"
                value={formulario.publico}
                onChange={(e) => setFormulario({ ...formulario, publico: e.target.value })}
              >
                <option value="todos">Todos</option>
                <option value="ligantes">Ligantes</option>
                <option value="diretoria">Diretoria</option>
              </select>
            </div>

            <div className="eventoCampo">
              <label htmlFor="aviso-expira">Expira em</label>
              <input
                id="aviso-expira"
                type="date"
                value={formulario.data_expiracao}
                onChange={(e) => setFormulario({ ...formulario, data_expiracao: e.target.value })}
              />
            </div>

            <label className="eventoCheckbox">
              <input
                type="checkbox"
                checked={formulario.destaque}
                onChange={(e) => setFormulario({ ...formulario, destaque: e.target.checked })}
              />
              <span>Destacar aviso</span>
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
                {salvando ? "Salvando..." : "Salvar aviso"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="eventosAdministracao">
        <div className="eventosAdministracaoCabecalho">
          <div>
            <h2>Avisos cadastrados</h2>
            <p>{avisos.length} {avisos.length === 1 ? "aviso" : "avisos"}</p>
          </div>

          <button type="button" className="painelBotaoSecundario" onClick={carregarAvisos}>
            Atualizar lista
          </button>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">Carregando avisos...</div>
        ) : avisos.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhum aviso cadastrado</h3>
            <p>Clique em “Novo aviso” para criar o primeiro.</p>
          </div>
        ) : (
          <div className="eventosTabela">
            {avisos.map((aviso) => (
              <article className="eventoAdminCard" key={aviso.id}>
                <div className="eventoAdminConteudo">
                  <div className="eventoAdminStatus">
                    <span className={aviso.publicado ? "statusPublicado" : "statusRascunho"}>
                      {aviso.publicado ? "Publicado" : "Rascunho"}
                    </span>
                    {aviso.destaque && <span className="statusDestaque">Destaque</span>}
                    <span className="statusDestaque">{aviso.publico}</span>
                  </div>

                  <h3>{aviso.titulo}</h3>
                  <p className="eventoAdminDescricao">{aviso.mensagem}</p>

                  <div className="eventoAdminDetalhes">
                    <span>
                      {aviso.data_expiracao
                        ? `Expira em ${new Date(`${aviso.data_expiracao}T00:00:00`).toLocaleDateString("pt-BR")}`
                        : "Sem data de expiração"}
                    </span>
                  </div>
                </div>

                <div className="eventoAdminAcoes">
                  <button type="button" onClick={() => editar(aviso)}>Editar</button>
                  <button type="button" className="eventoExcluir" onClick={() => excluir(aviso.id)}>
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
