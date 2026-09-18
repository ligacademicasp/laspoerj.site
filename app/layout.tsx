import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import "../styles/mobile/home-mobile.css";
import "../styles/mobile/painel-mobile.css";
import "../styles/mobile/auth-mobile.css";

const siteUrl = "https://laspoerj-site-djm2.vercel.app";

const temaInicialScript = `
(function () {
  try {
    var salvo = localStorage.getItem("laspoerj-theme");
    var tema = salvo === "dark" || salvo === "light"
      ? salvo
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    document.documentElement.dataset.theme = tema;
    document.documentElement.style.colorScheme = tema;
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LASPOERJ | Saúde Pública Odontológica",
    template: "%s | LASPOERJ",
  },
  description:
    "Liga Acadêmica de Saúde Pública Odontológica da Estácio RJ. Ensino, pesquisa, extensão e ações voltadas à saúde bucal coletiva.",
  keywords: [
    "LASPOERJ",
    "saúde pública odontológica",
    "saúde coletiva",
    "odontologia",
    "Estácio RJ",
    "liga acadêmica",
    "extensão universitária",
    "SUS",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LASPOERJ | Saúde Pública Odontológica",
    description:
      "Ensino, pesquisa, extensão e ações que aproximam a Odontologia da comunidade.",
    url: siteUrl,
    siteName: "LASPOERJ",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo da LASPOERJ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LASPOERJ | Saúde Pública Odontológica",
    description:
      "Ensino, pesquisa, extensão e ações que aproximam a Odontologia da comunidade.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071F5C",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: temaInicialScript }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
