"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function JornalPage() {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  useEffect(() => {
    async function carregarPublicacoes() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, slug, titulo, resumo, conteudo, autor, categoria, imagem_url, destaque, publicado, data_publicacao"
        )
        .eq("publicado", true)
        .order("destaque", { ascending: false })
        .order("data_publicacao", { ascending: false });

      if (error) {
        console.error("Erro ao carregar o LASPOERJ em Ação:", error);
        setErro("Não foi possível carregar as publicações do LASPOERJ em Ação.");
        setPublicacoes([]);
        setCarregando(false);
        return;
      }

      setPublicacoes(data ?? []);
      setCarregando(false);
    }

    carregarPublicacoes();
  }, []);

  const categorias = useMemo(() => {
    const lista = publicacoes
      .map((publicacao) => publicacao.categoria)
      .filter((item): item is string => Boolean(item));

    return ["Todas", ...Array.from(new Set(lista)).sort()];
  }, [publicacoes]);

  const publicacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return publicacoes.filter((publicacao) => {
      const correspondeCategoria =
        categoria === "Todas" || publicacao.categoria === categoria;

      const textoCompleto = [
        publicacao.titulo,
        publicacao.resumo,
        publicacao.conteudo,
        publicacao.autor,
        publicacao.categoria,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const correspondeBusca =
        termo.length === 0 || textoCompleto.includes(termo);

      return correspondeCategoria && correspondeBusca;
    });
  }, [publicacoes, busca, categoria]);

  function formatarData(data: string | null) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-").map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <main className="jornalPagina">
      <header className="jornalPaginaTopo">
        <div className="jornalPaginaTopoInterno">
          <a href="/" className="jornalPaginaVoltar">
            ← VOLTAR AO SITE
          </a>

          <p className="subtitulo">LASPOERJ EM AÇÃO</p>

          <h1>
            Informação, ciência
            <br />
            e saúde coletiva.
          </h1>

          <p className="jornalPaginaDescricao">
            Acompanhe notícias, ações, entrevistas, relatos de experiência,
            produções científicas e conteúdos de saúde pública da LASPOERJ.
          </p>
        </div>
      </header>

      <section className="jornalArquivo">
        <div className="jornalArquivoCabecalho">
          <div>
            <p className="subtitulo">PUBLICAÇÕES</p>
            <h2>Arquivo LASPOERJ em Ação</h2>
          </div>

          <div className="jornalContador">
            <strong>{publicacoesFiltradas.length}</strong>
            <span>
              {publicacoesFiltradas.length === 1
                ? "publicação"
                : "publicações"}
            </span>
          </div>
        </div>

        <div className="jornalFiltros">
          <label className="jornalBusca">
            <span>Buscar publicação</span>

            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite um título, tema ou autor..."
            />
          </label>

          <label className="jornalCategoriaFiltro">
            <span>Categoria</span>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {carregando ? (
          <div className="jornalArquivoEstado">
            Carregando publicações...
          </div>
        ) : erro ? (
          <div className="jornalArquivoEstado">
            <h3>Não foi possível carregar o LASPOERJ em Ação</h3>
            <p>{erro}</p>
          </div>
        ) : publicacoesFiltradas.length === 0 ? (
          <div className="jornalArquivoEstado">
            <h3>Nenhuma publicação encontrada</h3>
            <p>
              Tente alterar a pesquisa ou escolher outra categoria.
            </p>
          </div>
        ) : (
          <div className="jornalArquivoGrid">
            {publicacoesFiltradas.map((publicacao) => (
              <article
                className={
                  publicacao.destaque
                    ? "jornalArquivoCard jornalArquivoDestaque"
                    : "jornalArquivoCard"
                }
                key={publicacao.id}
              >
                {publicacao.imagem_url ? (
                  <a
                    href={`/jornal/${publicacao.slug}`}
                    className="jornalArquivoImagemBox"
                    aria-label={`Ler ${publicacao.titulo}`}
                  >
                    <img
                      src={publicacao.imagem_url}
                      alt={publicacao.titulo}
                      className="jornalArquivoImagem"
                    />
                  </a>
                ) : (
                  <div className="jornalArquivoSemImagem">
                    <span>LASPOERJ</span>
                  </div>
                )}

                <div className="jornalArquivoConteudo">
                  <div className="jornalArquivoMeta">
                    <div>
                      {publicacao.destaque && (
                        <span className="jornalEtiquetaDestaque">
                          DESTAQUE
                        </span>
                      )}

                      {publicacao.categoria && (
                        <span>{publicacao.categoria}</span>
                      )}
                    </div>

                    {publicacao.data_publicacao && (
                      <small>
                        {formatarData(publicacao.data_publicacao)}
                      </small>
                    )}
                  </div>

                  <h3>
                    <a href={`/jornal/${publicacao.slug}`}>
                      {publicacao.titulo}
                    </a>
                  </h3>

                  <p>
                    {publicacao.resumo ||
                      publicacao.conteudo?.slice(0, 220) ||
                      "Leia esta publicação do LASPOERJ em Ação."}
                  </p>

                  <div className="jornalArquivoRodape">
                    <span>
                      {publicacao.autor
                        ? `Por ${publicacao.autor}`
                        : "LASPOERJ"}
                    </span>

                    <a
                      href={`/jornal/${publicacao.slug}`}
                      className="jornalArquivoLer"
                    >
                      LER PUBLICAÇÃO →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="jornalPaginaFooter">
        <div>
          <strong>LASPOERJ</strong>
          <span>
            Liga Acadêmica de Saúde Pública Odontológica • Estácio RJ
          </span>
        </div>

        <a href="/">Voltar para a página inicial</a>
      </footer>
    </main>
  );
}
