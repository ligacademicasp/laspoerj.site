import Link from "next/link";
import Image from "next/image";

export default function PortalFooter() {
  return (
    <footer className="portalFooter">
      <div className="portalFooterTopo">
        <div className="portalFooterMarca">
          <Image
            src="/logo-footer.png"
            alt="LASPOERJ"
            width={66}
            height={66}
          />

          <div>
            <strong>LASPOERJ</strong>
            <span>
              Liga Acadêmica de Saúde Pública Odontológica • Estácio RJ
            </span>
          </div>
        </div>

        <div className="portalFooterColunas">
          <div>
            <h3>Institucional</h3>
            <Link href="/institucional">Sobre a Liga</Link>
            <Link href="/transparencia">Transparência e Impacto</Link>
            <Link href="/documentos">Documentos</Link>
          </div>

          <div>
            <h3>Atuação</h3>
            <Link href="/projetos">Projetos e Ações</Link>
            <Link href="/pesquisa">Produção Científica</Link>
            <Link href="/jornal">LASPOERJ em Ação</Link>
          </div>

          <div>
            <h3>Participação</h3>
            <Link href="/processo-seletivo">Faça parte</Link>
            <Link href="/#contato">Contato</Link>
            <Link href="/login">Área interna</Link>
          </div>
        </div>
      </div>

      <div className="portalFooterBase">
        <span>© 2026 LASPOERJ</span>
        <span>ENSINO • PESQUISA • EXTENSÃO • SAÚDE COLETIVA</span>
      </div>
    </footer>
  );
}
