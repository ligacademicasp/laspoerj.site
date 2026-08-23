import Link from "next/link";

const modulos = [
  {
    titulo: "Eventos",
    descricao: "Crie, edite e publique os próximos eventos da Liga.",
    href: "/area-interna/eventos",
    quantidade: "0",
  },
  {
    titulo: "Agenda",
    descricao: "Gerencie as datas destacadas no calendário.",
    href: "/area-interna/agenda",
    quantidade: "0",
  },
  {
    titulo: "Avisos",
    descricao: "Publique comunicados para ligantes e visitantes.",
    href: "/area-interna/avisos",
    quantidade: "0",
  },
  {
    titulo: "Jornal",
    descricao: "Crie e altere matérias do Jornal LASPOERJ.",
    href: "/area-interna/jornal",
    quantidade: "0",
  },
  {
    titulo: "Sugestões",
    descricao: "Visualize as sugestões recebidas pelo site.",
    href: "/area-interna/sugestoes",
    quantidade: "0",
  },
];

export default function AreaInterna() {
  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">PAINEL ADMINISTRATIVO</p>
          <h1>Visão geral</h1>
          <p>
            Gerencie os conteúdos publicados no site da LASPOERJ.
          </p>
        </div>

        <Link href="/" className="painelVerSite">
          Ver site público
        </Link>
      </div>

      <div className="painelCards">
        {modulos.map((modulo) => (
          <Link
            href={modulo.href}
            className="painelCard"
            key={modulo.titulo}
          >
            <span className="painelQuantidade">{modulo.quantidade}</span>
            <h2>{modulo.titulo}</h2>
            <p>{modulo.descricao}</p>
            <strong>Acessar módulo →</strong>
          </Link>
        ))}
      </div>
    </div>
  );
}