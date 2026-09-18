"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Documento = {
  id: number;
  titulo: string;
  descricao: string | null;
  categoria: string;
  arquivo_url: string;
  ordem: number;
  publicado: boolean;
};

const formularioInicial = {
  titulo: "",
  descricao: "",
  categoria: "Edital",
  arquivo_url: "",
  ordem: 1,
  publicado: true,
};

function nomeSeguro(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function caminhoStorageDaUrl(url: string) {
  const marcador =
    "/storage/v1/object/public/documentos-publicos/";

  const indice = url.indexOf(marcador);

  if (indice === -1) return null;

  return decodeURIComponent(
    url.slice(indice + marcador.length)
  );
}

export default function DocumentosAdminPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("documentos_publicos")
      .select(
        "id, titulo, descricao, categoria, arquivo_url, ordem, publicado"
      )
      .order("ordem", { ascending: true })
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMensagem(
        `Erro ao carregar documentos: ${error.message}. Execute primeiro o SQL enviado no pacote.`
      );
      setDocumentos([]);
    } else {
      setDocumentos(data ?? []);
    }

    setCarregando(false);
  }

  function novoDocumento() {
    setEditando(null);
    setFormulario({
      ...formularioInicial,
      ordem: documentos.length + 1,
    });
    setArquivo(null);
    setMensagem("");
    setFormAberto(true);
  }

  function editarDocumento(documento: Documento) {
    setEditando(documento.id);
    setFormulario({
      titulo: documento.titulo,
      descricao: documento.descricao ?? "",
      categoria: documento.categoria,
      arquivo_url: documento.arquivo_url,
      ordem: documento.ordem,
      publicado: documento.publicado,
    });
    setArquivo(null);
    setMensagem("");
    setFormAberto(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fecharFormulario() {
    setFormAberto(false);
    setEditando(null);
    setFormulario(formularioInicial);
    setArquivo(null);
  }

  async function enviarArquivo() {
    if (!arquivo) {
      return formulario.arquivo_url;
    }

    if (arquivo.type !== "application/pdf") {
      throw new Error("Selecione um arquivo PDF.");
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      throw new Error("O PDF deve ter no máximo 10 MB.");
    }

    const base = nomeSeguro(arquivo.name.replace(/\.pdf$/i, "")) || "documento";
    const caminho = `${Date.now()}-${base}.pdf`;

    const { error } = await supabase.storage
      .from("documentos-publicos")
      .upload(caminho, arquivo, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("documentos-publicos")
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function salvarDocumento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formulario.titulo.trim()) {
      setMensagem("Informe o título do documento.");
      return;
    }

    if (!arquivo && !formulario.arquivo_url) {
      setMensagem("Selecione o PDF do documento.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    try {
      const novaUrl = await enviarArquivo();

      const dados = {
        titulo: formulario.titulo.trim(),
        descricao: formulario.descricao.trim() || null,
        categoria: formulario.categoria,
        arquivo_url: novaUrl,
        ordem: Number(formulario.ordem) || 1,
        publicado: formulario.publicado,
        updated_at: new Date().toISOString(),
      };

      if (editando) {
        const { error } = await supabase
          .from("documentos_publicos")
          .update(dados)
          .eq("id", editando);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("documentos_publicos")
          .insert(dados);

        if (error) throw error;
      }

      setMensagem(
        editando
          ? "Documento atualizado com sucesso."
          : "Documento cadastrado com sucesso."
      );

      fecharFormulario();
      await carregar();
    } catch (error: any) {
      console.error(error);
      setMensagem(
        `Erro ao salvar documento: ${
          error?.message || "erro desconhecido"
        }`
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirDocumento(documento: Documento) {
    const confirmou = window.confirm(
      `Excluir "${documento.titulo}"?`
    );

    if (!confirmou) return;

    setMensagem("");

    const { error } = await supabase
      .from("documentos_publicos")
      .delete()
      .eq("id", documento.id);

    if (error) {
      setMensagem(`Erro ao excluir: ${error.message}`);
      return;
    }

    const caminho = caminhoStorageDaUrl(documento.arquivo_url);

    if (caminho) {
      const { error: erroStorage } = await supabase.storage
        .from("documentos-publicos")
        .remove([caminho]);

      if (erroStorage) {
        console.warn(
          "Documento removido do banco, mas o arquivo não pôde ser removido do Storage:",
          erroStorage
        );
      }
    }

    setMensagem("Documento excluído com sucesso.");
    await carregar();
  }

  return (
    <div className="painelDashboard documentosAdminPagina">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">PORTAL PÚBLICO</p>
          <h1>Documentos</h1>
          <p>
            Publique editais, regimentos, relatórios e materiais em PDF
            diretamente no site.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={novoDocumento}
        >
          + Novo documento
        </button>
      </div>

      {mensagem && <div className="painelMensagem">{mensagem}</div>}

      {formAberto && (
        <section className="documentosAdminFormularioCard">
          <div className="eventoFormularioCabecalho">
            <div>
              <p className="painelSubtitulo">
                {editando ? "EDITAR DOCUMENTO" : "NOVO DOCUMENTO"}
              </p>
              <h2>
                {editando ? "Editar documento" : "Adicionar PDF"}
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

          <form
            className="documentosAdminFormulario"
            onSubmit={salvarDocumento}
          >
            <label className="documentosAdminCampo documentosAdminCampoGrande">
              <span>Título *</span>
              <input
                value={formulario.titulo}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    titulo: e.target.value,
                  })
                }
                required
              />
            </label>

            <label className="documentosAdminCampo documentosAdminCampoGrande">
              <span>Descrição</span>
              <textarea
                rows={3}
                value={formulario.descricao}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    descricao: e.target.value,
                  })
                }
              />
            </label>

            <label className="documentosAdminCampo">
              <span>Categoria</span>
              <select
                value={formulario.categoria}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    categoria: e.target.value,
                  })
                }
              >
                <option value="Edital">Edital</option>
                <option value="Regimento">Regimento</option>
                <option value="Relatório">Relatório</option>
                <option value="Material público">Material público</option>
                <option value="Outro">Outro</option>
              </select>
            </label>

            <label className="documentosAdminCampo">
              <span>Ordem</span>
              <input
                type="number"
                min={1}
                value={formulario.ordem}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    ordem: Number(e.target.value),
                  })
                }
              />
            </label>

            <label className="documentosAdminCampo documentosAdminCampoGrande">
              <span>
                {editando ? "Substituir PDF (opcional)" : "Arquivo PDF *"}
              </span>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) =>
                  setArquivo(e.target.files?.[0] ?? null)
                }
              />

              <small>Máximo: 10 MB.</small>
            </label>

            {formulario.arquivo_url && (
              <div className="documentosAdminArquivoAtual">
                <span>Arquivo atual</span>
                <a
                  href={formulario.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir PDF ↗
                </a>
              </div>
            )}

            <label className="eventoCheckbox documentosAdminCampoGrande">
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

              <span>Exibir este documento no site público</span>
            </label>

            <div className="eventoFormularioAcoes documentosAdminCampoGrande">
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
                {salvando ? "Salvando..." : "Salvar documento"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="documentosAdminListaCard">
        <div className="eventosAdministracaoCabecalho">
          <div>
            <h2>Biblioteca pública</h2>
            <p>
              {documentos.length}{" "}
              {documentos.length === 1
                ? "documento cadastrado"
                : "documentos cadastrados"}
            </p>
          </div>

          <button
            type="button"
            className="painelBotaoSecundario"
            onClick={carregar}
          >
            Atualizar lista
          </button>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">
            Carregando documentos...
          </div>
        ) : documentos.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhum documento cadastrado</h3>
            <p>
              Clique em “Novo documento” para publicar o primeiro PDF.
            </p>
          </div>
        ) : (
          <div className="documentosAdminLista">
            {documentos.map((documento) => (
              <article key={documento.id}>
                <div className="documentosAdminOrdem">
                  {String(documento.ordem).padStart(2, "0")}
                </div>

                <div className="documentosAdminConteudo">
                  <div className="eventoAdminStatus">
                    <span
                      className={
                        documento.publicado
                          ? "statusPublicado"
                          : "statusRascunho"
                      }
                    >
                      {documento.publicado ? "Publicado" : "Oculto"}
                    </span>

                    <span className="statusDestaque">
                      {documento.categoria}
                    </span>
                  </div>

                  <h3>{documento.titulo}</h3>
                  <p>
                    {documento.descricao || "Sem descrição."}
                  </p>
                </div>

                <div className="documentosAdminAcoes">
                  <a
                    href={documento.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver PDF
                  </a>

                  <button
                    type="button"
                    onClick={() => editarDocumento(documento)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="eventoExcluir"
                    onClick={() => excluirDocumento(documento)}
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
