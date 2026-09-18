"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TipoCampo = "text" | "textarea" | "url" | "select";

type Campo = {
  chave: string;
  rotulo: string;
  descricao: string;
  fallback: string;
  tipo?: TipoCampo;
  opcoes?: string[];
};

type Grupo = {
  titulo: string;
  descricao: string;
  pagina: string;
  campos: Campo[];
};

const grupos: Grupo[] = [
  {
    titulo: "Institucional",
    descricao:
      "Conteúdo da página que apresenta a identidade e o propósito da LASPOERJ.",
    pagina: "/institucional",
    campos: [
      {
        chave: "portal_institucional_kicker",
        rotulo: "Etiqueta do topo",
        descricao: "Texto pequeno exibido acima do título.",
        fallback: "CONHEÇA A LASPOERJ",
      },
      {
        chave: "portal_institucional_titulo",
        rotulo: "Título principal",
        descricao: "Primeira parte do título.",
        fallback: "Uma Liga construída entre",
      },
      {
        chave: "portal_institucional_destaque",
        rotulo: "Trecho em destaque",
        descricao: "Parte em turquesa/itálico do título.",
        fallback: "universidade, ciência e território.",
      },
      {
        chave: "portal_institucional_descricao",
        rotulo: "Descrição principal",
        descricao: "Parágrafo abaixo do título.",
        fallback:
          "A LASPOERJ integra ensino, pesquisa e extensão para aproximar a formação odontológica das necessidades da saúde coletiva e da comunidade.",
        tipo: "textarea",
      },
      {
        chave: "portal_institucional_frase",
        rotulo: "Frase institucional",
        descricao: "Frase em destaque no card lateral.",
        fallback: "“Saúde bucal também é saúde coletiva.”",
        tipo: "textarea",
      },
      {
        chave: "portal_institucional_nota",
        rotulo: "Texto do card lateral",
        descricao: "Complemento abaixo da frase institucional.",
        fallback:
          "Formação acadêmica com compromisso social, científico e humano.",
        tipo: "textarea",
      },
      {
        chave: "portal_proposito_titulo",
        rotulo: "Título do propósito",
        descricao: "Título da seção Nosso propósito.",
        fallback:
          "Mais do que uma Liga Acadêmica, um espaço de construção coletiva.",
        tipo: "textarea",
      },
      {
        chave: "portal_proposito_texto_1",
        rotulo: "Propósito — parágrafo 1",
        descricao: "Primeiro texto da seção.",
        fallback:
          "A LASPOERJ busca ampliar a compreensão da Odontologia dentro da saúde pública, fortalecendo o vínculo entre universidade, SUS, território e comunidade.",
        tipo: "textarea",
      },
      {
        chave: "portal_proposito_texto_2",
        rotulo: "Propósito — parágrafo 2",
        descricao: "Segundo texto da seção.",
        fallback:
          "Nossas atividades podem envolver formação complementar, desenvolvimento científico, ações de educação em saúde, participação comunitária e projetos extensionistas.",
        tipo: "textarea",
      },
      {
        chave: "portal_ensino_texto",
        rotulo: "Pilar Ensino",
        descricao: "Descrição do pilar Ensino.",
        fallback:
          "Encontros acadêmicos, debates, atividades formativas e construção de conhecimento para além da sala de aula.",
        tipo: "textarea",
      },
      {
        chave: "portal_pesquisa_pilar_texto",
        rotulo: "Pilar Pesquisa",
        descricao: "Descrição do pilar Pesquisa.",
        fallback:
          "Incentivo à investigação, leitura científica e desenvolvimento de produções acadêmicas relacionadas à saúde coletiva.",
        tipo: "textarea",
      },
      {
        chave: "portal_extensao_texto",
        rotulo: "Pilar Extensão",
        descricao: "Descrição do pilar Extensão.",
        fallback:
          "Aproximação entre universidade e comunidade por meio de ações de promoção, prevenção e educação em saúde.",
        tipo: "textarea",
      },
    ],
  },
  {
    titulo: "Projetos e Ações",
    descricao:
      "A listagem de projetos vem das publicações. Aqui você controla a apresentação da página.",
    pagina: "/projetos",
    campos: [
      {
        chave: "portal_projetos_kicker",
        rotulo: "Etiqueta do topo",
        descricao: "Texto acima do título.",
        fallback: "EXTENSÃO • TERRITÓRIO • COMUNIDADE",
      },
      {
        chave: "portal_projetos_titulo",
        rotulo: "Título principal",
        descricao: "Primeira parte do título.",
        fallback: "Projetos que saem da universidade e",
      },
      {
        chave: "portal_projetos_destaque",
        rotulo: "Trecho em destaque",
        descricao: "Parte destacada do título.",
        fallback: "encontram pessoas.",
      },
      {
        chave: "portal_projetos_descricao",
        rotulo: "Descrição",
        descricao: "Texto abaixo do título.",
        fallback:
          "Este espaço reúne ações, projetos e iniciativas extensionistas desenvolvidas ou apoiadas pela LASPOERJ.",
        tipo: "textarea",
      },
      {
        chave: "portal_projetos_chamada",
        rotulo: "Chamada final",
        descricao: "Título da faixa azul no final.",
        fallback: "Da universidade para a comunidade.",
      },
      {
        chave: "portal_projetos_chamada_texto",
        rotulo: "Texto da chamada final",
        descricao: "Texto da faixa azul no final.",
        fallback:
          "Cada ação é uma oportunidade de aproximar conhecimento científico, promoção da saúde e responsabilidade social.",
        tipo: "textarea",
      },
    ],
  },
  {
    titulo: "Produção Científica",
    descricao:
      "A listagem científica vem das publicações. Aqui você controla os textos da página.",
    pagina: "/pesquisa",
    campos: [
      {
        chave: "portal_pesquisa_kicker",
        rotulo: "Etiqueta do topo",
        descricao: "Texto acima do título.",
        fallback: "INVESTIGAÇÃO • EVIDÊNCIA • CONHECIMENTO",
      },
      {
        chave: "portal_pesquisa_titulo",
        rotulo: "Título principal",
        descricao: "Primeira parte do título.",
        fallback: "Produção científica para",
      },
      {
        chave: "portal_pesquisa_destaque",
        rotulo: "Trecho em destaque",
        descricao: "Parte destacada do título.",
        fallback: "compreender e transformar.",
      },
      {
        chave: "portal_pesquisa_descricao",
        rotulo: "Descrição",
        descricao: "Texto abaixo do título.",
        fallback:
          "Pesquisa também faz parte da saúde coletiva. A LASPOERJ incentiva o pensamento científico, a investigação e a divulgação de conhecimento.",
        tipo: "textarea",
      },
      {
        chave: "portal_pesquisa_manifesto_titulo",
        rotulo: "Título da seção Pesquisa na Liga",
        descricao: "Título do bloco intermediário.",
        fallback: "Conhecimento científico como parte da formação.",
      },
      {
        chave: "portal_pesquisa_manifesto_1",
        rotulo: "Pesquisa — parágrafo 1",
        descricao: "Primeiro texto do bloco.",
        fallback:
          "A produção científica fortalece a capacidade crítica dos estudantes e contribui para compreender problemas reais de saúde.",
        tipo: "textarea",
      },
      {
        chave: "portal_pesquisa_manifesto_2",
        rotulo: "Pesquisa — parágrafo 2",
        descricao: "Segundo texto do bloco.",
        fallback:
          "Esta página poderá reunir pesquisas em andamento, trabalhos apresentados, resumos, artigos e produções vinculadas à LASPOERJ.",
        tipo: "textarea",
      },
    ],
  },
  {
    titulo: "Transparência e Impacto",
    descricao:
      "Alguns números são automáticos e outros podem ser atualizados manualmente.",
    pagina: "/transparencia",
    campos: [
      {
        chave: "portal_transparencia_kicker",
        rotulo: "Etiqueta do topo",
        descricao: "Texto acima do título.",
        fallback: "TRANSPARÊNCIA • RESPONSABILIDADE • IMPACTO",
      },
      {
        chave: "portal_transparencia_titulo",
        rotulo: "Título principal",
        descricao: "Primeira parte do título.",
        fallback: "Mostrar o que fazemos também faz parte do",
      },
      {
        chave: "portal_transparencia_destaque",
        rotulo: "Trecho em destaque",
        descricao: "Parte destacada do título.",
        fallback: "compromisso coletivo.",
      },
      {
        chave: "portal_transparencia_descricao",
        rotulo: "Descrição",
        descricao: "Texto abaixo do título.",
        fallback:
          "A LASPOERJ busca apresentar de forma clara sua estrutura e os resultados construídos ao longo de suas atividades.",
        tipo: "textarea",
      },
      {
        chave: "numero_ligantes",
        rotulo: "Número de ligantes",
        descricao: "Ex.: +10, +20, 35.",
        fallback: "+10",
      },
      {
        chave: "impacto_pessoas",
        rotulo: "Pessoas alcançadas",
        descricao: "Número manual. Ex.: +250.",
        fallback: "—",
      },
      {
        chave: "impacto_acoes",
        rotulo: "Ações realizadas",
        descricao: "Número manual de ações já realizadas.",
        fallback: "—",
      },
    ],
  },
  {
    titulo: "Processo Seletivo",
    descricao:
      "Controle o status, links e apresentação da página Faça parte.",
    pagina: "/processo-seletivo",
    campos: [
      {
        chave: "portal_processo_kicker",
        rotulo: "Etiqueta do topo",
        descricao: "Texto acima do título.",
        fallback: "PARTICIPE DA LASPOERJ",
      },
      {
        chave: "portal_processo_titulo",
        rotulo: "Título principal",
        descricao: "Primeira parte do título.",
        fallback: "Pessoas diferentes.",
      },
      {
        chave: "portal_processo_destaque",
        rotulo: "Trecho em destaque",
        descricao: "Parte destacada do título.",
        fallback: "Um compromisso coletivo.",
      },
      {
        chave: "portal_processo_descricao",
        rotulo: "Descrição",
        descricao: "Texto abaixo do título.",
        fallback:
          "Esta página concentra as informações sobre ingresso, editais e futuras oportunidades para participar da Liga.",
        tipo: "textarea",
      },
      {
        chave: "processo_status",
        rotulo: "Status do processo seletivo",
        descricao: "É o texto grande exibido no card.",
        fallback: "Em breve",
        tipo: "select",
        opcoes: [
          "Em breve",
          "Inscrições abertas",
          "Inscrições encerradas",
          "Resultado disponível",
        ],
      },
      {
        chave: "processo_status_descricao",
        rotulo: "Mensagem do status",
        descricao: "Explicação abaixo do status.",
        fallback:
          "Quando um novo processo seletivo for divulgado, as informações aparecerão aqui.",
        tipo: "textarea",
      },
      {
        chave: "processo_inscricao_url",
        rotulo: "Link de inscrição",
        descricao:
          "Cole o link do Forms ou da página de inscrição. Deixe vazio para esconder o botão.",
        fallback: "",
        tipo: "url",
      },
      {
        chave: "processo_edital_url",
        rotulo: "Link do edital",
        descricao:
          "Cole o link público do edital. Deixe vazio para esconder o botão.",
        fallback: "",
        tipo: "url",
      },
    ],
  },
  {
    titulo: "Documentos",
    descricao:
      "Edite o cabeçalho da biblioteca. Os PDFs são gerenciados em Documentos.",
    pagina: "/documentos",
    campos: [
      {
        chave: "portal_documentos_kicker",
        rotulo: "Etiqueta do topo",
        descricao: "Texto acima do título.",
        fallback: "ARQUIVO INSTITUCIONAL",
      },
      {
        chave: "portal_documentos_titulo",
        rotulo: "Título principal",
        descricao: "Primeira parte do título.",
        fallback: "Informação organizada.",
      },
      {
        chave: "portal_documentos_destaque",
        rotulo: "Trecho em destaque",
        descricao: "Parte destacada do título.",
        fallback: "Acesso transparente.",
      },
      {
        chave: "portal_documentos_descricao",
        rotulo: "Descrição",
        descricao: "Texto abaixo do título.",
        fallback:
          "Este espaço reúne documentos públicos da LASPOERJ em um único lugar.",
        tipo: "textarea",
      },
    ],
  },
];

