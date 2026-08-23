"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Publicacao = {
  id: number;
  slug: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  autor: string | null;
  categoria: string | null;
  imagem_url: string | null;
  destaque: boolean;
  publicado: boolean;
  data_publicacao: string | null;
};

const formularioInicial = {
  titulo: "",
  slug: "",
  resumo: "",
  conteudo: "",
  autor: "",
  categoria: "Notícia",
  imagem_url: "",
  destaque: false,
  publicado: true,
  data_publicacao: "",
};

function transformarEmSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TAMANHO_MAXIMO_CAPA = 8 * 1024 * 1024;

export default function JornalPage() {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [publicacaoEditando, setPublicacaoEditando] =
    useState<number | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [mensagemSistema, setMensagemSistema] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState("");

  const [formulario, setFormulario] =
    useState(formularioInicial);

  useEffect(() => {
    carregarPublicacoes();
  }, []);

  useEffect(() => {
    return () => {
      if (previewImagem.startsWith("blob:")) {
        URL.revokeObjectURL(previewImagem);
      }
    };
  }, [previewImagem]);

  async function carregarPublicacoes() {
    setCarregando(true);
    setMensagemSistema("");

    const { data, error } = await supabase
      .from("publicacoes")
      .select(
        `
        id,
        slug,
        titulo,
        resumo,
        conteudo,
        autor,
        categoria,
        imagem_url,
        destaque,
        publicado,
        data_publicacao
        `
      )
      .order("data_publicacao", {
        ascending: false,
      });

    if (error) {
      console.error("Erro ao carregar publicações:", error);

      setMensagemSistema(
        `Erro ao carregar publicações: ${error.message}`
      );

      setPublicacoes([]);
    } else {
      setPublicacoes(data ?? []);
    }

    setCarregando(false);
  }

  function limparImagemSelecionada() {
    if (previewImagem.startsWith("blob:")) {
      URL.revokeObjectURL(previewImagem);
    }

    setArquivoImagem(null);
    setPreviewImagem("");
  }

  function abrirNovaPublicacao() {
    limparImagemSelecionada();

    const hoje = new Date()
      .toISOString()
      .split("T")[0];

    setPublicacaoEditando(null);

    setFormulario({
      ...formularioInicial,
      data_publicacao: hoje,
    });

    setMensagemSistema("");
    setFormularioAberto(true);
  }

  function abrirEdicao(publicacao: Publicacao) {
    limparImagemSelecionada();

    setPublicacaoEditando(publicacao.id);

    setFormulario({
      titulo: publicacao.titulo,
      slug: publicacao.slug ?? "",
      resumo: publicacao.resumo ?? "",
      conteudo: publicacao.conteudo ?? "",
      autor: publicacao.autor ?? "",
      categoria: publicacao.categoria ?? "Notícia",
      imagem_url: publicacao.imagem_url ?? "",
      destaque: publicacao.destaque ?? false,
      publicado: publicacao.publicado ?? false,
      data_publicacao: publicacao.data_publicacao ?? "",
    });

    setPreviewImagem(publicacao.imagem_url ?? "");

    setMensagemSistema("");
    setFormularioAberto(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function fecharFormulario() {
    limparImagemSelecionada();
    setFormularioAberto(false);
    setPublicacaoEditando(null);
    setFormulario(formularioInicial);
  }

  async function gerarSlugUnico(
    titulo: string,
    slugDigitado: string,
    idAtual: number | null
  ) {
    const base =
      transformarEmSlug(slugDigitado || titulo) ||
      "publicacao";

    let slugFinal = base;
    let numero = 2;

    while (true) {
      let consulta = supabase
        .from("publicacoes")
        .select("id")
        .eq("slug", slugFinal);

      if (idAtual) {
        consulta = consulta.neq("id", idAtual);
      }

      const { data, error } = await consulta.limit(1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return slugFinal;
      }

      slugFinal = `${base}-${numero}`;
      numero += 1;
    }
  }

  function selecionarImagem(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setMensagemSistema(
        "Selecione um arquivo de imagem."
      );
      e.target.value = "";
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_CAPA) {
      setMensagemSistema(
        "A imagem deve ter no máximo 8 MB."
      );
      e.target.value = "";
      return;
    }

    if (previewImagem.startsWith("blob:")) {
      URL.revokeObjectURL(previewImagem);
    }

    setArquivoImagem(arquivo);
    setPreviewImagem(URL.createObjectURL(arquivo));
    setMensagemSistema("");
  }

  function normalizarNomeArquivo(nome: string) {
    return nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-");
  }

  async function enviarImagemStorage(
    slugFinal: string
  ) {
    if (!arquivoImagem) {
      return formulario.imagem_url.trim() || null;
    }

    setEnviandoImagem(true);

    try {
      const extensaoOriginal =
        arquivoImagem.name.split(".").pop() || "jpg";

      const extensao =
        extensaoOriginal
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      const nomeBase =
        normalizarNomeArquivo(slugFinal) || "publicacao";

      const caminho =
        `capas/${Date.now()}-${nomeBase}.${extensao}`;

      const { error: uploadError } =
        await supabase.storage
          .from("jornal")
          .upload(caminho, arquivoImagem, {
            cacheControl: "3600",
            upsert: false,
            contentType: arquivoImagem.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("jornal")
        .getPublicUrl(caminho);

      return data.publicUrl;
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function salvarPublicacao(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !formulario.titulo.trim() ||
      !formulario.conteudo.trim()
    ) {
      setMensagemSistema(
        "Preencha pelo menos o título e o conteúdo da publicação."
      );

      return;
    }

    setSalvando(true);
    setMensagemSistema("");

    try {
      const slugFinal = await gerarSlugUnico(
        formulario.titulo,
        formulario.slug,
        publicacaoEditando
      );

      const imagemUrl = await enviarImagemStorage(
        slugFinal
      );

      const dadosPublicacao = {
        titulo: formulario.titulo.trim(),
        slug: slugFinal,
        resumo: formulario.resumo.trim() || null,
        conteudo: formulario.conteudo.trim(),
        autor: formulario.autor.trim() || null,
        categoria: formulario.categoria || null,
        imagem_url: imagemUrl,
        destaque: formulario.destaque,
        publicado: formulario.publicado,
        data_publicacao:
          formulario.data_publicacao ||
          new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      };

      if (publicacaoEditando) {
        const { error } = await supabase
          .from("publicacoes")
          .update(dadosPublicacao)
          .eq("id", publicacaoEditando);

        if (error) throw error;

        setMensagemSistema(
          "Publicação atualizada com sucesso."
        );
      } else {
        const { error } = await supabase
          .from("publicacoes")
          .insert(dadosPublicacao);

        if (error) throw error;

        setMensagemSistema(
          "Publicação criada com sucesso."
        );
      }

      limparImagemSelecionada();
      setFormularioAberto(false);
      setPublicacaoEditando(null);
      setFormulario(formularioInicial);

      await carregarPublicacoes();
    } catch (error: any) {
      console.error(error);

      setMensagemSistema(
        `Erro ao salvar publicação: ${
          error?.message || "erro desconhecido"
        }`
      );
    } finally {
      setSalvando(false);
      setEnviandoImagem(false);
    }
  }

  async function excluirPublicacao(id: number) {
    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir esta publicação?"
    );

    if (!confirmou) return;

    setMensagemSistema("");

    const { error } = await supabase
      .from("publicacoes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);

      setMensagemSistema(
        `Erro ao excluir publicação: ${error.message}`
      );

      return;
    }

    setMensagemSistema(
      "Publicação excluída com sucesso."
    );

    await carregarPublicacoes();
  }

  function formatarData(data: string | null) {
    if (!data) return "Sem data";

    const [ano, mes, dia] =
      data.split("-").map(Number);

    return new Date(
      ano,
      mes - 1,
      dia
    ).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">
            JORNAL LASPOERJ
          </p>

          <h1>Publicações</h1>

          <p>
            Crie notícias, entrevistas, relatos de experiência
            e conteúdos científicos da Liga.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={abrirNovaPublicacao}
        >
          + Nova publicação
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
                {publicacaoEditando
                  ? "EDITAR PUBLICAÇÃO"
                  : "NOVO CONTEÚDO"}
              </p>

              <h2>
                {publicacaoEditando
                  ? "Editar publicação"
                  : "Nova publicação"}
              </h2>
            </div>

            <button
              type="button"
              className="eventoFechar"
              onClick={fecharFormulario}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <form
            className="eventoFormulario"
            onSubmit={salvarPublicacao}
          >
            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="titulo">
                Título
              </label>

              <input
                id="titulo"
                type="text"
                value={formulario.titulo}
                onChange={(e) => {
                  const titulo = e.target.value;

                  setFormulario((atual) => ({
                    ...atual,
                    titulo,
                    slug:
                      publicacaoEditando || atual.slug
                        ? atual.slug
                        : transformarEmSlug(titulo),
                  }));
                }}
                placeholder="Ex.: LASPOERJ realiza ação de saúde coletiva"
                required
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="slug">
                Endereço da publicação
              </label>

              <input
                id="slug"
                type="text"
                value={formulario.slug}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    slug: transformarEmSlug(e.target.value),
                  })
                }
                placeholder="acao-de-saude-bucal"
              />

              <small>
                A matéria ficará em: /jornal/
                {formulario.slug ||
                  transformarEmSlug(formulario.titulo) ||
                  "titulo-da-publicacao"}
              </small>
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="resumo">Resumo</label>

              <textarea
                id="resumo"
                rows={3}
                value={formulario.resumo}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    resumo: e.target.value,
                  })
                }
                placeholder="Uma breve apresentação da publicação."
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="conteudo">Conteúdo</label>

              <textarea
                id="conteudo"
                rows={12}
                value={formulario.conteudo}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    conteudo: e.target.value,
                  })
                }
                placeholder="Escreva aqui o conteúdo completo da matéria..."
                required
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="autor">Autor</label>

              <input
                id="autor"
                type="text"
                value={formulario.autor}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    autor: e.target.value,
                  })
                }
                placeholder="Ex.: Diretoria LASPOERJ"
              />
            </div>

            <div className="eventoCampo">
              <label htmlFor="categoria">
                Categoria
              </label>

              <select
                id="categoria"
                value={formulario.categoria}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    categoria: e.target.value,
                  })
                }
              >
                <option value="Notícia">Notícia</option>
                <option value="Pesquisa">Pesquisa</option>
                <option value="Extensão">Extensão</option>
                <option value="Entrevista">Entrevista</option>
                <option value="Relato de experiência">
                  Relato de experiência
                </option>
                <option value="Saúde Pública">Saúde Pública</option>
                <option value="Saúde Bucal">Saúde Bucal</option>
                <option value="SUS">SUS</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="eventoCampo">
              <label htmlFor="data">
                Data da publicação
              </label>

              <input
                id="data"
                type="date"
                value={formulario.data_publicacao}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    data_publicacao: e.target.value,
                  })
                }
              />
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label>
                Imagem de capa
              </label>

              <div className="jornalUploadBox">
                <div className="jornalUploadTexto">
                  <strong>Enviar imagem</strong>
                  <p>
                    JPG, PNG ou outra imagem aceita pelo navegador.
                    Tamanho máximo: 8 MB.
                  </p>
                </div>

                {previewImagem && (
                  <div className="jornalUploadPreview">
                    <img
                      src={previewImagem}
                      alt="Prévia da capa"
                    />
                  </div>
                )}

                <label className="jornalUploadBotao">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={selecionarImagem}
                  />

                  <span>
                    {arquivoImagem
                      ? "Trocar imagem selecionada"
                      : "Escolher imagem"}
                  </span>
                </label>

                {arquivoImagem && (
                  <small>
                    Selecionada: {arquivoImagem.name}
                  </small>
                )}
              </div>
            </div>

            <div className="eventoCampo eventoCampoGrande">
              <label htmlFor="imagem">
                URL/caminho da imagem
              </label>

              <input
                id="imagem"
                type="text"
                value={formulario.imagem_url}
                onChange={(e) => {
                  const valor = e.target.value;

                  setFormulario({
                    ...formulario,
                    imagem_url: valor,
                  });

                  if (!arquivoImagem) {
                    setPreviewImagem(valor);
                  }
                }}
                placeholder="Preenchido automaticamente após o upload"
              />

              <small>
                Você ainda pode usar uma URL pública ou um caminho
                manualmente, se preferir.
              </small>
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

              <span>Destacar esta publicação</span>
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

              <span>Publicar no site</span>
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
                disabled={salvando || enviandoImagem}
              >
                {enviandoImagem
                  ? "Enviando imagem..."
                  : salvando
                  ? "Salvando..."
                  : publicacaoEditando
                  ? "Salvar alterações"
                  : "Publicar conteúdo"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="eventosAdministracao">
        <div className="eventosAdministracaoCabecalho">
          <div>
            <h2>Conteúdos cadastrados</h2>

            <p>
              {publicacoes.length}{" "}
              {publicacoes.length === 1
                ? "publicação encontrada"
                : "publicações encontradas"}
            </p>
          </div>

          <button
            type="button"
            className="painelBotaoSecundario"
            onClick={carregarPublicacoes}
          >
            Atualizar lista
          </button>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">
            Carregando publicações...
          </div>
        ) : publicacoes.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhuma publicação cadastrada</h3>

            <p>
              Clique em “Nova publicação” para criar
              a primeira matéria do Jornal LASPOERJ.
            </p>
          </div>
        ) : (
          <div className="eventosTabela">
            {publicacoes.map((publicacao) => (
              <article
                className="eventoAdminCard"
                key={publicacao.id}
              >
                <div className="eventoAdminConteudo">
                  <div className="eventoAdminStatus">
                    <span
                      className={
                        publicacao.publicado
                          ? "statusPublicado"
                          : "statusRascunho"
                      }
                    >
                      {publicacao.publicado
                        ? "Publicado"
                        : "Rascunho"}
                    </span>

                    {publicacao.destaque && (
                      <span className="statusDestaque">
                        Destaque
                      </span>
                    )}

                    {publicacao.categoria && (
                      <span className="statusDestaque">
                        {publicacao.categoria}
                      </span>
                    )}
                  </div>

                  <h3>{publicacao.titulo}</h3>

                  <p className="eventoAdminDescricao">
                    {publicacao.resumo ||
                      publicacao.conteudo ||
                      "Sem resumo."}
                  </p>

                  <div className="eventoAdminDetalhes">
                    {publicacao.autor && (
                      <span>
                        Autor: {publicacao.autor}
                      </span>
                    )}

                    <span>
                      {formatarData(
                        publicacao.data_publicacao
                      )}
                    </span>

                    <span>
                      /jornal/{publicacao.slug}
                    </span>
                  </div>
                </div>

                <div className="eventoAdminAcoes">
                  {publicacao.publicado && (
                    <a
                      href={`/jornal/${publicacao.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver matéria
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      abrirEdicao(publicacao)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="eventoExcluir"
                    onClick={() =>
                      excluirPublicacao(publicacao.id)
                    }
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