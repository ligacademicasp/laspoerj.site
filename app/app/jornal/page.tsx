"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Publicacao = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  autor: string | null;
  categoria: string | null;
  imagem_url: string | null;
  created_at: string | null;
};

export default function JornalPage() {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPublicacoes() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, titulo, slug, resumo, conteudo, autor, categoria, imagem_url, created_at"
        )
        .eq("publicado", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Erro ao carregar publicações:",
          error
        );

        setErro(
          "Não foi possível carregar as publicações."
        );

        setPublicacoes([]);
      } else {
        setPublicacoes(
          (data ?? []) as Publicacao[]
        );
      }

      setCarregando(false);
    }

    carregarPublicacoes();
  }, []);

  function formatarData(data: string | null) {
    if (!data) return "";

    return new Date(data).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  return (
    <main className="jornalPagina">

      {/* HERO */}
      <section className="jornalHero">
        <div className="jornalHeroInterno">

          <span className="jornalKicker">
            FIQUE POR DENTRO
          </span>

          <h1>
            Jornal LASPOERJ
          </h1>

          <p>
            Notícias, ações, entrevistas,
            relatos de experiência e
            divulgação científica
            produzidos pela Liga.
          </p>

        </div>
      </section>

      {/* PUBLICAÇÕES */}
      <section className="jornalListaSection">
        <div className="jornalListaInterna">

          <div className="jornalCabecalhoLista">

            <div>
              <span className="jornalKicker">
                PUBLICAÇÕES
              </span>

              <h2>
                Conteúdos da LASPOERJ
              </h2>

              <p>
                Acompanhe as principais
                notícias, projetos, eventos
                e produções da Liga.
              </p>
            </div>

            <Link
              href="/"
              className="jornalVoltar"
            >
              ← Voltar ao início
            </Link>

          </div>

          {/* CARREGANDO */}
          {carregando && (
            <div className="jornalEstado">
              <p>
                Carregando publicações...
              </p>
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div
              className="jornalEstado jornalEstadoErro"
            >
              <p>{erro}</p>
            </div>
          )}

          {/* SEM PUBLICAÇÕES */}
          {!carregando &&
            !erro &&
            publicacoes.length === 0 && (
              <div className="jornalEstado">
                <p>
                  Nenhuma publicação disponível
                  no momento.
                </p>
              </div>
            )}

          {/* LISTAGEM */}
          {!carregando &&
            !erro &&
            publicacoes.length > 0 && (
              <div className="jornalGrid">

                {publicacoes.map(
                  (publicacao) => (
                    <article
                      key={publicacao.id}
                      className="jornalCard"
                    >

                      {/* IMAGEM */}
                      {publicacao.imagem_url ? (
                        <Link
                          href={`/jornal/${publicacao.slug}`}
                          className="jornalCardImagem"
                        >
                          <img
                            src={
                              publicacao.imagem_url
                            }
                            alt={
                              publicacao.titulo
                            }
                          />
                        </Link>
                      ) : (
                        <Link
                          href={`/jornal/${publicacao.slug}`}
                          className="jornalCardImagem jornalCardImagemSemFoto"
                        >
                          <span>
                            LASPOERJ
                          </span>
                        </Link>
                      )}

                      {/* CONTEÚDO */}
                      <div className="jornalCardConteudo">

                        <div className="jornalCardMeta">

                          <span>
                            {publicacao.categoria ||
                              "Notícia"}
                          </span>

                          {publicacao.created_at && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {formatarData(
                                  publicacao.created_at
                                )}
                              </span>
                            </>
                          )}

                        </div>

                        <h3>
                          <Link
                            href={`/jornal/${publicacao.slug}`}
                          >
                            {publicacao.titulo}
                          </Link>
                        </h3>

                        {publicacao.resumo && (
                          <p>
                            {publicacao.resumo}
                          </p>
                        )}

                        {!publicacao.resumo &&
                          publicacao.conteudo && (
                            <p>
                              {publicacao.conteudo
                                .replace(
                                  /\n/g,
                                  " "
                                )
                                .substring(
                                  0,
                                  180
                                )}

                              {publicacao
                                .conteudo
                                .length > 180
                                ? "..."
                                : ""}
                            </p>
                          )}

                        <Link
                          href={`/jornal/${publicacao.slug}`}
                          className="jornalCardLink"
                        >
                          Ler publicação →
                        </Link>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

        </div>
      </section>

    </main>
  );
}