export default function PortalPublicoAdminPage() {
  const todosCampos = useMemo(
    () => grupos.flatMap((grupo) => grupo.campos),
    []
  );

  const [valores, setValores] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setMensagem("");

    const chaves = todosCampos.map((campo) => campo.chave);

    const { data, error } = await supabase
      .from("configuracoes_site")
      .select("chave, valor")
      .in("chave", chaves);

    if (error) {
      console.error(error);
      setMensagem(`Erro ao carregar o portal: ${error.message}`);
      setCarregando(false);
      return;
    }

    const mapa: Record<string, string> = {};

    todosCampos.forEach((campo) => {
      mapa[campo.chave] = campo.fallback;
    });

    (data ?? []).forEach((item) => {
      mapa[item.chave] = item.valor ?? "";
    });

    setValores(mapa);
    setCarregando(false);
  }

  function alterar(chave: string, valor: string) {
    setValores((atual) => ({
      ...atual,
      [chave]: valor,
    }));
  }

  async function salvar() {
    setSalvando(true);
    setMensagem("");

    const linhas = todosCampos.map((campo) => ({
      chave: campo.chave,
      valor: valores[campo.chave] ?? campo.fallback,
      descricao: campo.descricao,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("configuracoes_site")
      .upsert(linhas, { onConflict: "chave" });

    if (error) {
      console.error(error);
      setMensagem(`Erro ao salvar: ${error.message}`);
      setSalvando(false);
      return;
    }

    setMensagem("Portal público atualizado com sucesso.");
    setSalvando(false);
  }

  if (carregando) {
    return (
      <div className="painelDashboard">
        <div className="painelEstadoVazio">
          Carregando páginas públicas...
        </div>
      </div>
    );
  }

  return (
    <div className="painelDashboard portalAdminPagina">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">PORTAL PÚBLICO</p>
          <h1>Páginas do site</h1>
          <p>
            Edite os textos das novas páginas sem precisar abrir o código.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={salvar}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {mensagem && <div className="painelMensagem">{mensagem}</div>}

      <section className="portalAdminAjuda">
        <div>
          <strong>Projetos e Pesquisa</strong>
          <p>
            Os itens dessas páginas vêm do LASPOERJ em Ação. Use as categorias
            Projeto, Ação, Extensão, Pesquisa, Produção Científica, Artigo,
            Trabalho ou Resumo.
          </p>
        </div>

        <Link href="/area-interna/painel/jornal">
          Gerenciar publicações →
        </Link>
      </section>

      <div className="portalAdminGrupos">
        {grupos.map((grupo) => (
          <section className="portalAdminCard" key={grupo.titulo}>
            <div className="portalAdminCardTopo">
              <div>
                <span>PÁGINA PÚBLICA</span>
                <h2>{grupo.titulo}</h2>
                <p>{grupo.descricao}</p>
              </div>

              <Link href={grupo.pagina} target="_blank">
                Visualizar ↗
              </Link>
            </div>

            <div className="portalAdminCampos">
              {grupo.campos.map((campo) => (
                <label key={campo.chave}>
                  <span>{campo.rotulo}</span>

                  {campo.tipo === "textarea" ? (
                    <textarea
                      rows={4}
                      value={valores[campo.chave] ?? ""}
                      onChange={(e) =>
                        alterar(campo.chave, e.target.value)
                      }
                    />
                  ) : campo.tipo === "select" ? (
                    <select
                      value={valores[campo.chave] ?? campo.fallback}
                      onChange={(e) =>
                        alterar(campo.chave, e.target.value)
                      }
                    >
                      {(campo.opcoes ?? []).map((opcao) => (
                        <option value={opcao} key={opcao}>
                          {opcao}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo === "url" ? "url" : "text"}
                      value={valores[campo.chave] ?? ""}
                      onChange={(e) =>
                        alterar(campo.chave, e.target.value)
                      }
                      placeholder={campo.fallback}
                    />
                  )}

                  <small>{campo.descricao}</small>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="configuracoesRodape">
        <button
          type="button"
          className="painelBotaoSecundario"
          onClick={carregar}
          disabled={salvando}
        >
          Descartar alterações
        </button>

        <button
          type="button"
          className="painelBotaoPrincipal"
          onClick={salvar}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
