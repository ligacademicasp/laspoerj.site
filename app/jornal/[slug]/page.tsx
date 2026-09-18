"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import MarkdownContent from "@/components/MarkdownContent";
import ThemeToggle from "@/components/ThemeToggle";

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
  const params = useParams();
  const slug = String(params.slug ?? "");

  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPublicacao() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, slug, titulo, resumo, conteudo, autor, categoria, imagem_url, destaque, publicado, data_publicacao"
        )
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar publicação:", error);
        setErro("Não foi possível carregar esta publicação.");
        setCarregando(false);
        return;
      }

      if (!data) {
        setErro("Esta publicação não foi encontrada.");
        setCarregando(false);
        return;
      }

      setPublicacao(data as Publicacao);
      setCarregando(false);
    }

    if (slug) {
      carregarPublicacao();
    }
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
        <div className="materiaContainer">
          <div className="materiaEstado">
            <p>Carregando publicação...</p>
          </div>
        </div>
      </main>
    );
  }

  if (erro || !publicacao) {
    return (
      <main className="materiaPagina">
        <div className="materiaContainer">
          <div className="materiaEstado">
            <h1>Publicação indisponível</h1>
            <p>{erro}</p>

            <Link href="/jornal" className="materiaVoltar materiaVoltarFinal">
              ← Voltar ao LASPOERJ em Ação
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="materiaPagina">
      <div className="materiaContainer">
        <div className="materiaBarraTopo">
          <Link href="/" className="materiaMarca">
            <Image
              src="/logo.png"
              alt="LASPOERJ"
              width={54}
              height={54}
              priority
            />

            <div>
              <strong>LASPOERJ</strong>
              <span>LASPOERJ EM AÇÃO</span>
            </div>
          </Link>

          <div className="materiaAcoesTopo">
            <ThemeToggle />

            <Link href="/jornal" className="materiaVoltar">
              ← Todas as publicações
            </Link>
          </div>
        </div>

        <article>
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
            <div className="materiaImagemBox materiaImagemInteira">
              <img
                src={publicacao.imagem_url}
                alt={publicacao.titulo}
                className="materiaImagem"
              />
            </div>
          )}

          <div className="materiaConteudo">
            <MarkdownContent
              content={
                publicacao.conteudo ||
                "Conteúdo indisponível."
              }
            />
          </div>

          <footer className="materiaRodape">
            <Link
              href="/jornal"
              className="materiaVoltar materiaVoltarFinal"
            >
              ← Voltar ao LASPOERJ em Ação
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
