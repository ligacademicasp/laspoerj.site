"use client";

import Link from "next/link";
import usePortalConfig from "../usePortalConfig";

const paginas = [
  {
    numero: "01",
    titulo: "Projetos e Ações",
    texto:
      "Conheça as iniciativas de extensão, educação em saúde e atividades desenvolvidas junto à comunidade.",
    href: "/projetos",
  },
  {
    numero: "02",
    titulo: "Produção Científica",
    texto:
      "Pesquisas, trabalhos acadêmicos, resumos, apresentações e produção científica vinculada à Liga.",
    href: "/pesquisa",
  },
  {
    numero: "03",
    titulo: "Transparência e Impacto",
    texto:
      "Acompanhe números, atividades e indicadores que ajudam a mostrar o alcance institucional da LASPOERJ.",
    href: "/transparencia",
  },
  {
    numero: "04",
    titulo: "Faça parte",
    texto:
      "Entenda como funcionam os processos seletivos e como estudantes podem participar da LASPOERJ.",
    href: "/processo-seletivo",
  },
  {
    numero: "05",
    titulo: "Documentos",
    texto:
      "Espaço destinado a editais, regulamentos, documentos institucionais e materiais públicos da Liga.",
    href: "/documentos",
  },
];

export default function InstitucionalPage() {
  const { config } = usePortalConfig();

  return (
    <main>
      <section className="portalHero portalHeroInstitucional">
        <div className="portalHeroTexto">
          <p className="portalKicker">
            {config("portal_institucional_kicker", "CONHEÇA A LASPOERJ")}
          </p>

          <h1>
            {config(
              "portal_institucional_titulo",
              "Uma Liga construída entre"
            )}
            <span>
              {" "}
              {config(
                "portal_institucional_destaque",
                "universidade, ciência e território."
              )}
            </span>
          </h1>

          <p className="portalHeroDescricao">
            {config(
              "portal_institucional_descricao",
              "A LASPOERJ integra ensino, pesquisa e extensão para aproximar a formação odontológica das necessidades da saúde coletiva e da comunidade."
            )}
          </p>
        </div>

        <aside className="portalHeroNota">
          <span>LASPOERJ • 2026</span>

          <blockquote>
            {config(
              "portal_institucional_frase",
              "“Saúde bucal também é saúde coletiva.”"
            )}
          </blockquote>

          <p>
            {config(
              "portal_institucional_nota",
              "Formação acadêmica com compromisso social, científico e humano."
            )}
          </p>
        </aside>
      </section>

      <section className="portalManifesto">
        <div>
          <p className="portalKicker">NOSSO PROPÓSITO</p>
          <h2>
            {config(
              "portal_proposito_titulo",
              "Mais do que uma Liga Acadêmica, um espaço de construção coletiva."
            )}
          </h2>
        </div>

        <div className="portalManifestoTexto">
          <p>
            {config(
              "portal_proposito_texto_1",
              "A LASPOERJ busca ampliar a compreensão da Odontologia dentro da saúde pública, fortalecendo o vínculo entre universidade, SUS, território e comunidade."
            )}
          </p>

          <p>
            {config(
              "portal_proposito_texto_2",
              "Nossas atividades podem envolver formação complementar, desenvolvimento científico, ações de educação em saúde, participação comunitária e projetos extensionistas."
            )}
          </p>
        </div>
      </section>

      <section className="portalTresPilares">
        <article>
          <span>01</span>
          <h3>Ensino</h3>
          <p>
            {config(
              "portal_ensino_texto",
              "Encontros acadêmicos, debates, atividades formativas e construção de conhecimento para além da sala de aula."
            )}
          </p>
        </article>

        <article>
          <span>02</span>
          <h3>Pesquisa</h3>
          <p>
            {config(
              "portal_pesquisa_pilar_texto",
              "Incentivo à investigação, leitura científica e desenvolvimento de produções acadêmicas relacionadas à saúde coletiva."
            )}
          </p>
        </article>

        <article>
          <span>03</span>
          <h3>Extensão</h3>
          <p>
            {config(
              "portal_extensao_texto",
              "Aproximação entre universidade e comunidade por meio de ações de promoção, prevenção e educação em saúde."
            )}
          </p>
        </article>
      </section>

      <section className="portalNavegacaoInstitucional">
        <div className="portalSecaoTopo">
          <div>
            <p className="portalKicker">EXPLORE O SITE</p>
            <h2>Conheça outras áreas da LASPOERJ</h2>
          </div>
        </div>

        <div className="portalCardsLinks">
          {paginas.map((pagina) => (
            <Link href={pagina.href} key={pagina.href}>
              <span>{pagina.numero}</span>
              <h3>{pagina.titulo}</h3>
              <p>{pagina.texto}</p>
              <strong>Acessar página →</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
