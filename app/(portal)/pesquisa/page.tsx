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
  autor: string | null;
  data_publicacao: string | null;
};

export default function PesquisaPage() {
  const { config } = usePortalConfig();
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("publicacoes")
        .select("id, slug, titulo, resumo, categoria, autor, data_publicacao")
        .eq("publicado", true)
        .order("data_publicacao", { ascending: false });

      if (error) {
        console.error("Erro ao carregar produção científica:", error);
      } else {
        setPublicacoes(data ?? []);
      }

      setCarregando(false);
    }

    carregar();
  }, []);

  const cientificas = useMemo(
    () =>
      publicacoes.filter((item) => {
        const categoria = (item.categoria || "").toLowerCase();

        return (
          categoria.includes("pesquisa") ||
          categoria.includes("cient") ||
          categoria.includes("artigo") ||
          categoria.includes("trabalho") ||
          categoria.includes("resumo")
        );
      }),
    [publicacoes]
  );

  return (
    <main>
      <section className="portalHero portalHeroPesquisa">
        <div className="portalHeroTexto">
          <p className="portalKicker">
            {config(
              "portal_pesquisa_kicker",
              "INVESTIGAÇÃO • EVIDÊNCIA • CONHECIMENTO"
            )}
          </p>

          <h1>
            {config(
              "portal_pesquisa_titulo",
              "Produção científica para"
            )}
            <span>
              {" "}
              {config(
                "portal_pesquisa_destaque",
                "compreender e transformar."
              )}
            </span>
          </h1>

          <p className="portalHeroDescricao">
            {config(
              "portal_pesquisa_descricao",
              "Pesquisa também faz parte da saúde coletiva. A LASPOERJ incentiva o pensamento científico, a investigação e a divulgação de conhecimento."
            )}
          </p>
        </div>

        <div className="portalPesquisaGrafismo" aria-hidden="true">
          <span>CIÊNCIA</span>
          <span>EVIDÊNCIA</span>
          <span>TERRITÓRIO</span>
          <span>SAÚDE</span>
        </div>
      </section>

      <section className="portalManifesto portalManifestoClaro">
        <div>
          <p className="portalKicker">PESQUISA NA LIGA</p>
          <h2>
            {config(
              "portal_pesquisa_manifesto_titulo",
              "Conhecimento científico como parte da formação."
            )}
          </h2>
        </div>

        <div className="portalManifestoTexto">
          <p>
            {config(
              "portal_pesquisa_manifesto_1",
              "A produção científica fortalece a capacidade crítica dos estudantes e contribui para compreender problemas reais de saúde."
            )}
          </p>

          <p>
            {config(
              "portal_pesquisa_manifesto_2",
              "Esta página poderá reunir pesquisas em andamento, trabalhos apresentados, resumos, artigos e produções vinculadas à LASPOERJ."
            )}
          </p>
        </div>
      </section>

      <section className="portalConteudo">
        <div className="portalSecaoTopo">
          <div>
            <p className="portalKicker">PRODUÇÃO</p>
            <h2>Publicações científicas</h2>
          </div>

          <span className="portalContador">
            {carregando ? "—" : cientificas.length}
          </span>
        </div>

        {carregando ? (
          <div className="portalEstado">Carregando produção científica...</div>
        ) : cientificas.length === 0 ? (
          <div className="portalEstado portalEstadoExplicativo">
            <h3>A área científica está pronta para crescer.</h3>
            <p>
              Cadastre publicações no painel como <strong>Pesquisa</strong>,{" "}
              <strong>Produção Científica</strong>, <strong>Artigo</strong>,{" "}
              <strong>Trabalho</strong> ou <strong>Resumo</strong>.
            </p>
          </div>
        ) : (
          <div className="portalListaEditorial">
            {cientificas.map((item, indice) => (
              <article key={item.id}>
                <span>{String(indice + 1).padStart(2, "0")}</span>

                <div>
                  <small>{item.categoria || "Produção científica"}</small>
                  <h3>{item.titulo}</h3>
                  <p>{item.resumo || "Produção científica da LASPOERJ."}</p>

                  {item.autor && <b>{item.autor}</b>}
                </div>

                <Link href={`/jornal/${item.slug}`}>Ler →</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
