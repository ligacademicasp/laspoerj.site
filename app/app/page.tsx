"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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
  // =========================
  // SUGESTÕES
  // =========================
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Aluno");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  // =========================
  // MENU
  // =========================
  const [menuAberto, setMenuAberto] = useState(false);

  // =========================
  // EVENTOS DO SUPABASE
  // =========================
  const [eventosSite, setEventosSite] = useState<Evento[]>([]);
  const [avisosSite, setAvisosSite] = useState<Aviso[]>([]);
  const [publicacoesSite, setPublicacoesSite] = useState<Publicacao[]>([]);
  const [configuracoesSite, setConfiguracoesSite] =
    useState<ConfiguracoesSite>({});
  const [equipeSite, setEquipeSite] =
    useState<MembroEquipe[]>([]);
  const [mesCalendario, setMesCalendario] = useState(() => {
  const hoje = new Date();

  return new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1
  );
});

  // =========================
  // BOTÃO VOLTAR AO TOPO
  // =========================
  const [mostrarBotaoTopo, setMostrarBotaoTopo] = useState(false);

  // =========================
  // PALAVRAS DO HERO
  // =========================
  const palavras = [
    "COLETIVIDADE.",
    "INTEGRALIDADE.",
    "TRANSFORMAÇÃO.",
  ];

  const [textoAnimado, setTextoAnimado] = useState("");
  const [indicePalavra, setIndicePalavra] = useState(0);
  const [apagando, setApagando] = useState(false);

  // =========================
  // ENVIAR SUGESTÃO
  // =========================
  const enviarSugestao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setEnviando(true);

      const { error } = await supabase.from("sugestoes").insert([
        {
          nome,
          categoria: tipo,
          whatsapp,
          email,
          mensagem,
        },
      ]);

      if (error) {
        console.error("Erro Supabase:", error);
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
      console.error("Erro Supabase:", error);
      alert("Erro ao enviar sugestão. Verifique o Supabase.");
    } finally {
      setEnviando(false);
    }
  };

  // =========================
  // ANIMAÇÃO DAS PALAVRAS
  // =========================
  useEffect(() => {
    const palavraAtual = palavras[indicePalavra];

    let tempo = apagando ? 60 : 110;

    if (!apagando && textoAnimado === palavraAtual) {
      tempo = 1200;
    }

    const timeout = setTimeout(() => {
      if (!apagando) {
        if (textoAnimado === palavraAtual) {
          setApagando(true);
        } else {
          setTextoAnimado(
            palavraAtual.substring(0, textoAnimado.length + 1)
          );
        }
      } else {
        if (textoAnimado.length === 0) {
          setApagando(false);
          setIndicePalavra(
            (indiceAtual) => (indiceAtual + 1) % palavras.length
          );
        } else {
          setTextoAnimado(
            palavraAtual.substring(0, textoAnimado.length - 1)
          );
        }
      }
    }, tempo);

    return () => clearTimeout(timeout);
  }, [textoAnimado, apagando, indicePalavra]);

  // =========================
  // CARREGAR EVENTOS DO SUPABASE
  // =========================
  useEffect(() => {
    async function carregarEventosSite() {
      const { data, error } = await supabase
        .from("eventos")
        .select(
          "id, titulo, descricao, data_evento, horario, local, destaque, publicado"
        )
        .eq("publicado", true)
        .order("data_evento", { ascending: true });

      if (error) {
        console.error("Erro ao carregar eventos:", error);
        return;
      }

      setEventosSite(data ?? []);
    }

    carregarEventosSite();
  }, []);

  // =========================
  // CARREGAR AVISOS DO SUPABASE
  // =========================
  useEffect(() => {
    async function carregarAvisosSite() {
      const hoje = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("avisos")
        .select(
          "id, titulo, mensagem, publico, destaque, publicado, data_expiracao"
        )
        .eq("publicado", true)
        .eq("publico", "todos")
        .order("id", { ascending: false });

      if (error) {
        console.error("Erro ao carregar avisos:", error);
        return;
      }

      const avisosValidos = (data ?? []).filter((aviso) => {
        if (!aviso.data_expiracao) {
          return true;
        }

        return aviso.data_expiracao >= hoje;
      });

      setAvisosSite(avisosValidos);
    }

    carregarAvisosSite();
  }, []);

  // =========================
  // CARREGAR PUBLICAÇÕES DO SUPABASE
  // =========================
  useEffect(() => {
    async function carregarPublicacoesSite() {
      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, slug, titulo, resumo, conteudo, autor, categoria, imagem_url, destaque, publicado, data_publicacao"
        )
        .eq("publicado", true)
        .order("data_publicacao", { ascending: false });

      if (error) {
        console.error("Erro ao carregar Jornal:", error);
        return;
      }

      setPublicacoesSite(data ?? []);
    }

    carregarPublicacoesSite();
  }, []);

  // =========================
  // CARREGAR EQUIPE DO SUPABASE
  // =========================
  useEffect(() => {
    async function carregarEquipeSite() {
      const { data, error } = await supabase
        .from("equipe")
        .select("id, nome, cargo, bio, foto_url, grupo, ordem, ativo")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao carregar equipe:", error);
        return;
      }

      setEquipeSite((data ?? []) as MembroEquipe[]);
    }

    carregarEquipeSite();
  }, []);

  const diretoria = equipeSite.filter(
    (membro) => membro.grupo === "diretoria"
  );

  const orientadores = equipeSite.filter(
    (membro) => membro.grupo === "orientador"
  );

  // =========================
  // CARREGAR CONFIGURAÇÕES DO SITE
  // =========================
  useEffect(() => {
    async function carregarConfiguracoesSite() {
      const { data, error } = await supabase
        .from("configuracoes_site")
        .select("chave, valor");

      if (error) {
        console.error(
          "Erro ao carregar configurações do site:",
          error
        );
        return;
      }

      const mapa: ConfiguracoesSite = {};

      (data ?? []).forEach((item) => {
        mapa[item.chave] = item.valor ?? "";
      });

      setConfiguracoesSite(mapa);
    }

    carregarConfiguracoesSite();
  }, []);

  function config(chave: string, fallback: string) {
    const valor = configuracoesSite[chave];

    return valor && valor.trim()
      ? valor
      : fallback;
  }

  function instagramUrl() {
    const usuario = config("instagram", "@laspoerj")
      .replace(/^@/, "")
      .trim();

    return `https://www.instagram.com/${usuario}`;
  }

  function enderecoMapsUrl() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      config(
        "endereco",
        "Avenida Alfredo Balthazar da Silveira, nº 580 - Recreio dos Bandeirantes, Rio de Janeiro - RJ, 22790-710"
      )
    )}`;
  }

  // =========================
  // BOTÃO VOLTAR AO TOPO
  // =========================
  useEffect(() => {
    const handleScroll = () => {
      setMostrarBotaoTopo(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // =========================
// CALENDÁRIO DINÂMICO
// =========================

const anoCalendario = mesCalendario.getFullYear();
const numeroMesCalendario = mesCalendario.getMonth();

const tituloCalendario = mesCalendario
  .toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
  .toUpperCase();

function mudarMesCalendario(direcao: number) {
  setMesCalendario((mesAtual) => {
    return new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + direcao,
      1
    );
  });
}

function criarDataISO(
  ano: number,
  mes: number,
  dia: number
) {
  const data = new Date(ano, mes, dia);

  const anoFormatado = data.getFullYear();

  const mesFormatado = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const diaFormatado = String(
    data.getDate()
  ).padStart(2, "0");

  return `${anoFormatado}-${mesFormatado}-${diaFormatado}`;
}

const primeiroDiaSemana = new Date(
  anoCalendario,
  numeroMesCalendario,
  1
).getDay();

const quantidadeDiasMes = new Date(
  anoCalendario,
  numeroMesCalendario + 1,
  0
).getDate();

const quantidadeDiasMesAnterior = new Date(
  anoCalendario,
  numeroMesCalendario,
  0
).getDate();

const diasCalendario = Array.from(
  { length: 42 },
  (_, indice) => {
    let dia: number;
    let mesRelativo = 0;
    let muted = false;

    if (indice < primeiroDiaSemana) {
      dia =
        quantidadeDiasMesAnterior -
        primeiroDiaSemana +
        indice +
        1;

      mesRelativo = -1;
      muted = true;
    } else if (
      indice >=
      primeiroDiaSemana + quantidadeDiasMes
    ) {
      dia =
        indice -
        primeiroDiaSemana -
        quantidadeDiasMes +
        1;

      mesRelativo = 1;
      muted = true;
    } else {
      dia =
        indice -
        primeiroDiaSemana +
        1;
    }

    const dataISO = criarDataISO(
      anoCalendario,
      numeroMesCalendario + mesRelativo,
      dia
    );

    return {
      dia,
      dataISO,
      muted,
    };
  }
);

const datasComEventos = new Set(
  eventosSite.map(
    (evento) => evento.data_evento
  )
);

const eventosDoMes = eventosSite.filter(
  (evento) => {
    const [ano, mes] =
      evento.data_evento
        .split("-")
        .map(Number);

    return (
      ano === anoCalendario &&
      mes === numeroMesCalendario + 1
    );
  }
);
  return (
    <main id="topo">
      <header className="header">
        <div className="logoBox">
          <Image src="/logo.png" alt="LASPOERJ" width={95} height={95} />
          <div>
            <strong>LASPOERJ</strong>
            <span>LIGA ACADÊMICA • ESTÁCIO RJ</span>
          </div>
        </div>

        <button
  className={menuAberto ? "menuMobileBtn ativo" : "menuMobileBtn"}
  onClick={() => setMenuAberto(!menuAberto)}
  aria-label="Abrir menu"
>
  <span></span>
  <span></span>
  <span></span>
</button>
{menuAberto && (
  <div
    className="menuOverlay"
    onClick={() => setMenuAberto(false)}
  />
)}

<nav className={menuAberto ? "menu menuAberto" : "menu"}>
  <a href="#sobreConteudo" onClick={() => setMenuAberto(false)}>Sobre</a>
  <a href="#diretoriaConteudo" onClick={() => setMenuAberto(false)}>Diretoria</a>
  <a href="#eventos" onClick={() => setMenuAberto(false)}>Eventos</a>
  <a href="#agendaConteudo" onClick={() => setMenuAberto(false)}>Agenda</a>
  <a href="#avisosConteudo" onClick={() => setMenuAberto(false)}>Avisos</a>
  <a href="#jornalConteudo" onClick={() => setMenuAberto(false)}>Jornal</a>
  <a href="#contatoConteudo" onClick={() => setMenuAberto(false)}>Contato</a>
  <a href="#sugestoes">Sugestões</a>
  <a
  href="/login"
  className="loginBtn"
  onClick={() => setMenuAberto(false)}
>
  Login
</a>
</nav>
      </header>

      <section className="hero">
        <p className="subtitulo">LIGA ACADÊMICA • ESTÁCIO RJ</p>

        <h1>
          SAÚDE PÚBLICA.
          <br />
          ODONTOLOGIA.
          <br />
          <span className="typewriter gradient-text">
  {textoAnimado}
</span>
        </h1>

        <p className="descricao">
          Liga Acadêmica de Saúde Pública Odontológica — unindo estudantes,
          professores e comunidade em torno da saúde bucal coletiva.
        </p>

        <div className="botoes">
          <a href="#sobre" className="btn principal">CONHEÇA A LIGA →</a>
          <a href="#eventos" className="btn secundario">PRÓXIMOS EVENTOS →</a>
        </div>
      </section>

      <section id="sobre" className="sobre">
  <div id="sobreConteudo" className="sobreTexto">
          <p className="subtitulo">CONHEÇA A LIGA</p>
          <h2>
            {config("sobre_titulo", "Sobre a LASPOERJ")}
          </h2>

          <p>
            {config(
              "sobre_texto_1",
              "A LASPOERJ — Liga Acadêmica de Saúde Pública Odontológica da Estácio RJ — nasce com o compromisso de aproximar a formação acadêmica da realidade social da população."
            )}
          </p>

          <p>
            {config(
              "sobre_texto_2",
              "Nosso propósito é fortalecer o olhar crítico, científico e humano dos estudantes de Odontologia, valorizando os princípios do SUS, a atenção primária, a integralidade do cuidado e a promoção da saúde bucal coletiva."
            )}
          </p>

          <p>
            {config(
              "sobre_texto_3",
              "Por meio de ações de ensino, pesquisa e extensão, buscamos construir uma odontologia mais acessível, preventiva, territorializada e comprometida com a transformação social."
            )}
          </p>
        </div>

        <div className="sobreCard">
          <h3>
            {config("compromisso_titulo", "Nosso compromisso")}
          </h3>
          <p>
            {config(
              "compromisso_texto",
              "Formar estudantes conscientes do papel social da Odontologia e preparados para atuar junto à comunidade."
            )}
          </p>
        </div>
      </section>

      <section className="numeros">
        <div>
          <strong>+20</strong>
          <span>Ligantes</span>
        </div>

        <div>
          <strong>05</strong>
          <span>Membros da diretoria</span>
        </div>

        <div>
          <strong>02</strong>
          <span>Professores orientadores</span>
        </div>

        <div>
          <strong>2026</strong>
          <span>Ano de fundação</span>
        </div>
      </section>

      <section id="diretoria" className="diretoria">
  <p className="subtitulo">NOSSA EQUIPE</p>
  <h2>Diretoria LASPOERJ</h2>

  <div id="diretoriaConteudo" className="diretoriaGrid">
          {diretoria.map((membro) => (
            <div className="membroCard" key={membro.nome}>
              <Image
                src={membro.foto_url || "/logo.png"}
                alt={membro.nome}
                width={400}
                height={500}
                className="fotoMembro"
              />

              <h3>{membro.nome}</h3>
              <span>{membro.cargo}</span>
              <p>{membro.bio}</p>
            </div>
          ))}
        </div>
      </section><section className="orientadores">
  <div className="orientadoresIntro">
    <p className="subtitulo">CONSELHO CIENTÍFICO</p>
    <h2>Professores Orientadores</h2>
    <p>
      A LASPOERJ conta com a orientação de professores comprometidos com a
      formação acadêmica, científica e social dos estudantes.
    </p>
  </div>

  <div className="orientadoresGrid">
    {orientadores.map((orientador) => (
      <div
        className="orientadorCard"
        key={orientador.id}
      >
        <Image
          src={orientador.foto_url || "/logo.png"}
          alt={orientador.nome}
          width={520}
          height={620}
          className="fotoOrientador"
        />

        <div>
          <span>{orientador.cargo}</span>
          <h3>{orientador.nome}</h3>
          <p>
            {orientador.bio ||
              "Professor orientador da LASPOERJ."}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>

      <section id="eventos" className="eventos">
  <p className="subtitulo">PROGRAMAÇÃO</p>
  <h2>Próximos Eventos</h2>

  {eventosSite.length === 0 ? (
    <p className="eventosVazio">
      Nenhum evento programado no momento.
    </p>
  ) : (
    <div className="eventosGrid">
      {eventosSite.map((evento) => {
        const data = new Date(`${evento.data_evento}T00:00:00`);

        const mesAno = data
          .toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })
          .toUpperCase();

        return (
          <div
            key={evento.id}
            className={
              evento.destaque
                ? "eventoCard destaqueEvento"
                : "eventoCard"
            }
          >
            <span>{mesAno}</span>

            <h3>{evento.titulo}</h3>

            <p>
              {evento.descricao || "Mais informações em breve."}
            </p>

            <strong>
              {evento.local || "Local a definir"}

              {evento.horario &&
                ` • ${evento.horario.slice(0, 5)}`}
            </strong>
          </div>
        );
      })}
    </div>
  )}
</section>

      <section
  id="agenda"
  className="agendaSection"
>
  <div id="agendaConteudo"></div>

  <p className="subtitulo">
    CALENDÁRIO
  </p>

  <h2>Agenda da Liga</h2>

  <div className="calendarCard">
    <div className="calendarHeader">
      <button
        type="button"
        onClick={() =>
          mudarMesCalendario(-1)
        }
        aria-label="Mês anterior"
      >
        ‹
      </button>

      <h3>
        {tituloCalendario}
      </h3>

      <button
        type="button"
        onClick={() =>
          mudarMesCalendario(1)
        }
        aria-label="Próximo mês"
      >
        ›
      </button>
    </div>

    <div className="weekDays">
      <span>DOM</span>
      <span>SEG</span>
      <span>TER</span>
      <span>QUA</span>
      <span>QUI</span>
      <span>SEX</span>
      <span>SÁB</span>
    </div>

    <div className="daysGrid">
      {diasCalendario.map(
        (item, indice) => {
          const temEvento =
            datasComEventos.has(
              item.dataISO
            );

          let classe = "";

          if (item.muted) {
            classe = "muted";
          }

          if (
            temEvento &&
            !item.muted
          ) {
            classe = "eventDay";
          }

          return (
            <span
              key={`${item.dataISO}-${indice}`}
              className={classe}
            >
              {item.dia}
            </span>
          );
        }
      )}
    </div>
  </div>

  <div className="eventList">
    <h3>Eventos do mês</h3>

    {eventosDoMes.length === 0 ? (
      <div className="eventItem">
        <div>
          <h4>
            Nenhum evento neste mês
          </h4>

          <p>
            Ainda não há eventos
            cadastrados para este período.
          </p>
        </div>
      </div>
    ) : (
      eventosDoMes.map((evento) => {
        const [
          ano,
          mes,
          dia,
        ] = evento.data_evento
          .split("-")
          .map(Number);

        const dataEvento = new Date(
          ano,
          mes - 1,
          dia
        );

        const mesAbreviado =
          dataEvento
            .toLocaleDateString(
              "pt-BR",
              {
                month: "short",
              }
            )
            .replace(".", "")
            .toUpperCase();

        return (
          <div
            className="eventItem"
            key={evento.id}
          >
            <div className="dateBox">
              <strong>
                {String(dia).padStart(
                  2,
                  "0"
                )}
              </strong>

              <span>
                {mesAbreviado}
              </span>
            </div>

            <div>
              <h4>
                {evento.titulo}
              </h4>

              <p>
                {evento.descricao ||
                  "Mais informações em breve."}
              </p>

              {(evento.horario ||
                evento.local) && (
                <p
                  style={{
                    marginTop: "10px",
                    fontWeight: 700,
                  }}
                >
                  {evento.horario &&
                    evento.horario.slice(
                      0,
                      5
                    )}

                  {evento.horario &&
                    evento.local &&
                    " • "}

                  {evento.local}
                </p>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
</section>

      <section id="avisos" className="avisosSection">
  <div id="avisosConteudo"></div>

  <div className="avisosCabecalho">
    <div>
      <p className="subtitulo">COMUNICADOS</p>
      <h2>Avisos da LASPOERJ</h2>

      <p className="avisosIntroducao">
        Informações, comunicados e atualizações importantes da Liga.
      </p>
    </div>
  </div>

  {avisosSite.length === 0 ? (
    <div className="avisosVazio">
      <p>Nenhum aviso publicado no momento.</p>
    </div>
  ) : (
    <div className="avisosGrid">
      {avisosSite.map((aviso) => (
        <article
          key={aviso.id}
          className={
            aviso.destaque
              ? "avisoCard avisoDestaque"
              : "avisoCard"
          }
        >
          <div className="avisoTopo">
            <span>
              {aviso.destaque ? "IMPORTANTE" : "COMUNICADO"}
            </span>

            {aviso.data_expiracao && (
              <small>
                Até{" "}
                {new Date(
                  `${aviso.data_expiracao}T00:00:00`
                ).toLocaleDateString("pt-BR")}
              </small>
            )}
          </div>

          <h3>{aviso.titulo}</h3>
          <p>{aviso.mensagem}</p>
        </article>
      ))}
    </div>
  )}
</section>

      <section id="jornal" className="jornalSection">
  <div id="jornalConteudo"></div>

  <div className="jornalCabecalho">
    <div>
      <p className="subtitulo">FIQUE POR DENTRO</p>
      <h2>Jornal LASPOERJ</h2>

      <p>
        Notícias, ações, entrevistas, relatos de experiência
        e divulgação científica produzidos pela Liga.
      </p>
    </div>

    <a href="/jornal" className="jornalVerTodas">
      VER TODAS AS PUBLICAÇÕES →
    </a>
  </div>

  {publicacoesSite.length === 0 ? (
    <div className="jornalVazio">
      <p>Nenhuma publicação disponível no momento.</p>
    </div>
  ) : (
    <div className="jornalGrid">
      {publicacoesSite.map((publicacao) => (
        <article
          key={publicacao.id}
          className={
            publicacao.destaque
              ? "jornalCard jornalDestaque"
              : "jornalCard"
          }
        >
          {publicacao.imagem_url && (
            <div className="jornalImagemBox">
              <img
                src={publicacao.imagem_url}
                alt={publicacao.titulo}
                className="jornalImagem"
              />
            </div>
          )}

          <div className="jornalCardConteudo">
            <div className="jornalMeta">
              {publicacao.categoria && (
                <span>{publicacao.categoria}</span>
              )}

              {publicacao.data_publicacao && (
                <small>
                  {new Date(
                    `${publicacao.data_publicacao}T00:00:00`
                  ).toLocaleDateString("pt-BR")}
                </small>
              )}
            </div>

            <h3>{publicacao.titulo}</h3>

            <p>
              {publicacao.resumo ||
                publicacao.conteudo?.slice(0, 180) ||
                "Leia esta publicação do Jornal LASPOERJ."}
            </p>

            {publicacao.autor && (
              <div className="jornalAutor">
                Por {publicacao.autor}
              </div>
            )}

            <a
              href={`/jornal/${publicacao.slug}`}
              className="jornalLerMais"
            >
              LER PUBLICAÇÃO →
            </a>
          </div>
        </article>
      ))}
    </div>
  )}
</section>

     <section id="contato" className="contatoSection">
  <div id="contatoConteudo"></div>
  <p className="subtitulo">FALE CONOSCO</p>

  <h2>Contato</h2>

  <p className="contatoTexto">
    Estamos aqui para ouvir você. Entre em contato com a LASPOERJ pelos canais abaixo.
  </p>

  <div className="contatoGrid">
    <a
      className="contatoCard"
      href={instagramUrl()}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="contatoIcone">◎</div>
      <span>Instagram</span>
      <p>{config("instagram", "@laspoerj")}</p>
    </a>

    <a
      className="contatoCard"
      href={`mailto:${config(
        "email_contato",
        "ligacademicasp@gmail.com"
      )}`}
    >
      <div className="contatoIcone">✉</div>
      <span>E-mail</span>
      <p>{config("email_contato", "ligacademicasp@gmail.com")}</p>
    </a>

    <a
      className="contatoCard"
      href={enderecoMapsUrl()}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="contatoIcone">⌖</div>
      <span>Localização</span>
      <p>
        {config(
          "endereco",
          "Avenida Alfredo Balthazar da Silveira, nº 580 - Recreio dos Bandeirantes, Rio de Janeiro - RJ, 22790-710"
        )}
      </p>
    </a>
  </div>
</section>
      <section id="sugestoes" className="sugestoesSection">
  <div className="sugestoesIntro">
    <p className="subtitulo">SUA VOZ NA LIGA</p>
    <h2>Caixa de Sugestões</h2>
    <p>
      Envie ideias, dúvidas, propostas de ações, temas para encontros ou
      sugestões para melhorar a LASPOERJ.
    </p>
  </div>

  <form
  className="sugestoesForm"
  onSubmit={enviarSugestao}
>
  <div className="linhaForm">
    <label>
      Nome *
      <input
        type="text"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
    </label>

    <label>
      Você é... *
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        required
      >
        <option value="">Selecione uma opção</option>
        <option value="Aluno">Aluno</option>
        <option value="Professor">Professor</option>
        <option value="Ligante LASPOERJ">Ligante LASPOERJ</option>
        <option value="Patrocinador">Patrocinador</option>
      </select>
    </label>
  </div>

  <div className="linhaForm">
    <label>
      WhatsApp
      <input
        type="text"
        placeholder="(21) 99999-0000"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />
    </label>

    <label>
      E-mail *
      <input
        type="email"
        placeholder="seuemail@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </label>
  </div>

  <label>
    Mensagem *
    <textarea
      placeholder="Escreva sua mensagem ou sugestão aqui..."
      value={mensagem}
      onChange={(e) => setMensagem(e.target.value)}
      required
    />
  </label>

  <button type="submit" disabled={enviando}>
    {enviando ? "ENVIANDO..." : "ENVIAR MENSAGEM →"}
  </button>

  <p className="avisoSugestao">
    Suas informações serão usadas apenas para contato da Liga.
  </p>
</form>
</section>
<footer className="footerSite">
  <div className="footerGrid">
    <div className="footerMarca">
      <Image src="/logo-footer.png" alt="LASPOERJ" width={95} height={95} />
      <h2>LASPOERJ</h2>
      <p>Liga Acadêmica de Saúde Pública Odontológica • Estácio RJ</p>
    </div>

    <div className="footerColuna">
      <h4>Navegação</h4>
      <a href="#sobre">Sobre</a>
      <a href="#diretoria">Diretoria</a>
      <a href="#eventos">Eventos</a>
      <a href="#agenda">Agenda</a>
      <a href="#avisos">Avisos</a>
      <a href="/jornal">Jornal</a>
      <a href="#contato">Contato</a>
      <a href="#sugestoes">Sugestões</a>
    </div>

    <div className="footerColuna">
      <h4>Contato</h4>
      <p>Instagram: {config("instagram", "@laspoerj")}</p>
      <p>E-mail: {config("email_contato", "ligacademicasp@gmail.com")}</p>
      <p>
        {config(
          "endereco",
          "Avenida Alfredo Balthazar da Silveira, nº 580 - Recreio dos Bandeirantes, Rio de Janeiro - RJ, 22790-710"
        )}
      </p>
    </div>
  </div>

  <div className="footerBottom">
    <p>© 2026 LASPOERJ. Todos os direitos reservados.</p>
  </div>
</footer>

      {mostrarBotaoTopo && (
        <button
          className="btnTopo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          aria-label="Voltar ao topo"
        >
          ↑
        </button>
      )}
    </main>
  );
}