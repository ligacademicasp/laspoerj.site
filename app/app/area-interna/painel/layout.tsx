import SairButton from "./SairButton";
import PainelGuard from "./PainelGuard";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

const linksPainel = [
  {
    nome: "Dashboard",
    href: "/area-interna/painel",
  },
  {
    nome: "Eventos",
    href: "/area-interna/painel/eventos",
  },
  {
    nome: "Agenda",
    href: "/area-interna/painel/agenda",
  },
  {
    nome: "Avisos",
    href: "/area-interna/painel/avisos",
  },
  {
    nome: "Jornal",
    href: "/area-interna/painel/jornal",
  },
  {
    nome: "Sugestões",
    href: "/area-interna/painel/sugestoes",
  },
  {
    nome: "Equipe",
    href: "/area-interna/painel/equipe",
  },
  {
    nome: "Usuários",
    href: "/area-interna/painel/usuarios",
  },
  {
    nome: "Configurações",
    href: "/area-interna/painel/configuracoes",
  },
];

export default function AreaInternaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="painelLayout">
      <aside className="painelSidebar">
        <div className="painelLogo">
          <Image
            src="/logo.png"
            alt="LASPOERJ"
            width={62}
            height={62}
            priority
          />

          <div>
            <strong>LASPOERJ</strong>
            <span>ADMINISTRAÇÃO</span>
          </div>
        </div>

        <nav className="painelMenu">
          {linksPainel.map((link) => (
            <Link
              href={link.href}
              key={link.href}
            >
              {link.nome}
            </Link>
          ))}
        </nav>

        <div className="painelSidebarRodape">
          <Link href="/">
            Voltar ao site
          </Link>

          <SairButton />
        </div>
      </aside>

      <main className="painelConteudo">
        <PainelGuard>
          {children}
        </PainelGuard>
      </main>
    </div>
  );
}