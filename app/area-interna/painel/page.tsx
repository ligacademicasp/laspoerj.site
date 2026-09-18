"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Perfil = {
  nome: string | null;
  cargo: string | null;
  tipo_usuario: string | null;
};

type Evento = {
  id: number;
  titulo: string;
  data_evento: string;
  horario: string | null;
  local: string | null;
  destaque: boolean;
  publicado: boolean;
};

type Resumo = {
  eventos: number;
  publicacoes: number;
  avisos: number;
  sugestoes: number;
  equipe: number;
  usuariosAtivos: number;
  sugestoesNovas: number;
  sugestoesNaoLidas: number;
  publicacoesRascunho: number;
  eventosRascunho: number;
  avisosExpirando: number;
};

const resumoInicial: Resumo = {
  eventos: 0,
  publicacoes: 0,
  avisos: 0,
  sugestoes: 0,
  equipe: 0,
  usuariosAtivos: 0,
  sugestoesNovas: 0,
  sugestoesNaoLidas: 0,
  publicacoesRascunho: 0,
  eventosRascunho: 0,
  avisosExpirando: 0,
};

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function adicionarDias(data: Date, dias: number) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

export default function PainelDashboardPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [resumo, setResumo] = useState<Resumo>(resumoInicial);
  const [proximoEvento, setProximoEvento] = useState<Evento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setCarregando(true);
    setErro("");

    const hoje = new Date();
    const hojeISO = dataLocalISO(hoje);
    const limiteAvisosISO = dataLocalISO(adicionarDias(hoje, 7));

    try {
      const { data: usuarioData } = await supabase.auth.getUser();
      const usuario = usuarioData.user;

      const perfilPromise = usuario
        ? supabase
            .from("profiles")
            .select("nome, cargo, tipo_usuario")
            .eq("id", usuario.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null });

      const [
        perfilResultado,
        eventosTotal,
        publicacoesTotal,
        avisosTotal,
        sugestoesTotal,
        equipeTotal,
        usuariosAtivos,
        sugestoesNovas,
        sugestoesNaoLidas,
        publicacoesRascunho,
        eventosRascunho,
        avisosExpirando,
        proximoEventoResultado,
      ] = await Promise.all([
        perfilPromise,

        supabase
          .from("eventos")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("publicacoes")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("avisos")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("sugestoes")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("equipe")
          .select("*", { count: "exact", head: true })
          .eq("ativo", true),

        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("ativo", true),

        supabase
          .from("sugestoes")
          .select("*", { count: "exact", head: true })
          .or("status.is.null,status.eq.nova"),

        supabase
          .from("sugestoes")
          .select("*", { count: "exact", head: true })
          .or("lida.is.null,lida.eq.false"),

        supabase
          .from("publicacoes")
          .select("*", { count: "exact", head: true })
          .eq("publicado", false),

        supabase
          .from("eventos")
          .select("*", { count: "exact", head: true })
          .eq("publicado", false),

        supabase
          .from("avisos")
          .select("*", { count: "exact", head: true })
          .gte("data_expiracao", hojeISO)
          .lte("data_expiracao", limiteAvisosISO),

        supabase
          .from("eventos")
          .select(
            "id, titulo, data_evento, horario, local, destaque, publicado"
          )
          .gte("data_evento", hojeISO)
          .order("data_evento", { ascending: true })
          .order("horario", { ascending: true, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (perfilResultado.error) {
        console.error("Erro ao carregar perfil:", perfilResultado.error);
      } else {
        setPerfil((perfilResultado.data as Perfil | null) ?? null);
      }

      const resultadosComErro = [
        eventosTotal,
        publicacoesTotal,
        avisosTotal,
        sugestoesTotal,
        equipeTotal,
        usuariosAtivos,
        sugestoesNovas,
        sugestoesNaoLidas,
        publicacoesRascunho,
        eventosRascunho,
        avisosExpirando,
        proximoEventoResultado,
      ].filter((resultado) => resultado.error);

      resultadosComErro.forEach((resultado) => {
        console.error("Erro no dashboard:", resultado.error);
      });

      setResumo({
        eventos: eventosTotal.count ?? 0,
        publicacoes: publicacoesTotal.count ?? 0,
        avisos: avisosTotal.count ?? 0,
        sugestoes: sugestoesTotal.count ?? 0,
        equipe: equipeTotal.count ?? 0,
        usuariosAtivos: usuariosAtivos.count ?? 0,
        sugestoesNovas: sugestoesNovas.count ?? 0,
        sugestoesNaoLidas: sugestoesNaoLidas.count ?? 0,
        publicacoesRascunho: publicacoesRascunho.count ?? 0,
        eventosRascunho: eventosRascunho.count ?? 0,
        avisosExpirando: avisosExpirando.count ?? 0,
      });

      setProximoEvento(
        (proximoEventoResultado.data as Evento | null) ?? null
      );

      if (resultadosComErro.length > 0) {
        setErro(
          "Alguns indicadores não puderam ser atualizados. As demais áreas continuam funcionando normalmente."
        );
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setErro("Não foi possível atualizar todos os dados do painel.");
    } finally {
      setCarregando(false);
    }
  }

  const primeiroNome = useMemo(() => {
    const nome = perfil?.nome?.trim();
    if (!nome) return "";
    return nome.split(/\s+/)[0];
  }, [perfil]);

  const saudacao = useMemo(() => {
    const hora = new Date().getHours();

    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const hojeFormatado = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const proximoEventoFormatado = useMemo(() => {
    if (!proximoEvento) return null;

    const [ano, mes, dia] = proximoEvento.data_evento
      .split("-")
      .map(Number);

    const data = new Date(ano, mes - 1, dia);

    return {
      dia: String(dia).padStart(2, "0"),
      mes: data
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "")
        .toUpperCase(),
      completa: data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    };
  }, [proximoEvento]);

  const pendencias = [
    {
      quantidade: resumo.sugestoesNaoLidas,
      titulo: "Sugestões não lidas",
      descricao: "Mensagens recebidas que ainda precisam ser abertas.",
      href: "/area-interna/painel/sugestoes",
      tipo: "turquesa",
    },
    {
      quantidade: resumo.publicacoesRascunho,
      titulo: "Publicações em rascunho",
      descricao: "Conteúdos do LASPOERJ em Ação ainda não publicados.",
      href: "/area-interna/painel/jornal",
      tipo: "azul",
    },
    {
      quantidade: resumo.eventosRascunho,
      titulo: "Eventos não publicados",
      descricao: "Eventos cadastrados que ainda não estão visíveis no site.",
      href: "/area-interna/painel/eventos",
      tipo: "marinho",
    },
    {
      quantidade: resumo.avisosExpirando,
      titulo: "Avisos próximos do vencimento",
      descricao: "Avisos com expiração prevista para os próximos 7 dias.",
      href: "/area-interna/painel/avisos",
      tipo: "areia",
    },
  ];

  return (
    <div className="adminDashboard">
      <header className="adminDashboardTopo">
        <div>
          <p className="adminEyebrow">PAINEL ADMINISTRATIVO</p>

          <h1>
            {saudacao}
            {primeiroNome ? `, ${primeiroNome}` : ""}.
          </h1>

          <p className="adminDashboardDescricao">
            Acompanhe o que está acontecendo na LASPOERJ e acesse
            rapidamente as áreas de gestão.
          </p>

          <p className="adminDataAtual">{hojeFormatado}</p>
        </div>

        <div className="adminTopoAcoes">
          <button
            type="button"
            className="adminBotaoSecundario"
            onClick={carregarDashboard}
            disabled={carregando}
          >
            {carregando ? "Atualizando..." : "Atualizar dados"}
          </button>

          <Link href="/" target="_blank" className="adminBotaoPrimario">
            Ver site público ↗
          </Link>
        </div>
      </header>

      {erro && <div className="adminAvisoSistema">{erro}</div>}

      <section className="adminMetricas" aria-label="Resumo da LASPOERJ">
        <Link href="/area-interna/painel/eventos" className="adminMetrica">
          <span>Eventos</span>
          <strong>{carregando ? "—" : resumo.eventos}</strong>
          <small>cadastrados</small>
        </Link>

        <Link href="/area-interna/painel/jornal" className="adminMetrica">
          <span>LASPOERJ em Ação</span>
          <strong>{carregando ? "—" : resumo.publicacoes}</strong>
          <small>publicações</small>
        </Link>

        <Link href="/area-interna/painel/avisos" className="adminMetrica">
          <span>Avisos</span>
          <strong>{carregando ? "—" : resumo.avisos}</strong>
          <small>cadastrados</small>
        </Link>

        <Link href="/area-interna/painel/sugestoes" className="adminMetrica adminMetricaDestaque">
          <span>Sugestões</span>
          <strong>{carregando ? "—" : resumo.sugestoes}</strong>
          <small>
            {resumo.sugestoesNovas} nova
            {resumo.sugestoesNovas === 1 ? "" : "s"}
          </small>
        </Link>
      </section>

      <section className="adminSecao">
        <div className="adminSecaoTitulo">
          <div>
            <p>AÇÕES RÁPIDAS</p>
            <h2>O que você quer fazer?</h2>
          </div>
        </div>

        <div className="adminAcoesRapidas">
          <Link href="/area-interna/painel/eventos">
            <span>01</span>
            <strong>Novo evento</strong>
            <small>Cadastrar ou editar programação</small>
          </Link>

          <Link href="/area-interna/painel/jornal">
            <span>02</span>
            <strong>Nova publicação</strong>
            <small>Adicionar conteúdo ao LASPOERJ em Ação</small>
          </Link>

          <Link href="/area-interna/painel/avisos">
            <span>03</span>
            <strong>Novo aviso</strong>
            <small>Publicar um comunicado importante</small>
          </Link>

          <Link href="/area-interna/painel/equipe">
            <span>04</span>
            <strong>Equipe</strong>
            <small>Adicionar ou atualizar membros</small>
          </Link>
        </div>
      </section>

      <section className="adminDuasColunas">
        <article className="adminProximoEvento">
          <div className="adminCardCabecalho">
            <div>
              <p>PRÓXIMO EVENTO</p>
              <h2>Na agenda da Liga</h2>
            </div>

            <Link href="/area-interna/painel/agenda">
              Ver agenda →
            </Link>
          </div>

          {proximoEvento && proximoEventoFormatado ? (
            <div className="adminEventoConteudo">
              <div className="adminEventoDataGrande">
                <strong>{proximoEventoFormatado.dia}</strong>
                <span>{proximoEventoFormatado.mes}</span>
              </div>

              <div className="adminEventoInfo">
                <small>{proximoEventoFormatado.completa}</small>

                <h3>{proximoEvento.titulo}</h3>

                <div className="adminEventoMeta">
                  {proximoEvento.horario && (
                    <span>{proximoEvento.horario.slice(0, 5)}</span>
                  )}

                  {proximoEvento.local && (
                    <span>{proximoEvento.local}</span>
                  )}
                </div>

                <div className="adminEventoStatus">
                  <span
                    className={
                      proximoEvento.publicado
                        ? "adminStatus adminStatusPublicado"
                        : "adminStatus adminStatusRascunho"
                    }
                  >
                    {proximoEvento.publicado ? "Publicado" : "Rascunho"}
                  </span>

                  {proximoEvento.destaque && (
                    <span className="adminStatus adminStatusDestaque">
                      Destaque
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="adminEstadoVazio">
              <strong>Nenhum evento futuro cadastrado.</strong>
              <p>
                Quando um novo evento for criado, ele aparecerá aqui
                automaticamente.
              </p>

              <Link href="/area-interna/painel/eventos">
                Ir para Eventos →
              </Link>
            </div>
          )}
        </article>

        <article className="adminPendencias">
          <div className="adminCardCabecalho">
            <div>
              <p>PRECISA DE ATENÇÃO</p>
              <h2>Pendências</h2>
            </div>
          </div>

          <div className="adminPendenciasLista">
            {pendencias.map((item) => (
              <Link href={item.href} key={item.titulo}>
                <span className={`adminPendenciaNumero adminPendencia-${item.tipo}`}>
                  {carregando ? "—" : item.quantidade}
                </span>

                <div>
                  <strong>{item.titulo}</strong>
                  <small>{item.descricao}</small>
                </div>

                <b>→</b>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="adminDuasColunas adminDuasColunasInferior">
        <article className="adminResumoOrganizacao">
          <div className="adminCardCabecalho">
            <div>
              <p>ORGANIZAÇÃO</p>
              <h2>Estrutura da Liga</h2>
            </div>
          </div>

          <div className="adminEstruturaGrade">
            <Link href="/area-interna/painel/equipe">
              <span>Equipe ativa</span>
              <strong>{carregando ? "—" : resumo.equipe}</strong>
              <small>Diretoria e orientadores</small>
            </Link>

            <Link href="/area-interna/painel/usuarios">
              <span>Usuários ativos</span>
              <strong>{carregando ? "—" : resumo.usuariosAtivos}</strong>
              <small>Acessos habilitados</small>
            </Link>
          </div>
        </article>

        <article className="adminAtalhosGestao">
          <div className="adminCardCabecalho">
            <div>
              <p>GESTÃO</p>
              <h2>Atalhos úteis</h2>
            </div>
          </div>

          <div className="adminLinksGestao">
            <Link href="/area-interna/painel/sugestoes">
              Caixa de sugestões
              <span>→</span>
            </Link>

            <Link href="/area-interna/painel/usuarios">
              Gerenciar acessos
              <span>→</span>
            </Link>

            <Link href="/area-interna/painel/configuracoes">
              Informações do site
              <span>→</span>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
