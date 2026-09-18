"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SairButton from "./SairButton";

type Icone =
  | "dashboard"
  | "eventos"
  | "agenda"
  | "avisos"
  | "jornal"
  | "portal"
  | "documentos"
  | "sugestoes"
  | "equipe"
  | "usuarios"
  | "configuracoes";

type LinkPainel = {
  nome: string;
  href: string;
  icone: Icone;
};

const grupos: {
  titulo: string;
  links: LinkPainel[];
}[] = [
  {
    titulo: "Visão geral",
    links: [
      {
        nome: "Dashboard",
        href: "/area-interna/painel",
        icone: "dashboard",
      },
    ],
  },
  {
    titulo: "Conteúdo",
    links: [
      {
        nome: "Eventos",
        href: "/area-interna/painel/eventos",
        icone: "eventos",
      },
      {
        nome: "Agenda",
        href: "/area-interna/painel/agenda",
        icone: "agenda",
      },
      {
        nome: "Avisos",
        href: "/area-interna/painel/avisos",
        icone: "avisos",
      },
      {
        nome: "LASPOERJ em Ação",
        href: "/area-interna/painel/jornal",
        icone: "jornal",
      },
      {
        nome: "Portal público",
        href: "/area-interna/painel/portal",
        icone: "portal",
      },
      {
        nome: "Documentos",
        href: "/area-interna/painel/documentos",
        icone: "documentos",
      },
    ],
  },
  {
    titulo: "Organização",
    links: [
      {
        nome: "Sugestões",
        href: "/area-interna/painel/sugestoes",
        icone: "sugestoes",
      },
      {
        nome: "Equipe",
        href: "/area-interna/painel/equipe",
        icone: "equipe",
      },
    ],
  },
  {
    titulo: "Administração",
    links: [
      {
        nome: "Usuários",
        href: "/area-interna/painel/usuarios",
        icone: "usuarios",
      },
      {
        nome: "Configurações",
        href: "/area-interna/painel/configuracoes",
        icone: "configuracoes",
      },
    ],
  },
];

function IconePainel({ tipo }: { tipo: Icone }) {
  const comum = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (tipo === "dashboard") {
    return (
      <svg {...comum}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (tipo === "eventos") {
    return (
      <svg {...comum}>
        <path d="M8 2v4M16 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    );
  }

  if (tipo === "agenda") {
    return (
      <svg {...comum}>
        <path d="M4 4h16v16H4zM8 2v4M16 2v4M4 9h16" />
        <path d="m8 14 2 2 5-5" />
      </svg>
    );
  }

  if (tipo === "avisos") {
    return (
      <svg {...comum}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (tipo === "jornal") {
    return (
      <svg {...comum}>
        <path d="M4 4h13v16H4z" />
        <path d="M8 8h5M8 12h5M8 16h3M17 7h3v11a2 2 0 0 1-2 2h-1" />
      </svg>
    );
  }

  if (tipo === "portal") {
    return (
      <svg {...comum}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
    );
  }

  if (tipo === "documentos") {
    return (
      <svg {...comum}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    );
  }

  if (tipo === "sugestoes") {
    return (
      <svg {...comum}>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.3 9.3 0 0 1-4-.9L3 21l1.7-4.2A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </svg>
    );
  }

  if (tipo === "equipe") {
    return (
      <svg {...comum}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 7M17 14a5 5 0 0 1 4 4.9" />
      </svg>
    );
  }

  if (tipo === "usuarios") {
    return (
      <svg {...comum}>
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    );
  }

  return (
    <svg {...comum}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

export default function PainelSidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  function linkAtivo(href: string) {
    if (href === "/area-interna/painel") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside className="adminSidebar">
        <div className="adminSidebarInner">
          <Link
            href="/area-interna/painel"
            className="adminBrand"
            onClick={() => setAberto(false)}
          >
            <Image
              src="/logo.png"
              alt="LASPOERJ"
              width={54}
              height={54}
              priority
            />

            <div>
              <strong>LASPOERJ</strong>
              <span>GESTÃO INTERNA</span>
            </div>
          </Link>

          <button
            type="button"
            className={aberto ? "adminMobileToggle adminMobileToggleAtivo" : "adminMobileToggle"}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            onClick={() => setAberto((valor) => !valor)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={aberto ? "adminNavWrap adminNavWrapAberto" : "adminNavWrap"}>
            <nav className="adminNav">
              {grupos.map((grupo) => (
                <div className="adminNavGrupo" key={grupo.titulo}>
                  <p>{grupo.titulo}</p>

                  {grupo.links.map((link) => {
                    const ativo = linkAtivo(link.href);

                    return (
                      <Link
                        href={link.href}
                        key={link.href}
                        className={ativo ? "adminNavLink adminNavLinkAtivo" : "adminNavLink"}
                        onClick={() => setAberto(false)}
                      >
                        <span className="adminNavIcone">
                          <IconePainel tipo={link.icone} />
                        </span>

                        <span>{link.nome}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="adminSidebarFooter">
              <Link href="/" target="_blank" onClick={() => setAberto(false)}>
                Ver site público ↗
              </Link>

              <SairButton />
            </div>
          </div>
        </div>
      </aside>

      {aberto && (
        <button
          type="button"
          className="adminMobileOverlay"
          aria-label="Fechar menu"
          onClick={() => setAberto(false)}
        />
      )}
    </>
  );
}
