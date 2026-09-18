"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";

type MembroEquipe = {
  id: number;
  nome: string;
  cargo: string;
  bio: string | null;
  foto_url: string | null;
  grupo: "diretoria" | "orientador";
  ordem: number;
  ativo: boolean;
};

type Evento = {
  id: number;
  titulo: string;
  descricao: string | null;
  data_evento: string;
  horario: string | null;
  local: string | null;
  destaque: boolean;
  publicado: boolean;
};

type Aviso = {
  id: number;
  titulo: string;
  mensagem: string;
  publico: string;
  destaque: boolean;
  publicado: boolean;
  data_expiracao: string | null;
};

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

type ConfiguracoesSite = Record<string, string>;

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [mostrarTopo, setMostrarTopo] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState("topo");

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSite>({});

  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Aluno");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const [eventosR, avisosR, publicacoesR, equipeR, configuracoesR] =
        await Promise.all([
          supabase
            .from("eventos")
            .select(
              "id, titulo, descricao, data_evento, horario, local, destaque, publicado"
            )
            .eq("publicado", true)
            .order("data_evento", { ascending: true }),
          supabase
            .from("avisos")
            .select(
              "id, titulo, mensagem, publico, destaque, publicado, data_expiracao"
            )
            .eq("publicado", true)
            .eq("publico", "todos")
            .order("id", { ascending: false }),
          supabase
            .from("publicacoes")
            .select(
              "id, slug, titulo, resumo, conteudo, autor, categoria, imagem_url, destaque, publicado, data_publicacao"
            )
            .eq("publicado", true)
            .order("data_publicacao", { ascending: false }),
          supabase
            .from("equipe")
            .select("id, nome, cargo, bio, foto_url, grupo, ordem, ativo")
            .eq("ativo", true)
            .order("ordem", { ascending: true }),
          supabase.from("configuracoes_site").select("chave, valor"),
        ]);

      if (!eventosR.error) setEventos(eventosR.data ?? []);
      else console.error("Erro ao carregar eventos:", eventosR.error);

      if (!avisosR.error) {
        const hoje = new Date().toISOString().split("T")[0];
        setAvisos(
          (avisosR.data ?? []).filter(
            (aviso) => !aviso.data_expiracao || aviso.data_expiracao >= hoje
          )
        );
      } else {
        console.error("Erro ao carregar avisos:", avisosR.error);
      }

      if (!publicacoesR.error) setPublicacoes(publicacoesR.data ?? []);
      else console.error("Erro ao carregar publicações:", publicacoesR.error);

      if (!equipeR.error) setEquipe((equipeR.data ?? []) as MembroEquipe[]);
      else console.error("Erro ao carregar equipe:", equipeR.error);

      if (!configuracoesR.error) {
        const mapa: ConfiguracoesSite = {};
        (configuracoesR.data ?? []).forEach((item) => {
          mapa[item.chave] = item.valor ?? "";
        });
        setConfiguracoes(mapa);
      }
    }

    carregar();
  }, []);

  useEffect(() => {
    const aoRolar = () => setMostrarTopo(window.scrollY > 450);
    window.addEventListener("scroll", aoRolar);
    aoRolar();
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");

    const elementos = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (!("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("revelado"));
      return () => document.documentElement.classList.remove("reveal-ready");
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("revelado");
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elementos.forEach((elemento) => observer.observe(elemento));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("reveal-ready");
    };
  }, [eventos, avisos, publicacoes, equipe]);

  useEffect(() => {
    const ids = ["topo", "sobre", "projetos", "eventos", "agenda", "jornal", "contato"];
    const secoes = ids
      .map((id) => document.getElementById(id))
      .filter((secao): secao is HTMLElement => Boolean(secao));

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visiveis[0]?.target.id) {
          setSecaoAtiva(visiveis[0].target.id);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.05, 0.2, 0.45] }
    );

    secoes.forEach((secao) => observer.observe(secao));
    return () => observer.disconnect();
  }, []);

  function config(chave: string, fallback: string) {
    const valor = configuracoes[chave];
    return valor && valor.trim() ? valor : fallback;
  }

  function instagramUrl() {
    return `https://www.instagram.com/${config("instagram", "@laspoerj")
      .replace(/^@/, "")
      .trim()}`;
  }

  function enderecoMapsUrl() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      config(
        "endereco",
        "Avenida Alfredo Balthazar da Silveira, nº 580 - Recreio dos Bandeirantes, Rio de Janeiro - RJ, 22790-710"
      )
    )}`;
  }

  async function enviarSugestao(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setEnviando(true);
      const { error } = await supabase.from("sugestoes").insert([
        { nome, categoria: tipo, whatsapp, email, mensagem },
      ]);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Sugestão enviada com sucesso!");
      setNome("");
      setTipo("Aluno");
      setWhatsapp("");
      setEmail("");
      setMensagem("");
    } catch (error) {
      console.error(error);
      alert("Não foi possível enviar a sugestão.");
    } finally {
      setEnviando(false);
    }
  }

  const diretoria = useMemo(
    () => equipe.filter((membro) => membro.grupo === "diretoria"),
    [equipe]
  );

  const orientadores = useMemo(
    () => equipe.filter((membro) => membro.grupo === "orientador"),
    [equipe]
  );

  const publicacaoPrincipal =
    publicacoes.find((publicacao) => publicacao.destaque) ?? publicacoes[0];

  const publicacoesLaterais = publicacoes
    .filter((publicacao) => publicacao.id !== publicacaoPrincipal?.id)
    .slice(0, 2);

  const avisoPrincipal = avisos.find((aviso) => aviso.destaque) ?? avisos[0];
  const avisosMenores = avisos
    .filter((aviso) => aviso.id !== avisoPrincipal?.id)
    .slice(0, 3);


  const hojeISO = new Date().toISOString().split("T")[0];
  const proximoEvento =
    eventos.find((evento) => evento.data_evento >= hojeISO);

  const projetosAcoes = publicacoes
    .filter((publicacao) =>
      /a[cç][aã]o|projeto|extens[aã]o|comunidade|campanha/i.test(
        `${publicacao.categoria ?? ""} ${publicacao.titulo}`
      )
    )
    .slice(0, 3);

  const projetosExibidos =
    projetosAcoes.length >= 3 ? projetosAcoes : publicacoes.slice(0, 3);

  const galeriaFotos = publicacoes
    .filter((publicacao) => Boolean(publicacao.imagem_url))
    .slice(0, 6);

  const ano = mesCalendario.getFullYear();
  const mes = mesCalendario.getMonth();

  const tituloCalendario = mesCalendario
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .toUpperCase();

  function mudarMes(direcao: number) {
    setMesCalendario(
      (atual) => new Date(atual.getFullYear(), atual.getMonth() + direcao, 1)
    );
  }

  function criarISO(anoValor: number, mesValor: number, diaValor: number) {
    const data = new Date(anoValor, mesValor, diaValor);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(data.getDate()).padStart(2, "0")}`;
  }

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(ano, mes, 0).getDate();

  const diasCalendario = Array.from({ length: 42 }, (_, indice) => {
    let dia: number;
    let deslocamento = 0;
    let muted = false;

    if (indice < primeiroDia) {
      dia = diasMesAnterior - primeiroDia + indice + 1;
      deslocamento = -1;
      muted = true;
    } else if (indice >= primeiroDia + diasNoMes) {
      dia = indice - primeiroDia - diasNoMes + 1;
      deslocamento = 1;
      muted = true;
    } else {
      dia = indice - primeiroDia + 1;
    }

    return {
      dia,
      muted,
      dataISO: criarISO(ano, mes + deslocamento, dia),
    };
  });

  const datasComEventos = new Set(eventos.map((evento) => evento.data_evento));

  const eventosDoMes = eventos.filter((evento) => {
    const [anoEvento, mesEvento] = evento.data_evento.split("-").map(Number);
    return anoEvento === ano && mesEvento === mes + 1;
  });

  function dataEvento(data: string) {
    const d = new Date(`${data}T00:00:00`);
    return {
      dia: String(d.getDate()).padStart(2, "0"),
      mes: d
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "")
        .toUpperCase(),
    };
  }

  function dataPublicacao(data: string | null) {
    if (!data) return "";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  return (
    <main id="topo" className="laspoV2">
      <header className="v2Header">
        <a href="#topo" className="v2Marca" onClick={() => setMenuAberto(false)}>
          <Image src="/logo.png" alt="LASPOERJ" width={62} height={62} priority />
          <div>
            <strong>LASPOERJ</strong>
            <span>LIGA ACADÊMICA • ESTÁCIO RJ</span>
          </div>
        </a>

        <nav className={menuAberto ? "v2Menu v2MenuAberto" : "v2Menu"}>
          <a className={secaoAtiva === "topo" ? "ativo" : ""} href="#topo" onClick={() => setMenuAberto(false)}>Início</a>
          <a className={secaoAtiva === "sobre" ? "ativo" : ""} href="#sobre" onClick={() => setMenuAberto(false)}>Sobre</a>
          <a href="/institucional" onClick={() => setMenuAberto(false)}>Institucional</a>
          <a className={secaoAtiva === "projetos" ? "ativo" : ""} href="#projetos" onClick={() => setMenuAberto(false)}>Projetos</a>
          <a className={secaoAtiva === "eventos" ? "ativo" : ""} href="#eventos" onClick={() => setMenuAberto(false)}>Eventos</a>
          <a className={secaoAtiva === "agenda" ? "ativo" : ""} href="#agenda" onClick={() => setMenuAberto(false)}>Agenda</a>
          <a className={secaoAtiva === "jornal" ? "ativo" : ""} href="#jornal" onClick={() => setMenuAberto(false)}>LASPOERJ em Ação</a>
          <a className={secaoAtiva === "contato" ? "ativo" : ""} href="#contato" onClick={() => setMenuAberto(false)}>Contato</a>
          <ThemeToggle />
          <a href="/login" className="v2AreaInterna" onClick={() => setMenuAberto(false)}>Área interna</a>
        </nav>

        <button
          type="button"
          className={menuAberto ? "v2MenuBotao v2MenuBotaoAtivo" : "v2MenuBotao"}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((valor) => !valor)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuAberto && (
        <button className="v2MenuOverlay" aria-label="Fechar menu" onClick={() => setMenuAberto(false)} />
      )}

      <section className="v2Hero" data-reveal>
        <div className="v2HeroTexto">
          <p>SAÚDE COLETIVA TRANSFORMA REALIDADES</p>
          <h1>
            SAÚDE PÚBLICA.<br />
            ODONTOLOGIA.<br />
            <span>COLETIVIDADE.</span>
          </h1>
          <div className="v2HeroDescricao">
            Formação, pesquisa e ações que aproximam a odontologia da comunidade.
          </div>
          <div className="v2HeroAcoes">
            <a href="#sobre" className="v2BtnPrimario">Conheça a LASPOERJ →</a>
            <a href="#eventos" className="v2BtnSecundario">▣ &nbsp; Ver próximos eventos</a>
          </div>
        </div>

        <div className="v2HeroArte" aria-hidden="true">
          <div className="v2Arco v2Arco1" />
          <div className="v2Arco v2Arco2" />
          <div className="v2Bolha" />
          <div className="v2FrasePrincipal">Conhecimento<br />que conecta<br />pessoas e<br />transforma<br />realidades.</div>
          <div className="v2Palavras">SAÚDE<br />EDUCAÇÃO<br />COMUNIDADE<br />IMPACTO</div>
          <div className="v2FraseLateral">Mais que<br />odontologia,<br />pessoas.</div>
        </div>
      </section>

      <section className="v2Numeros" aria-label="Números da LASPOERJ" data-reveal>
        <div><div><strong>+10</strong><small>Ligantes</small></div></div>
        <div><div><strong>{String(diretoria.length || 5).padStart(2, "0")}</strong><small>Membros da diretoria</small></div></div>
        <div><div><strong>{String(orientadores.length || 2).padStart(2, "0")}</strong><small>Professores orientadores</small></div></div>
        <div><div><strong>2026</strong><small>Ano de fundação</small></div></div>
      </section>

      <section id="sobre" className="v2Sobre" data-reveal>
        <div className="v2SobreIntroducao">
          <h2>Sobre a<br />LASPOERJ</h2>
          <p>
            {config(
              "sobre_texto_1",
              "Somos uma liga acadêmica da Estácio RJ que atua na promoção da saúde pública odontológica, integrando ensino, pesquisa e extensão para transformar realidades."
            )}
          </p>
          <a href="/institucional">Saiba mais sobre nós →</a>
        </div>

        <div className="v2Pilares">
          <article><div className="v2PilarIcone">▤</div><h3>ENSINO</h3><p>Formação complementar e encontros acadêmicos.</p></article>
          <article><div className="v2PilarIcone">⌕</div><h3>PESQUISA</h3><p>Produção científica e desenvolvimento acadêmico.</p></article>
          <article><div className="v2PilarIcone">♙</div><h3>EXTENSÃO</h3><p>Ações junto à comunidade e promoção da saúde.</p></article>
        </div>

        <blockquote>“Saúde bucal também é saúde coletiva.”</blockquote>
      </section>

      <section id="diretoria" className="v2Diretoria" data-reveal>
        <div className="v2TituloLinha">
          <div><h2>Nossa Diretoria</h2><span /></div>
          <a href="#orientadores">Conheça toda a equipe →</a>
        </div>

        {diretoria.length === 0 ? (
          <div className="v2Vazio">A diretoria aparecerá aqui assim que os membros forem cadastrados.</div>
        ) : (
          <div className="v2DiretoriaGrade">
            {diretoria.map((membro) => (
              <article className="v2Diretor v2DiretorDestaque" key={membro.id}>
                <div className="v2DiretorFoto"><img src={membro.foto_url || "/logo.png"} alt={membro.nome} /></div>
                <div className="v2DiretorTexto">
                  <h3>{membro.nome}</h3>
                  <span>{membro.cargo}</span>
                  <p>{membro.bio || "Compromisso, organização e trabalho coletivo."}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="orientadores" className="v2Orientadores" data-reveal>
        <div className="v2TituloLinha v2TituloLinhaEscura">
          <div><h2>Professores Orientadores</h2><span /></div>
          <span className="v2LinkClaro">Orientação que inspira novos caminhos.</span>
        </div>

        <div className="v2OrientadoresGrade">
          {orientadores.length === 0 ? (
            <div className="v2Vazio v2VazioEscuro">Os professores orientadores aparecerão aqui quando forem cadastrados.</div>
          ) : (
            orientadores.map((orientador) => (
              <article key={orientador.id}>
                <div className="v2OrientadorFoto"><img src={orientador.foto_url || "/logo.png"} alt={orientador.nome} /></div>
                <div>
                  <h3>{orientador.nome}</h3>
                  <span>{orientador.cargo}</span>
                  <p>{orientador.bio || "Professor orientador da LASPOERJ."}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section id="projetos" className="v2Projetos" data-reveal>
        <div className="v2ProjetosTopo">
          <div>
            <p>PROJETOS E AÇÕES</p>
            <h2>Da universidade para a comunidade.</h2>
          </div>
          <a href="/jornal">Ver todas as ações →</a>
        </div>

        <div className="v2ProjetosGrade">
          {projetosExibidos.length === 0 ? (
            <div className="v2Vazio">As ações e projetos da Liga aparecerão aqui conforme forem publicados.</div>
          ) : (
            projetosExibidos.map((projeto, indice) => (
              <article key={projeto.id} className={indice === 0 ? "v2ProjetoCard v2ProjetoCardPrincipal" : "v2ProjetoCard"}>
                <a href={`/jornal/${projeto.slug}`} className="v2ProjetoImagem">
                  {projeto.imagem_url ? <img src={projeto.imagem_url} alt={projeto.titulo} /> : <div>LASPOERJ</div>}
                </a>
                <div className="v2ProjetoTexto">
                  <span>{projeto.categoria || "AÇÃO LASPOERJ"}</span>
                  <h3>{projeto.titulo}</h3>
                  <p>{projeto.resumo || projeto.conteudo?.slice(0, 135) || "Conheça esta iniciativa da LASPOERJ."}</p>
                  <a href={`/jornal/${projeto.slug}`}>Conhecer ação →</a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {proximoEvento && (() => {
        const data = dataEvento(proximoEvento.data_evento);
        return (
          <section className="v2ProximoEvento" data-reveal>
            <div className="v2ProximoEventoEtiqueta">PRÓXIMO EVENTO</div>
            <div className="v2ProximoEventoData">
              <strong>{data.dia}</strong>
              <span>{data.mes}</span>
            </div>
            <div className="v2ProximoEventoConteudo">
              <h2>{proximoEvento.titulo}</h2>
              <p>{proximoEvento.descricao || "Mais informações em breve."}</p>
              <div>
                {proximoEvento.horario && <span>{proximoEvento.horario.slice(0, 5)}</span>}
                {proximoEvento.local && <span>{proximoEvento.local}</span>}
              </div>
            </div>
            <a href="#agenda">Ver na agenda →</a>
          </section>
        );
      })()}

      <section className="v2PainelInformacoes" data-reveal>
        <div id="eventos" className="v2ColunaEventos">
          <div className="v2MiniTitulo"><h2>Próximos Eventos</h2><a href="#agenda">Ver todos →</a></div>
          <div className="v2Timeline">
            {eventos.length === 0 ? (
              <div className="v2Vazio">Nenhum evento programado no momento.</div>
            ) : (
              eventos.slice(0, 3).map((evento) => {
                const data = dataEvento(evento.data_evento);
                return (
                  <article key={evento.id}>
                    <div className="v2DataEvento"><strong>{data.dia}</strong><span>{data.mes}</span></div>
                    <div className="v2LinhaEvento"><i /></div>
                    <div><h3>{evento.titulo}</h3><p>{evento.descricao || "Mais informações em breve."}</p><strong>{evento.local || "Local a definir"}</strong></div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div id="agenda" className="v2ColunaAgenda">
          <div className="v2MiniTitulo"><h2>Agenda</h2><span>Calendário da Liga</span></div>
          <div className="v2AgendaCaixa">
            <div className="v2Calendario">
              <div className="v2CalendarioTopo"><button type="button" onClick={() => mudarMes(-1)}>‹</button><h3>{tituloCalendario}</h3><button type="button" onClick={() => mudarMes(1)}>›</button></div>
              <div className="v2Semana"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
              <div className="v2Dias">
                {diasCalendario.map((item, indice) => (
                  <span key={`${item.dataISO}-${indice}`} className={`${item.muted ? "v2DiaMuted" : ""} ${datasComEventos.has(item.dataISO) && !item.muted ? "v2DiaEvento" : ""}`}>{item.dia}</span>
                ))}
              </div>
            </div>

            <div className="v2Compromissos">
              <h3>Próximos<br />compromissos</h3>
              {eventosDoMes.length === 0 ? <p>Nenhum evento neste mês.</p> : eventosDoMes.slice(0, 3).map((evento) => {
                const data = dataEvento(evento.data_evento);
                return <article key={evento.id}><strong>{data.dia}/{String(mes + 1).padStart(2, "0")}</strong><div><h4>{evento.titulo}</h4><p>{evento.local || "Local a definir"}</p></div></article>;
              })}
            </div>
          </div>
        </div>

        <div id="avisos" className="v2ColunaAvisos">
          <div className="v2MiniTitulo"><h2>Avisos</h2><span>Atualizações</span></div>
          {avisos.length === 0 ? (
            <div className="v2Vazio">Nenhum aviso publicado.</div>
          ) : (
            <>
              {avisoPrincipal && (
                <article className="v2AvisoDestaque">
                  <span>AVISO EM DESTAQUE</span>
                  <h3>{avisoPrincipal.titulo}</h3>
                  <p>{avisoPrincipal.mensagem}</p>
                </article>
              )}
              <div className="v2AvisosLista">
                {avisosMenores.map((aviso) => <article key={aviso.id}><span>●</span><div><h4>{aviso.titulo}</h4><p>{aviso.mensagem}</p></div></article>)}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="jornal" className="v2Acao" data-reveal>
        <div className="v2MiniTitulo v2AcaoTitulo">
          <h2>LASPOERJ em Ação</h2>
          <a href="/jornal">Ver todas as publicações →</a>
        </div>

        {publicacoes.length === 0 ? (
          <div className="v2Vazio">Nenhuma publicação disponível no momento.</div>
        ) : (
          <div className="v2AcaoGrade">
            {publicacaoPrincipal && (
              <article className="v2MateriaPrincipal">
                <a href={`/jornal/${publicacaoPrincipal.slug}`} className="v2MateriaImagem">
                  {publicacaoPrincipal.imagem_url ? <img src={publicacaoPrincipal.imagem_url} alt={publicacaoPrincipal.titulo} /> : <div>LASPOERJ</div>}
                </a>
                <div className="v2MateriaPrincipalTexto">
                  <span>DESTAQUE</span>
                  <h3>{publicacaoPrincipal.titulo}</h3>
                  <p>{publicacaoPrincipal.resumo || publicacaoPrincipal.conteudo?.slice(0, 170) || "Acompanhe as ações da LASPOERJ."}</p>
                  <a href={`/jornal/${publicacaoPrincipal.slug}`}>Ler mais →</a>
                </div>
              </article>
            )}

            <div className="v2MateriasMenores">
              {publicacoesLaterais.map((publicacao) => (
                <article key={publicacao.id}>
                  <div className="v2MateriaMenorImagem">{publicacao.imagem_url ? <img src={publicacao.imagem_url} alt={publicacao.titulo} /> : <div>LASPOERJ</div>}</div>
                  <div><span>{publicacao.categoria || dataPublicacao(publicacao.data_publicacao)}</span><h3>{publicacao.titulo}</h3><a href={`/jornal/${publicacao.slug}`}>Ler mais →</a></div>
                </article>
              ))}
            </div>

            <blockquote>“Informação também transforma realidades.”</blockquote>
          </div>
        )}
      </section>

      {galeriaFotos.length >= 3 && (
        <section className="v2Galeria" data-reveal>
          <div className="v2GaleriaTopo">
            <div>
              <p>REGISTROS DA LIGA</p>
              <h2>Galeria de ações</h2>
            </div>
            <a href="/jornal">Ver LASPOERJ em Ação →</a>
          </div>

          <div className="v2GaleriaGrade">
            {galeriaFotos.map((foto, indice) => (
              <a
                href={`/jornal/${foto.slug}`}
                className={indice === 0 ? "v2GaleriaItem v2GaleriaItemGrande" : "v2GaleriaItem"}
                key={foto.id}
              >
                <img src={foto.imagem_url || ""} alt={foto.titulo} />
                <div><span>{foto.categoria || "LASPOERJ"}</span><strong>{foto.titulo}</strong></div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section id="contato" className="v2ContatoSugestoes" data-reveal>
        <div className="v2Contato">
          <p>FALE CONOSCO</p>
          <h2>Conecte-se com a LASPOERJ</h2>
          <div className="v2ContatoLinks">
            <a href={instagramUrl()} target="_blank" rel="noopener noreferrer"><span>Instagram</span><strong>{config("instagram", "@laspoerj")}</strong></a>
            <a href={`mailto:${config("email_contato", "ligacademicasp@gmail.com")}`}><span>E-mail</span><strong>{config("email_contato", "ligacademicasp@gmail.com")}</strong></a>
            <a href={enderecoMapsUrl()} target="_blank" rel="noopener noreferrer"><span>Localização</span><strong>{config("endereco", "Estácio • Recreio dos Bandeirantes • RJ")}</strong></a>
          </div>
        </div>

        <div id="sugestoes" className="v2Sugestoes">
          <p>SUA VOZ NA LIGA</p>
          <h2>Caixa de sugestões</h2>
          <form onSubmit={enviarSugestao}>
            <div className="v2FormLinha"><label>Nome *<input value={nome} onChange={(e) => setNome(e.target.value)} required /></label><label>Você é... *<select value={tipo} onChange={(e) => setTipo(e.target.value)}><option>Aluno</option><option>Professor</option><option>Ligante LASPOERJ</option><option>Patrocinador</option></select></label></div>
            <div className="v2FormLinha"><label>WhatsApp<input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></label><label>E-mail *<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label></div>
            <label>Mensagem *<textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} required /></label>
            <button type="submit" disabled={enviando}>{enviando ? "ENVIANDO..." : "ENVIAR MENSAGEM →"}</button>
          </form>
        </div>
      </section>

      <footer className="v2Footer">
        <div className="v2FooterMarca"><Image src="/logo-footer.png" alt="LASPOERJ" width={62} height={62} /><div><strong>LASPOERJ</strong><span>Liga Acadêmica de Saúde Pública Odontológica • Estácio RJ</span></div></div>
        <nav><a href="#sobre">Sobre</a><a href="/institucional">Institucional</a><a href="#diretoria">Diretoria</a><a href="#projetos">Projetos</a><a href="#eventos">Eventos</a><a href="#agenda">Agenda</a><a href="/jornal">LASPOERJ em Ação</a><a href="#contato">Contato</a></nav>
        <div className="v2FooterFinal"><small>© 2026 LASPOERJ. Todos os direitos reservados.</small><span>Ensino • Pesquisa • Extensão • Saúde Coletiva</span></div>
      </footer>

      {mostrarTopo && <button type="button" className="v2VoltarTopo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo">↑</button>}
    </main>
  );
}
