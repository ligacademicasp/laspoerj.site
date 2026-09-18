"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import usePortalConfig from "../usePortalConfig";

type Publicacao = {
  id: number;
  slug: string;
  titulo: string;
  resumo: string | null;
  categoria: string | null;
  imagem_url: string | null;
  data_publicacao: string | null;
};

export default function ProjetosPage() {
  const { config } = usePortalConfig();
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, slug, titulo, resumo, categoria, imagem_url, data_publicacao"
        )
        .eq("publicado", true)
        .order("data_publicacao", { ascending: false });

      if (error) {
        console.error("Erro ao carregar projetos:", error);
      } else {
        setPublicacoes(data ?? []);
      }

      setCarregando(false);
    }

    carregar();
  }, []);

  const projetos = useMemo(
    () =>
      publicacoes.filter((item) => {
        const categoria = (item.categoria || "").toLowerCase();

        return (
          categoria.includes("projeto") ||
          categoria.includes("ação") ||
          categoria.includes("acao") ||
          categoria.includes("extensão") ||
          categoria.includes("extensao")
        );
      }),
    [publicacoes]
  );

  return (
    <main>
      <section className="portalHero portalHeroCompacto">
        <div className="portalHeroTexto">
          <p className="portalKicker">
            {config(
              "portal_projetos_kicker",
              "EXTENSÃO • TERRITÓRIO • COMUNIDADE"
            )}
          </p>

          <h1>
            {config(
              "portal_projetos_titulo",
              "Projetos que saem da universidade e"
            )}
            <span>
              {" "}
              {config(
                "portal_projetos_destaque",
                "encontram pessoas."
              )}
            </span>
          </h1>

          <p className="portalHeroDescricao">
            {config(
              "portal_projetos_descricao",
              "Este espaço reúne ações, projetos e iniciativas extensionistas desenvolvidas ou apoiadas pela LASPOERJ."
            )}
          </p>
        </div>

        <aside className="portalHeroNumero">
          <strong>
            {carregando ? "—" : String(projetos.length).padStart(2, "0")}
          </strong>
          <span>projetos e ações publicados</span>
        </aside>
      </section>

      <section className="portalConteudo">
        <div className="portalSecaoTopo">
          <div>
            <p className="portalKicker">ATUAÇÃO</p>
            <h2>Projetos e Ações</h2>
          </div>

          <Link href="/jornal">Ver todas as publicações →</Link>
        </div>

        {carregando ? (
          <div className="portalEstado">Carregando projetos...</div>
        ) : projetos.length === 0 ? (
          <div className="portalEstado portalEstadoExplicativo">
            <h3>Nenhum projeto categorizado ainda.</h3>
            <p>
              Cadastre uma publicação no painel usando a categoria{" "}
              <strong>Projeto</strong>, <strong>Ação</strong> ou{" "}
              <strong>Extensão</strong>. Ela aparecerá automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="portalPublicacoesGrid">
            {projetos.map((projeto) => (
              <article key={projeto.id}>
                <Link
                  href={`/jornal/${projeto.slug}`}
                  className="portalPublicacaoImagem"
                >
                  {projeto.imagem_url ? (
                    <img src={projeto.imagem_url} alt={projeto.titulo} />
                  ) : (
                    <div>LASPOERJ</div>
                  )}
                </Link>

                <div className="portalPublicacaoTexto">
                  <span>{projeto.categoria || "Projeto"}</span>
                  <h3>{projeto.titulo}</h3>
                  <p>{projeto.resumo || "Conheça esta ação da LASPOERJ."}</p>
                  <Link href={`/jornal/${projeto.slug}`}>
                    Conhecer ação →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="portalChamadaEscura">
        <div>
          <p>EXTENSÃO UNIVERSITÁRIA</p>
          <h2>
            {config(
              "portal_projetos_chamada",
              "Da universidade para a comunidade."
            )}
          </h2>
        </div>

        <p>
          {config(
            "portal_projetos_chamada_texto",
            "Cada ação é uma oportunidade de aproximar conhecimento científico, promoção da saúde e responsabilidade social."
          )}
        </p>
      </section>
    </main>
  );
}
