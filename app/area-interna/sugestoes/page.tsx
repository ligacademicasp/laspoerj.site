import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Sugestoes() {
  const { data: sugestoes, error } = await supabase
    .from("sugestoes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: "40px" }}>
      <h1>Sugestões Recebidas</h1>

      <p>Aqui aparecerão as sugestões enviadas pelos usuários.</p>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <strong>Erro ao carregar sugestões:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {!error && (!sugestoes || sugestoes.length === 0) && (
        <p>Nenhuma sugestão recebida ainda.</p>
      )}

      {!error && sugestoes && sugestoes.length > 0 && (
        <div style={{ marginTop: "30px", display: "grid", gap: "20px" }}>
          {sugestoes.map((sugestao) => (
            <div
              key={sugestao.id}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid #E3EDF7",
              }}
            >
              <strong>{sugestao.nome || "Anônimo"}</strong>
              <p>{sugestao.email}</p>
              <p>{sugestao.mensagem}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}