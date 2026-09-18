"use client";

import Link from "next/link";
import usePortalConfig from "../usePortalConfig";

export default function ProcessoSeletivoPage() {
  const { config } = usePortalConfig();

  const status = config("processo_status", "Em breve");
  const inscricaoUrl = config("processo_inscricao_url", "");
  const editalUrl = config("processo_edital_url", "");

  return (
    <main>
      <section className="portalHero portalHeroCompacto">
        <div className="portalHeroTexto">
          <p className="portalKicker">
            {config("portal_processo_kicker", "PARTICIPE DA LASPOERJ")}
          </p>

          <h1>
            {config("portal_processo_titulo", "Pessoas diferentes.")}
            <span>
              {" "}
              {config(
                "portal_processo_destaque",
                "Um compromisso coletivo."
              )}
            </span>
          </h1>

          <p className="portalHeroDescricao">
            {config(
              "portal_processo_descricao",
              "Esta página concentra as informações sobre ingresso, editais e futuras oportunidades para participar da Liga."
            )}
          </p>
        </div>

        <aside className="portalStatusCard">
          <span>PROCESSO SELETIVO</span>
          <strong>{status}</strong>

          <p>
            {config(
              "processo_status_descricao",
              "Quando um novo processo seletivo for divulgado, as informações aparecerão aqui."
            )}
          </p>

          {(inscricaoUrl || editalUrl) && (
            <div className="portalStatusAcoes">
              {inscricaoUrl && (
                <a href={inscricaoUrl} target="_blank" rel="noopener noreferrer">
                  Fazer inscrição ↗
                </a>
              )}

              {editalUrl && (
                <a href={editalUrl} target="_blank" rel="noopener noreferrer">
                  Ver edital ↗
                </a>
              )}
            </div>
          )}
        </aside>
      </section>

      <section className="portalConteudo">
        <div className="portalSecaoTopo">
          <div>
            <p className="portalKicker">COMO FUNCIONA</p>
            <h2>Faça parte da LASPOERJ</h2>
          </div>
        </div>

        <div className="portalEtapas">
          <article>
            <span>01</span>
            <h3>Edital</h3>
            <p>
              A abertura de vagas, requisitos e cronograma serão publicados
              oficialmente neste espaço.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>Inscrição</h3>
            <p>
              O edital indicará o formulário, prazo de inscrição e documentos
              necessários para participação.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>Seleção</h3>
            <p>
              As etapas de seleção poderão variar de acordo com cada processo
              e serão descritas no edital correspondente.
            </p>
          </article>

          <article>
            <span>04</span>
            <h3>Ingresso</h3>
            <p>
              Os candidatos aprovados receberão orientações sobre integração,
              atividades e funcionamento da Liga.
            </p>
          </article>
        </div>
      </section>

      <section className="portalChamadaEscura">
        <div>
          <p>QUER ACOMPANHAR?</p>
          <h2>Fique de olho nos canais oficiais.</h2>
        </div>

        <div className="portalChamadaAcoes">
          <Link href="/#contato">Contato →</Link>
          <Link href="/jornal">LASPOERJ em Ação →</Link>
        </div>
      </section>
    </main>
  );
}
