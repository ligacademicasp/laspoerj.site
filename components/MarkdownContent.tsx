import React from "react";

type MarkdownContentProps = {
  content: string;
};

function renderInline(texto: string) {
  const partes: React.ReactNode[] = [];
  const regex =
    /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  let ultimoIndice = 0;
  let match: RegExpExecArray | null;
  let chave = 0;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimoIndice) {
      partes.push(
        texto.slice(ultimoIndice, match.index)
      );
    }

    const token = match[0];

    if (
      token.startsWith("**") &&
      token.endsWith("**")
    ) {
      partes.push(
        <strong key={`md-${chave++}`}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      token.startsWith("*") &&
      token.endsWith("*")
    ) {
      partes.push(
        <em key={`md-${chave++}`}>
          {token.slice(1, -1)}
        </em>
      );
    } else {
      const linkMatch = token.match(
        /^\[([^\]]+)\]\(([^)]+)\)$/
      );

      if (linkMatch) {
        const [, label, url] = linkMatch;

        partes.push(
          <a
            key={`md-${chave++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        );
      } else {
        partes.push(token);
      }
    }

    ultimoIndice = regex.lastIndex;
  }

  if (ultimoIndice < texto.length) {
    partes.push(texto.slice(ultimoIndice));
  }

  return partes;
}

export default function MarkdownContent({
  content,
}: MarkdownContentProps) {
  const linhas = content
    .replace(/\r\n/g, "\n")
    .split("\n");

  const elementos: React.ReactNode[] = [];
  let itensLista: string[] = [];

  function finalizarLista() {
    if (itensLista.length === 0) return;

    elementos.push(
      <ul
        key={`lista-${elementos.length}`}
        className="artigoLista"
      >
        {itensLista.map((item, indice) => (
          <li key={indice}>
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );

    itensLista = [];
  }

  linhas.forEach((linha, indice) => {
    const texto = linha.trim();

    if (texto.startsWith("- ")) {
      itensLista.push(texto.slice(2));
      return;
    }

    finalizarLista();

    if (!texto) {
      return;
    }

    if (texto.startsWith("### ")) {
      elementos.push(
        <h3 key={indice}>
          {renderInline(texto.slice(4))}
        </h3>
      );
      return;
    }

    if (texto.startsWith("## ")) {
      elementos.push(
        <h2 key={indice}>
          {renderInline(texto.slice(3))}
        </h2>
      );
      return;
    }

    if (texto.startsWith("> ")) {
      elementos.push(
        <blockquote key={indice}>
          {renderInline(texto.slice(2))}
        </blockquote>
      );
      return;
    }

    elementos.push(
      <p key={indice}>
        {renderInline(texto)}
      </p>
    );
  });

  finalizarLista();

  return (
    <div className="artigoConteudoFormatado">
      {elementos}
    </div>
  );
}
