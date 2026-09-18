"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/institucional", label: "Institucional" },
  { href: "/projetos", label: "Projetos" },
  { href: "/pesquisa", label: "Pesquisa" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/processo-seletivo", label: "Faça parte" },
  { href: "/documentos", label: "Documentos" },
];

export default function PortalHeader() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="portalHeader">
        <Link href="/" className="portalMarca" onClick={() => setAberto(false)}>
          <Image
            src="/logo.png"
            alt="LASPOERJ"
            width={58}
            height={58}
            priority
          />

          <div>
            <strong>LASPOERJ</strong>
            <span>LIGA ACADÊMICA • ESTÁCIO RJ</span>
          </div>
        </Link>

        <nav className={aberto ? "portalMenu portalMenuAberto" : "portalMenu"}>
          <Link
            href="/"
            onClick={() => setAberto(false)}
            className={pathname === "/" ? "ativo" : ""}
          >
            Início
          </Link>

          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={() => setAberto(false)}
              className={
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "ativo"
                  : ""
              }
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/jornal"
            onClick={() => setAberto(false)}
            className={pathname.startsWith("/jornal") ? "ativo" : ""}
          >
            LASPOERJ em Ação
          </Link>

          <Link
            href="/login"
            className="portalAreaInterna"
            onClick={() => setAberto(false)}
          >
            Área interna
          </Link>
        </nav>

        <button
          type="button"
          className={aberto ? "portalMenuBtn portalMenuBtnAtivo" : "portalMenuBtn"}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          onClick={() => setAberto((valor) => !valor)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {aberto && (
        <button
          type="button"
          className="portalOverlay"
          aria-label="Fechar menu"
          onClick={() => setAberto(false)}
        />
      )}
    </>
  );
}
