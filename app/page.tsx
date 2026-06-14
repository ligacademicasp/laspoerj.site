import Image from "next/image";

const diretoria = [
  {
    nome: "Iasmim Lorena",
    cargo: "Presidente",
    foto: "/diretoria/iasmim.jpg",
    bio: "Idealizadora da LASPOERJ, estudante de Odontologia e apaixonada por saúde coletiva, SUS, endodontia e transformação social.",
  },
  {
    nome: "Riquelme Ferreira",
    cargo: "Vice-presidente",
    foto: "/diretoria/riquelme.jpg",
    bio: "Atua no apoio à organização institucional, projetos e fortalecimento das ações acadêmicas e extensionistas da Liga.",
  },
  {
    nome: "Patrick Klen",
    cargo: "Secretário-Geral",
    foto: "/diretoria/patrick.jpg",
    bio: "Responsável pelo suporte administrativo, registros, atas e comunicação interna da LASPOERJ.",
  },
  {
    nome: "Marcos Vinícius",
    cargo: "Diretor de Fotografia e Comunicação",
    foto: "/diretoria/marcos.jpg",
    bio: "Atua na identidade visual, fotografia, divulgação e comunicação digital da Liga.",
  },
  {
    nome: "Isabella Veloso",
    cargo: "Diretora de Pesquisa",
    foto: "/diretoria/isabella.jpg",
    bio: "Atua no desenvolvimento científico da Liga, organização de estudos, pesquisas e produções acadêmicas.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="logoBox">
          <Image src="/logo.png" alt="LASPOERJ" width={95} height={95} />
          <div>
            <strong>LASPOERJ</strong>
            <span>LIGA ACADÊMICA • ESTÁCIO RJ</span>
          </div>
        </div>

        <nav className="menu">
          <a href="#sobre">Sobre</a>
          <a href="#diretoria">Diretoria</a>
          <a href="#eventos">Eventos</a>
          <a href="#agenda">Agenda</a>
          <a href="#jornal">Jornal</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <section className="hero">
        <p className="subtitulo">LIGA ACADÊMICA • ESTÁCIO RJ</p>

        <h1>
          SAÚDE PÚBLICA.
          <br />
          ODONTOLOGIA.
          <br />
          <span className="typewriter gradient-text">COLETIVIDADE.</span>
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
        <div className="sobreTexto">
          <p className="subtitulo">CONHEÇA A LIGA</p>
          <h2>Sobre a LASPOERJ</h2>

          <p>
            A LASPOERJ — Liga Acadêmica de Saúde Pública Odontológica da
            Estácio RJ — nasce com o compromisso de aproximar a formação
            acadêmica da realidade social da população.
          </p>

          <p>
            Nosso propósito é fortalecer o olhar crítico, científico e humano
            dos estudantes de Odontologia, valorizando os princípios do SUS,
            a atenção primária, a integralidade do cuidado e a promoção da
            saúde bucal coletiva.
          </p>

          <p>
            Por meio de ações de ensino, pesquisa e extensão, buscamos construir
            uma odontologia mais acessível, preventiva, territorializada e
            comprometida com a transformação social.
          </p>
        </div>

        <div className="sobreCard">
          <h3>Nosso compromisso</h3>
          <p>
            Formar estudantes conscientes do papel social da Odontologia e
            preparados para atuar junto à comunidade.
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

        <div className="diretoriaGrid">
          {diretoria.map((membro) => (
            <div className="membroCard" key={membro.nome}>
              <Image
                src={membro.foto}
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
    <div className="orientadorCard">
      <Image
        src="/orientadores/arkader.jpg"
        alt="Prof. Rodrigo Arkader"
        width={520}
        height={620}
        className="fotoOrientador"
      />

      <div>
        <span>Diretor Científico</span>
        <h3>Prof. Rodrigo Arkader</h3>
        <p>
          Professor orientador da LASPOERJ, contribuindo para o desenvolvimento
          científico, acadêmico e institucional da Liga.
        </p>
      </div>
    </div>

    <div className="orientadorCard">
      <Image
        src="/orientadores/luciane.jpg"
        alt="Profª Luciane Monte Alto"
        width={520}
        height={620}
        className="fotoOrientador"
      />

      <div>
        <span>Diretora Científica</span>
        <h3>Profª Luciane Monte Alto</h3>
        <p>
          Professora orientadora da LASPOERJ, com atuação voltada à extensão,
          cuidado humanizado e integração entre universidade e comunidade.
        </p>
      </div>
    </div>
  </div>
</section>

      <section id="eventos" className="eventos">
        <p className="subtitulo">PROGRAMAÇÃO</p>
        <h2>Próximos Eventos</h2>

        <div className="eventosGrid">
          <div className="eventoCard destaqueEvento">
            <span>JUNHO 2026</span>
            <h3>Reunião Geral da LASPOERJ</h3>
            <p>
              Encontro de alinhamento com ligantes, diretoria e organização das
              primeiras atividades do semestre.
            </p>
            <strong>Biblioteca • 15h30</strong>
          </div>

          <div className="eventoCard">
            <span>JULHO 2026</span>
            <h3>Planejamento Semestral</h3>
            <p>
              Definição dos grupos de trabalho, calendário de ações e propostas
              de extensão.
            </p>
            <strong>Estácio RJ</strong>
          </div>

          <div className="eventoCard">
            <span>AGOSTO 2026</span>
            <h3>Workshop Atenção Básica</h3>
            <p>
              Atividade voltada ao papel da Odontologia na Atenção Primária e
              no SUS.
            </p>
            <strong>Em breve</strong>
          </div>
        </div>
      </section>

      <section id="agenda" className="agendaSection">
        <p className="subtitulo">CALENDÁRIO</p>
        <h2>Agenda da Liga</h2>

        <div className="calendarCard">
          <div className="calendarHeader">
            <button>‹</button>
            <h3>JUNHO 2026</h3>
            <button>›</button>
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
            <span className="muted">31</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
            <span>7</span><span>8</span><span className="eventDay">9</span><span>10</span><span>11</span><span>12</span><span>13</span>
            <span>14</span><span className="eventDay">15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
            <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span>
            <span>28</span><span>29</span><span>30</span><span className="muted">1</span><span className="muted">2</span><span className="muted">3</span><span className="muted">4</span>
          </div>
        </div>

        <div className="eventList">
          <h3>Eventos do mês</h3>

          <div className="eventItem">
            <div className="dateBox">
              <strong>09</strong>
              <span>JUN</span>
            </div>
            <div>
              <h4>Primeiro encontro da LASPOERJ com os ligantes</h4>
              <p>
                Apresentação da Liga, diretoria e projetos previstos para o
                período.
              </p>
            </div>
          </div>

          <div className="eventItem">
            <div className="dateBox">
              <strong>15</strong>
              <span>JUN</span>
            </div>
            <div>
              <h4>Apresentação da plataforma</h4>
              <p>
                Alinhamento do design institucional e organização da diretoria.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="jornal" className="contatoSection">
        <p className="subtitulo">FIQUE POR DENTRO</p>
        <h2>Jornal LASPOERJ</h2>

        <p className="contatoTexto">
          Espaço dedicado às notícias, ações, entrevistas, relatos de
          experiência e divulgação científica da liga.
        </p>
      </section>

      <section id="contato" className="contatoSection">
        <p className="subtitulo">VAMOS CONVERSAR</p>
        <h2>Entre em contato</h2>

        <p className="contatoTexto">
          Estudante, professor ou parceiro: há sempre espaço para quem quer
          transformar a saúde pública odontológica.
        </p>

        <div className="contatoGrid">
          <a
  href="https://instagram.com/laspoerj"
  target="_blank"
  rel="noopener noreferrer"
  className="contatoCard"
>
  <strong>Instagram</strong>
  <p>@laspoerj</p>
</a>

          <a
  href="mailto:ligacademica@gmail.com"
  className="contatoCard"
>
  <strong>E-mail</strong>
  <p>ligacademica@gmail.com</p>
</a>
        </div>
      </section>

      <footer>
        <Image src="/logo-footer.png" alt="LASPOERJ" width={220} height={220} />
        <h2>LASPOERJ</h2>
        <p>Liga Acadêmica de Saúde Pública Odontológica • Estácio RJ</p>
        <p>@laspoerj</p>
      </footer>
    </main>
  );
}