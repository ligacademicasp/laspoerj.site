"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function PublicacaoPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPublicacao() {
      if (!slug) {
        setErro("Publicação não encontrada.");
        setCarregando(false);
        return;
      }

      let consulta = supabase
        .from("publicacoes")
        .select(
          "id, slug, titulo, resumo, conteudo, autor, categoria, imagem_url, destaque, publicado, data_publicacao"
        )
        .eq("publicado", true);

      // Compatibilidade com links antigos como /jornal/3
      if (/^\d+$/.test(slug)) {
        consulta = consulta.eq("id", Number(slug));
      } else {
        consulta = consulta.eq("slug", slug);
      }

      const { data, error } = await consulta.maybeSingle();

      if (error) {
        console.error("Erro ao carregar publicação:", error);
        setErro("Não foi possível carregar esta publicação.");
        setCarregando(false);
        return;
      }

      if (!data) {
        setErro("Esta publicação não existe ou não está disponível.");
        setCarregando(false);
        return;
      }

      setPublicacao(data);
      setCarregando(false);
    }

    carregarPublicacao();
  }, [slug]);

  function formatarData(data: string | null) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-").map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (carregando) {
    return (
      <main className="materiaPagina">
        <div className="materiaEstado">
          Carregando publicação...
        </div>
      </main>
    );
  }

  if (erro || !publicacao) {
    return (
      <main className="materiaPagina">
        <div className="materiaEstado">
          <h1>Publicação indisponível</h1>
          <p>{erro}</p>

          <a href="/jornal" className="materiaVoltar">
            ← Voltar ao Jornal LASPOERJ
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="materiaPagina">
      <article className="materiaContainer">
        <a href="/jornal" className="materiaVoltar">
          ← Voltar ao Jornal LASPOERJ
        </a>

        <header className="materiaCabecalho">
          <div className="materiaMeta">
            {publicacao.categoria && (
              <span>{publicacao.categoria}</span>
            )}

            {publicacao.data_publicacao && (
              <small>
                {formatarData(publicacao.data_publicacao)}
              </small>
            )}
          </div>

          <h1>{publicacao.titulo}</h1>

          {publicacao.resumo && (
            <p className="materiaResumo">
              {publicacao.resumo}
            </p>
          )}

          {publicacao.autor && (
            <p className="materiaAutor">
              Por {publicacao.autor}
            </p>
          )}
        </header>

        {publicacao.imagem_url && (
          <div className="materiaImagemBox">
            <img
              src={publicacao.imagem_url}
              alt={publicacao.titulo}
              className="materiaImagem"
            />
          </div>
        )}

        <div className="materiaConteudo">
          {(publicacao.conteudo || "")
            .split("\n")
            .map((paragrafo, indice) =>
              paragrafo.trim() ? (
                <p key={indice}>{paragrafo}</p>
              ) : (
                <br key={indice} />
              )
            )}
        </div>

        <div className="materiaRodape">
          <a
            href="/jornal"
            className="materiaVoltar materiaVoltarFinal"
          >
            ← Voltar para outras publicações
          </a>
        </div>
      </article>
    </main>
  );
}