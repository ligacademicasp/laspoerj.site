"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import usePortalConfig from "../usePortalConfig";

type Indicadores = {
  ligantes: string;
  diretoria: number;
  orientadores: number;
  eventos: number;
  publicacoes: number;
};

const inicial: Indicadores = {
  ligantes: "+10",
  diretoria: 0,
  orientadores: 0,
  eventos: 0,
  publicacoes: 0,
};

export default function TransparenciaPage() {
  const { config } = usePortalConfig();
  const [dados, setDados] = useState<Indicadores>(inicial);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [equipeR, eventosR, publicacoesR, configuracoesR] =
        await Promise.all([
          supabase
            .from("equipe")
            .select("grupo")
            .eq("ativo", true),

          supabase
            .from("eventos")
            .select("*", { count: "exact", head: true })
            .eq("publicado", true),

          supabase
            .from("publicacoes")
            .select("*", { count: "exact", head: true })
            .eq("publicado", true),

          supabase
            .from("configuracoes_site")
            .select("chave, valor")
            .eq("chave", "numero_ligantes")
            .maybeSingle(),
        ]);

      const equipe = equipeR.data ?? [];

      setDados({
        ligantes: configuracoesR.data?.valor || "+10",
        diretoria: equipe.filter((item) => item.grupo === "diretoria").length,
        orientadores: equipe.filter((item) => item.grupo === "orientador").length,
        eventos: eventosR.count ?? 0,
        publicacoes: publicacoesR.count ?? 0,
      });

      setCarregando(false);
    }

    carregar();
  }, []);

  const pessoas = config("impacto_pessoas", "—");
  const acoes = config("impacto_acoes", "—");

  return (
    <main>
      <section className="portalHero portalHeroTransparencia">
        <div className="portalHeroTexto">
          <p className="portalKicker">
            {config(
              "portal_transparencia_kicker",
              "TRANSPARÊNCIA • RESPONSABILIDADE • IMPACTO"
            )}
          </p>

          <h1>
            {config(
              "portal_transparencia_titulo",
              "Mostrar o que fazemos também faz parte do"
            )}
            <span>
              {" "}
              {config(
                "portal_transparencia_destaque",
                "compromisso coletivo."
              )}
            </span>
          </h1>

          <p className="portalHeroDescricao">
            {config(
              "portal_transparencia_descricao",
              "A LASPOERJ busca apresentar de forma clara sua estrutura e os resultados construídos ao longo de suas atividades."
            )}
          </p>
        </div>
      </section>

      <section className="portalImpacto">
        <div>
          <strong>{carregando ? "—" : dados.ligantes}</strong>
          <span>Ligantes</span>
        </div>

        <div>
          <strong>
            {carregando ? "—" : String(dados.diretoria).padStart(2, "0")}
          </strong>
          <span>Membros da diretoria</span>
        </div>

        <div>
          <strong>
            {carregando ? "—" : String(dados.orientadores).padStart(2, "0")}
          </strong>
          <span>Professores orientadores</span>
        </div>

        <div>
          <strong>
            {carregando ? "—" : String(dados.eventos).padStart(2, "0")}
          </strong>
          <span>Eventos publicados</span>
        </div>

        <div>
          <strong>
            {carregando ? "—" : String(dados.publicacoes).padStart(2, "0")}
          </strong>
          <span>Publicações</span>
        </div>

        <div>
          <strong>{pessoas}</strong>
          <span>Pessoas alcançadas</span>
        </div>

        <div>
          <strong>{acoes}</strong>
          <span>Ações realizadas</span>
        </div>
      </section>

      <section className="portalConteudo">
        <div className="portalSecaoTopo">
          <div>
            <p className="portalKicker">PRESTAÇÃO DE CONTAS</p>
            <h2>O que poderá ser acompanhado aqui</h2>
          </div>
        </div>

        <div className="portalCardsLinks portalCardsLinksTres">
          <Link href="/projetos">
            <span>01</span>
            <h3>Projetos e ações</h3>
            <p>
              Registro das iniciativas desenvolvidas pela Liga junto à
              universidade e à comunidade.
            </p>
            <strong>Ver projetos →</strong>
          </Link>

          <Link href="/pesquisa">
            <span>02</span>
            <h3>Produção científica</h3>
            <p>
              Trabalhos, pesquisas, apresentações e produções acadêmicas
              vinculadas à atuação da LASPOERJ.
            </p>
            <strong>Ver produção →</strong>
          </Link>

          <Link href="/documentos">
            <span>03</span>
            <h3>Documentos públicos</h3>
            <p>
              Editais, regulamentos e documentos institucionais disponibilizados
              publicamente.
            </p>
            <strong>Acessar documentos →</strong>
          </Link>
        </div>
      </section>

      <section className="portalTransparenciaNota">
        <p>
          Os indicadores automáticos usam os dados cadastrados no site.
          “Pessoas alcançadas” e “Ações realizadas” podem ser atualizados
          manualmente pelo painel administrativo.
        </p>
      </section>
    </main>
  );
}
