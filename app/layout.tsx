import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/mobile/home-mobile.css";
import "../styles/mobile/painel-mobile.css";
import "../styles/mobile/auth-mobile.css";

export const metadata: Metadata = {
  title: "LASPOERJ",
  description: "Liga Acadêmica de Saúde Pública Odontológica",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}