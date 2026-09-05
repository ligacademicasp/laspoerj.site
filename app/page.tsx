"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  const [mostrarBotaoTopo, setMostrarBotaoTopo] = useState(false);

  const [eventosSite, setEventosSite] = useState<Evento[]>([]);
  const [avisosSite, setAvisosSite] = useState<Aviso[]>([]);
  const [publicacoesSite, setPublicacoesSite] = useState<Publicacao[]>([]);
  const [equipeSite, setEquipeSite] = useState<MembroEquipe[]>([]);
  const [configuracoesSite, setConfiguracoesSite] = useState<ConfiguracoesSite>({});

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
    async function carregarDados() {
      const [eventosResultado, avisosResultado, publicacoesResultado, equipeResultado, configuracoesResultado] = await Promise.all([
        supabase.from("eventos").select("id, titulo, descricao, data_evento, horario, local, destaque, publicado").eq("publicado", true).order("data_evento", { ascending: true }),
        supabase.from("avisos").select("id, titulo, mensagem, publico, destaque, publicado, data_expiracao").eq("publicado", true).eq("publico", "todos").order("id", { ascending: false }),
        supabase.from("publicacoes").select("id, slug, titulo, resumo, conteudo, autor, categoria, imagem_url, destaque, publicado, data_publicacao").eq("publicado", true).order("data_publicacao", { ascending: false }),
        supabase.from("equipe").select("id, nome, cargo, bio, foto_url, grupo, ordem, ativo").eq("ativo", true).order("ordem", { ascending: true }),
        supabase.from("configuracoes_site").select("chave, valor"),
      ]);

      if (eventosResultado.error) console.error("Erro ao carregar eventos:", eventosResultado.error);
      else setEventosSite(eventosResultado.data ?? []);

      if (avisosResultado.error) console.error("Erro ao carregar avisos:", avisosResultado.error);
      else {
        const hoje = new Date().toISOString().split("T")[0];
        const validos = (avisosResultado.data ?? []).filter((aviso) => !aviso.data_expiracao || aviso.data_expiracao >= hoje);
        setAvisosSite(validos);
      }

      if (publicacoesResultado.error) console.error("Erro ao carregar publicações:", publicacoesResultado.error);
      else setPublicacoesSite(publicacoesResultado.data ?? []);

      if (equipeResultado.error) console.error("Erro ao carregar equipe:", equipeResultado.error);
      else setEquipeSite((equipeResultado.data ?? []) as MembroEquipe[]);

      if (configuracoesResultado.error) console.error("Erro ao carregar configurações:", configuracoesResultado.error);
      else {
        const mapa: ConfiguracoesSite = {};
        (configuracoesResultado.data ?? []).forEach((item) => {
          mapa[item.chave] = item.valor ?? "";
        });
        setConfiguracoesSite(mapa);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    const aoRolar = () => setMostrarBotaoTopo(window.scrollY > 420);
    window.addEventListener("scroll", aoRolar);
    aoRolar();
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuAberto]);

  function config(chave: string, fallback: string) {
    const valor = configuracoesSite[chave];
    return valor && valor.trim() ? valor : fallback;
  }

  function instagramUrl() {
    const usuario = config("instagram", "@laspoerj").replace(/^@/, "").trim();
    return `https://www.instagram.com/${usuario}`;
  }

  function enderecoMapsUrl() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config("endereco", "Avenida Alfredo Balthazar da Silveira, nº 580 - Recreio dos Bandeirantes, Rio de Janeiro - RJ, 22790-710"))}`;
  }

  async function enviarSugestao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setEnviando(true);
      const { error } = await supabase.from("sugestoes").insert([{ nome, categoria: tipo, whatsapp, email, mensagem }]);
      if (error) {
        console.error("Erro ao enviar sugestão:", error);
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
      console.error("Erro ao enviar sugestão:", error);
      alert("Não foi possível enviar a sugestão.");
    } finally {
      setEnviando(false);
    }
  }

  const diretoria = useMemo(() => equipeSite.filter((membro) => membro.grupo === "diretoria"), [equipeSite]);
  const orientadores = useMemo(() => equipeSite.filter((membro) => membro.grupo === "orientador"), [equipeSite]);
  const membroDestaque = diretoria[0];
  const outrosDiretores = diretoria.slice(1);
  const avisoPrincipal = avisosSite.find((aviso) => aviso.destaque) ?? avisosSite[0];
  const outrosAvisos = avisosSite.filter((aviso) => aviso.id !== avisoPrincipal?.id).slice(0, 4);
  const publicacaoPrincipal = publicacoesSite.find((publicacao) => publicacao.destaque) ?? publicacoesSite[0];
  const publicacoesSecundarias = publicacoesSite.filter((publicacao) => publicacao.id !== publicacaoPrincipal?.id).slice(0, 3);

  const anoCalendario = mesCalendario.getFullYear();
  const numeroMesCalendario = mesCalendario.getMonth();
  const tituloCalendario = mesCalendario.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase();

  function mudarMesCalendario(direcao: number) {
    setMesCalendario((mesAtual) => new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1));
  }

  function criarDataISO(ano: number, mes: number, dia: number) {
    const data = new Date(ano, mes, dia);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
  }

  const primeiroDiaSemana = new Date(anoCalendario, numeroMesCalendario, 1).getDay();
  const quantidadeDiasMes = new Date(anoCalendario, numeroMesCalendario + 1, 0).getDate();
  const quantidadeDiasMesAnterior = new Date(anoCalendario, numeroMesCalendario, 0).getDate();

  const diasCalendario = Array.from({ length: 42 }, (_, indice) => {
    let dia: number;
    let mesRelativo = 0;
    let muted = false;

    if (indice < primeiroDiaSemana) {
      dia = quantidadeDiasMesAnterior - primeiroDiaSemana + indice + 1;
      mesRelativo = -1;
      muted = true;
    } else if (indice >= primeiroDiaSemana + quantidadeDiasMes) {
      dia = indice - primeiroDiaSemana - quantidadeDiasMes + 1;
      mesRelativo = 1;
      muted = true;
    } else {
      dia = indice - primeiroDiaSemana + 1;
    }

    return { dia, muted, dataISO: criarDataISO(anoCalendario, numeroMesCalendario + mesRelativo, dia) };
  });

  const datasComEventos = new Set(eventosSite.map((evento) => evento.data_evento));
  const eventosDoMes = eventosSite.filter((evento) => {
    const [ano, mes] = evento.data_evento.split("-").map(Number);
    return ano === anoCalendario && mes === numeroMesCalendario + 1;
  });

  function formatarDataEvento(dataEvento: string) {
    const data = new Date(`${dataEvento}T00:00:00`);
    return {
      dia: String(data.getDate()).padStart(2, "0"),
      mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
      completa: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    };
  }

  function formatarDataPublicacao(data?: string | null) {
    if (!data) return "";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <main id="topo" className="novaSite">
      <header className="novaHeader">
        <a href="#topo" className="novaMarca" onClick={() => setMenuAberto(false)}>
          <Image src="/logo.png" alt="LASPOERJ" width={78} height={78} priority />
          <div>
            <strong>LASPOERJ</strong>
            <span>SAÚDE PÚBLICA ODONTOLÓGICA</span>
          </div>
        </a>

        <nav className={menuAberto ? "novaMenu novaMenuAberto" : "novaMenu"}>
          <a href="#sobre" onClick={() => setMenuAberto(false)}>Sobre</a>
          <a href="#diretoria" onClick={() => setMenuAberto(false)}>Diretoria</a>
          <a href="#eventos" onClick={() => setMenuAberto(false)}>Eventos</a>
          <a href="#agenda" onClick={() => setMenuAberto(false)}>Agenda</a>
          <a href="#jornal" onClick={() => setMenuAberto(false)}>Jornal</a>
          <a href="#contato" onClick={() => setMenuAberto(false)}>Contato</a>
          <a href="/login" className="novaAreaInterna" onClick={() => setMenuAberto(false)}>Área interna</a>
        </nav>

        <button type="button" className={menuAberto ? "novaMenuBotao novaMenuBotaoAtivo" : "novaMenuBotao"} aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} onClick={() => setMenuAberto((aberto) => !aberto)}>
          <span /><span /><span />
        </button>
      </header>

      {menuAberto && <button type="button" aria-label="Fechar menu" className="novaMenuFundo" onClick={() => setMenuAberto(false)} />}

      <section className="novaHero">
        <div className="novaHeroTexto">
          <div className="novaEtiqueta">LIGA ACADÊMICA • ESTÁCIO RJ</div>
          <h1>Saúde pública<span> odontológica</span> que começa na formação e alcança o território.</h1>
          <p>Ensino, pesquisa e extensão conectados para fortalecer a saúde bucal coletiva, o SUS e o compromisso social da Odontologia.</p>
          <div className="novaHeroAcoes">
            <a href="#sobre" className="novaBotaoPrimario">Conheça a LASPOERJ</a>
            <a href="#agenda" className="novaBotaoTexto">Ver agenda <span>↗</span></a>
          </div>
        </div>

        <div className="novaHeroPainel">
          <div className="novaHeroMarcaGrande"><Image src="/logo.png" alt="" width={230} height={230} aria-hidden="true" /></div>
          <div className="novaHeroPainelTopo"><span>LASPOERJ</span><small>ESTÁCIO • RJ</small></div>
          <div className="novaHeroPainelCentro"><p>Uma liga construída para aproximar universidade, território e comunidade.</p></div>
          <div className="novaHeroPainelRodape">
            <div><strong>{config("numero_ligantes", "+20")}</strong><span>Ligantes</span></div>
            <div><strong>{String(diretoria.length || 5).padStart(2, "0")}</strong><span>Diretoria</span></div>
            <div><strong>{String(orientadores.length || 2).padStart(2, "0")}</strong><span>Orientadores</span></div>
          </div>
        </div>
      </section>

      <section id="sobre" className="novaSobre">
        <div className="novaSecaoCabecalho novaSecaoCabecalhoLargo">
          <span className="novaNumeroSecao">01</span>
          <div><p className="novaKicker">QUEM SOMOS</p><h2>Uma liga que enxerga a Odontologia para além do consultório.</h2></div>
        </div>

        <div className="novaSobreGrade">
          <article className="novaSobreTextoPrincipal"><p>{config("sobre_texto_1", "A LASPOERJ — Liga Acadêmica de Saúde Pública Odontológica da Estácio RJ — nasce com o compromisso de aproximar a formação acadêmica da realidade social da população.")}</p></article>
          <div className="novaSobrePilares">
            <article><span>01</span><h3>Formação</h3><p>{config("sobre_texto_2", "Fortalecemos o olhar crítico, científico e humano dos estudantes de Odontologia, valorizando os princípios do SUS e a integralidade do cuidado.")}</p></article>
            <article><span>02</span><h3>Território</h3><p>{config("sobre_texto_3", "Por meio de ações de ensino, pesquisa e extensão, buscamos uma odontologia mais acessível, preventiva e comprometida com a transformação social.")}</p></article>
            <article><span>03</span><h3>Compromisso</h3><p>{config("compromisso_texto", "Formar estudantes conscientes do papel social da Odontologia e preparados para atuar junto à comunidade.")}</p></article>
          </div>
        </div>
      </section>

      <section className="novaIndicadores" aria-label="Números da LASPOERJ">
        <div><strong>{config("numero_ligantes", "+20")}</strong><span>Ligantes</span></div>
        <div><strong>{String(diretoria.length || 5).padStart(2, "0")}</strong><span>Membros da diretoria</span></div>
        <div><strong>{String(orientadores.length || 2).padStart(2, "0")}</strong><span>Professores orientadores</span></div>
        <div><strong>2026</strong><span>Ano de fundação</span></div>
      </section>

      <section id="diretoria" className="novaDiretoria">
        <div className="novaSecaoCabecalho"><span className="novaNumeroSecao">02</span><div><p className="novaKicker">QUEM FAZ ACONTECER</p><h2>Diretoria LASPOERJ</h2></div></div>
        {diretoria.length === 0 ? <div className="novaEstadoVazio">A diretoria será exibida aqui assim que os membros estiverem cadastrados no painel.</div> : (
          <div className="novaDiretoriaMosaico">
            {membroDestaque && (
              <article className="novaDiretorDestaque">
                <div className="novaDiretorFoto"><img src={membroDestaque.foto_url || "/logo.png"} alt={membroDestaque.nome} /></div>
                <div className="novaDiretorDestaqueTexto"><span>{membroDestaque.cargo}</span><h3>{membroDestaque.nome}</h3><p>{membroDestaque.bio || "Membro da diretoria da LASPOERJ."}</p></div>
              </article>
            )}
            <div className="novaDiretoresMenores">
              {outrosDiretores.map((membro) => (
                <article className="novaDiretorCard" key={membro.id}>
                  <div className="novaDiretorCardFoto"><img src={membro.foto_url || "/logo.png"} alt={membro.nome} /></div>
                  <div><span>{membro.cargo}</span><h3>{membro.nome}</h3>{membro.bio && <p>{membro.bio}</p>}</div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="novaOrientadores">
        <div className="novaOrientadoresCabecalho"><span>03</span><div><p>ORIENTAÇÃO ACADÊMICA</p><h2>Professores Orientadores</h2><small>Ciência, experiência e compromisso social guiando a formação da Liga.</small></div></div>
        <div className="novaOrientadoresLista">
          {orientadores.length === 0 ? <div className="novaEstadoVazio novaEstadoVazioEscuro">Os professores orientadores aparecerão aqui quando forem cadastrados no painel.</div> : orientadores.map((orientador, indice) => (
            <article className="novaOrientadorLinha" key={orientador.id}>
              <div className="novaOrientadorNumero">{String(indice + 1).padStart(2, "0")}</div>
              <div className="novaOrientadorFoto"><img src={orientador.foto_url || "/logo.png"} alt={orientador.nome} /></div>
              <div className="novaOrientadorTexto"><span>{orientador.cargo}</span><h3>{orientador.nome}</h3><p>{orientador.bio || "Professor orientador da LASPOERJ."}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="eventos" className="novaEventos">
        <div className="novaSecaoCabecalho"><span className="novaNumeroSecao">04</span><div><p className="novaKicker">PROGRAMAÇÃO</p><h2>Próximos eventos</h2></div></div>
        {eventosSite.length === 0 ? <div className="novaEstadoVazio">Nenhum evento programado no momento.</div> : (
          <div className="novaLinhaDoTempo">
            {eventosSite.slice(0, 6).map((evento, indice) => {
              const data = formatarDataEvento(evento.data_evento);
              return (
                <article className={evento.destaque ? "novaEventoLinha novaEventoLinhaDestaque" : "novaEventoLinha"} key={evento.id}>
                  <div className="novaEventoIndice">{String(indice + 1).padStart(2, "0")}</div>
                  <div className="novaEventoData"><strong>{data.dia}</strong><span>{data.mes}</span></div>
                  <div className="novaEventoConteudo">
                    <div className="novaEventoTopo"><span>{data.completa}</span>{evento.destaque && <small>EM DESTAQUE</small>}</div>
                    <h3>{evento.titulo}</h3>
                    <p>{evento.descricao || "Mais informações em breve."}</p>
                    {(evento.horario || evento.local) && <div className="novaEventoDetalhes">{evento.horario && <span>{evento.horario.slice(0, 5)}</span>}{evento.local && <span>{evento.local}</span>}</div>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="agenda" className="novaAgenda">
        <div className="novaSecaoCabecalho novaSecaoCabecalhoLargo"><span className="novaNumeroSecao">05</span><div><p className="novaKicker">ORGANIZE-SE COM A LIGA</p><h2>Agenda LASPOERJ</h2></div></div>
        <div className="novaAgendaGrade">
          <div className="novaCalendario">
            <div className="novaCalendarioTopo"><button type="button" onClick={() => mudarMesCalendario(-1)} aria-label="Mês anterior">←</button><h3>{tituloCalendario}</h3><button type="button" onClick={() => mudarMesCalendario(1)} aria-label="Próximo mês">→</button></div>
            <div className="novaCalendarioSemana"><span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span></div>
            <div className="novaCalendarioDias">
              {diasCalendario.map((item, indice) => {
                const temEvento = datasComEventos.has(item.dataISO);
                return <span key={`${item.dataISO}-${indice}`} className={[item.muted ? "novaDiaMuted" : "", temEvento && !item.muted ? "novaDiaEvento" : ""].filter(Boolean).join(" ")}>{item.dia}</span>;
              })}
            </div>
          </div>

          <div className="novaAgendaLista">
            <div className="novaAgendaListaTopo"><span>EVENTOS DO MÊS</span><strong>{String(eventosDoMes.length).padStart(2, "0")}</strong></div>
            {eventosDoMes.length === 0 ? <div className="novaAgendaSemEvento"><strong>Nenhum evento neste mês.</strong><p>As próximas atividades aparecerão aqui automaticamente.</p></div> : eventosDoMes.map((evento) => {
              const data = formatarDataEvento(evento.data_evento);
              return <article className="novaAgendaItem" key={evento.id}><div><strong>{data.dia}</strong><span>{data.mes}</span></div><div><h4>{evento.titulo}</h4><p>{evento.horario && evento.horario.slice(0, 5)}{evento.horario && evento.local && " • "}{evento.local}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <section id="avisos" className="novaAvisos">
        <div className="novaSecaoCabecalho"><span className="novaNumeroSecao">06</span><div><p className="novaKicker">MURAL DA LIGA</p><h2>Avisos e comunicados</h2></div></div>
        {avisosSite.length === 0 ? <div className="novaEstadoVazio">Nenhum aviso publicado no momento.</div> : (
          <div className="novaAvisosGrade">
            {avisoPrincipal && <article className="novaAvisoPrincipal"><div className="novaAvisoPrincipalTopo"><span>{avisoPrincipal.destaque ? "IMPORTANTE" : "COMUNICADO"}</span>{avisoPrincipal.data_expiracao && <small>Válido até {new Date(`${avisoPrincipal.data_expiracao}T00:00:00`).toLocaleDateString("pt-BR")}</small>}</div><h3>{avisoPrincipal.titulo}</h3><p>{avisoPrincipal.mensagem}</p></article>}
            <div className="novaAvisosMenores">{outrosAvisos.map((aviso, indice) => <article key={aviso.id}><span>{String(indice + 1).padStart(2, "0")}</span><div><small>{aviso.destaque ? "IMPORTANTE" : "COMUNICADO"}</small><h3>{aviso.titulo}</h3><p>{aviso.mensagem}</p></div></article>)}</div>
          </div>
        )}
      </section>

      <section id="jornal" className="novaJornal">
        <div className="novaJornalTopo"><div><p className="novaKicker">EDITORIAL LASPOERJ</p><h2>Jornal LASPOERJ</h2></div><a href="/jornal">Todas as publicações <span>↗</span></a></div>
        {publicacoesSite.length === 0 ? <div className="novaEstadoVazio">Nenhuma publicação disponível no momento.</div> : (
          <div className="novaJornalGrade">
            {publicacaoPrincipal && (
              <article className="novaMateriaPrincipal">
                <a href={`/jornal/${publicacaoPrincipal.slug}`} className="novaMateriaImagem">{publicacaoPrincipal.imagem_url ? <img src={publicacaoPrincipal.imagem_url} alt={publicacaoPrincipal.titulo} /> : <div className="novaMateriaSemImagem">LASPOERJ</div>}</a>
                <div className="novaMateriaTexto"><div className="novaMateriaMeta"><span>{publicacaoPrincipal.categoria || "Jornal LASPOERJ"}</span><small>{formatarDataPublicacao(publicacaoPrincipal.data_publicacao)}</small></div><h3>{publicacaoPrincipal.titulo}</h3><p>{publicacaoPrincipal.resumo || publicacaoPrincipal.conteudo?.slice(0, 220) || "Leia esta publicação do Jornal LASPOERJ."}</p><a href={`/jornal/${publicacaoPrincipal.slug}`}>Ler matéria completa →</a></div>
              </article>
            )}
            <div className="novaMateriasLaterais">{publicacoesSecundarias.map((publicacao) => <article key={publicacao.id}><div className="novaMateriaLateralImagem">{publicacao.imagem_url ? <img src={publicacao.imagem_url} alt={publicacao.titulo} /> : <div>LASPOERJ</div>}</div><div className="novaMateriaLateralTexto"><div><span>{publicacao.categoria || "Jornal"}</span><small>{formatarDataPublicacao(publicacao.data_publicacao)}</small></div><h3>{publicacao.titulo}</h3><a href={`/jornal/${publicacao.slug}`}>Ler publicação →</a></div></article>)}</div>
          </div>
        )}
      </section>

      <section id="contato" className="novaFinal">
        <div className="novaContato">
          <p className="novaKicker">CANAIS DA LIGA</p><h2>Fale com a LASPOERJ</h2><p className="novaContatoIntroducao">Estudantes, professores, comunidade e parceiros: nossa comunicação está aberta.</p>
          <div className="novaContatoLinks">
            <a href={instagramUrl()} target="_blank" rel="noopener noreferrer"><span>Instagram</span><strong>{config("instagram", "@laspoerj")}</strong><b>↗</b></a>
            <a href={`mailto:${config("email_contato", "ligacademicasp@gmail.com")}`}><span>E-mail</span><strong>{config("email_contato", "ligacademicasp@gmail.com")}</strong><b>↗</b></a>
            <a href={enderecoMapsUrl()} target="_blank" rel="noopener noreferrer"><span>Localização</span><strong>{config("endereco", "Estácio • Recreio dos Bandeirantes • RJ")}</strong><b>↗</b></a>
          </div>
        </div>

        <div id="sugestoes" className="novaSugestoes">
          <div className="novaSugestoesTopo"><p className="novaKicker">SUA VOZ NA LIGA</p><h2>Caixa de sugestões</h2><p>Envie ideias, propostas, dúvidas ou temas para futuras ações.</p></div>
          <form onSubmit={enviarSugestao}>
            <div className="novaFormularioLinha"><label>Nome *<input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></label><label>Você é... *<select value={tipo} onChange={(e) => setTipo(e.target.value)} required><option value="Aluno">Aluno</option><option value="Professor">Professor</option><option value="Ligante LASPOERJ">Ligante LASPOERJ</option><option value="Patrocinador">Patrocinador</option></select></label></div>
            <div className="novaFormularioLinha"><label>WhatsApp<input type="text" placeholder="(21) 99999-0000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></label><label>E-mail *<input type="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label></div>
            <label>Mensagem *<textarea placeholder="Conte sua ideia para nós..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} required /></label>
            <button type="submit" disabled={enviando}>{enviando ? "ENVIANDO..." : "ENVIAR PARA A LASPOERJ →"}</button>
            <small>Suas informações serão usadas apenas para contato da Liga.</small>
          </form>
        </div>
      </section>

      <footer className="novaFooter">
        <div className="novaFooterMarca"><Image src="/logo-footer.png" alt="LASPOERJ" width={78} height={78} /><div><strong>LASPOERJ</strong><span>Liga Acadêmica de Saúde Pública Odontológica • Estácio RJ</span></div></div>
        <nav><a href="#sobre">Sobre</a><a href="#diretoria">Diretoria</a><a href="#eventos">Eventos</a><a href="#agenda">Agenda</a><a href="#jornal">Jornal</a><a href="#contato">Contato</a></nav>
        <div className="novaFooterFinal"><span>© 2026 LASPOERJ</span><span>Saúde pública • Odontologia • Coletividade</span></div>
      </footer>

      {mostrarBotaoTopo && <button type="button" className="novaVoltarTopo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo">↑</button>}
    </main>
  );
}