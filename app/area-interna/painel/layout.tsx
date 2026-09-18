import type { ReactNode } from "react";
import PainelGuard from "./PainelGuard";
import PainelSidebar from "./PainelSidebar";
import "../../../styles/painel-admin.css";

export default function AreaInternaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="adminShell">
      <PainelSidebar />

      <main className="adminMain">
        <PainelGuard>{children}</PainelGuard>
      </main>
    </div>
  );
}
