import type { ReactNode } from "react";
import PortalHeader from "./PortalHeader";
import PortalFooter from "./PortalFooter";
import "./portal.css";

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="portalSite">
      <PortalHeader />
      {children}
      <PortalFooter />
    </div>
  );
}
