"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import usePortalConfig from "../usePortalConfig";

type Documento = {
  id: number;
  titulo: string;
  descricao: string | null;
  categoria: string;
  arquivo_url: string;
  ordem: number;
  publicado: boolean;
};

export default function DocumentosPage() {
  const { config } = usePortalConfig();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("documentos_publicos")
        .select(
          "id, titulo, descricao, categoria, arquivo_url, ordem, publicado"
        )
        .eq("publicado", true)
        .order("ordem", { ascending: true })
        .order("id", { ascending: false });

      if (error) {
        console.error("Erro ao carregar documentos:", error);
        setErro(
          "A biblioteca de documentos ainda não foi configurada no banco de dados."
        );
      } else {
        setDocumentos(data ?? []);
      }

      setCarregando(false);
    }

    carregar();
  }, []);

  const agrupados = useMemo(() => {
    const mapa: Record<string, Documento[]> = {};

    documentos.forEach((documento) => {
      const categoria = documento.categoria || "Outros";

      if (!mapa[categoria]) {
        mapa[categoria] = [];
      }

      mapa[categoria].push(documento);
    });

    return mapa;
  }, [documentos]);

  return (
    <main>
      <section className="portalHero portalHeroDocumentos">
        <div className="portalHeroTexto">
          <p className="portalKicker">
            {config("portal_documentos_kicker", "ARQUIVO INSTITUCIONAL")}
          </p>

          <h1>
            {config(
              "portal_documentos_titulo",
              "Informação organizada."
            )}
            <span>
              {" "}
              {config(
                "portal_documentos_destaque",
                "Acesso transparente."
              )}
            </span>
          </h1>

          <p className="portalHeroDescricao">
            {config(
              "portal_documentos_descricao",
              "Este espaço reúne documentos públicos da LASPOERJ em um único lugar."
            )}
          </p>
        </div>
      </section>

      <section className="portalConteudo">
        <div className="portalSecaoTopo">
          <div>
            <p className="portalKicker">DOCUMENTOS</p>
            <h2>Biblioteca institucional</h2>
          </div>

          <span className="portalContador">
            {carregando ? "—" : documentos.length}
          </span>
        </div>

        {carregando ? (
          <div className="portalEstado">Carregando documentos...</div>
        ) : erro ? (
          <div className="portalEstado portalEstadoExplicativo">
            <h3>Biblioteca ainda não configurada.</h3>
            <p>{erro}</p>
          </div>
        ) : documentos.length === 0 ? (
          <div className="portalEstado portalEstadoExplicativo">
            <h3>Nenhum documento público cadastrado.</h3>
            <p>
              A diretoria pode adicionar editais, regimentos, relatórios e
              materiais pelo painel administrativo.
            </p>
          </div>
        ) : (
          <div className="portalDocumentosPublicos">
            {Object.entries(agrupados).map(([categoria, itens]) => (
              <section key={categoria}>
                <div className="portalDocumentosCategoriaTitulo">
                  <span>{categoria}</span>
                  <strong>{String(itens.length).padStart(2, "0")}</strong>
                </div>

                <div className="portalDocumentosLista">
                  {itens.map((documento) => (
                    <article key={documento.id}>
                      <div>
                        <h3>{documento.titulo}</h3>
                        {documento.descricao && (
                          <p>{documento.descricao}</p>
                        )}
                      </div>

                      <a
                        href={documento.arquivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir PDF ↗
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
