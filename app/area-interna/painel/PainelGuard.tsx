"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ProfileAcesso = {
  tipo_usuario: "administrador" | "orientador" | "ligante" | null;
  ativo: boolean | null;
};

export default function PainelGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [mensagem, setMensagem] = useState(
    "Verificando seu acesso..."
  );

  useEffect(() => {
    let montado = true;

    async function verificarAcesso() {
      setVerificando(true);
      setMensagem("Verificando seu acesso...");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!montado) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("tipo_usuario, ativo")
          .eq("id", user.id)
          .maybeSingle<ProfileAcesso>();

      if (!montado) return;

      if (profileError) {
        console.error(
          "Erro ao verificar perfil do usuário:",
          profileError
        );

        setMensagem(
          "Não foi possível verificar seu acesso. Redirecionando..."
        );

        setTimeout(() => {
          router.replace("/login");
        }, 900);

        return;
      }

      const temAcesso =
        profile?.ativo === true &&
        (profile.tipo_usuario === "administrador" ||
          profile.tipo_usuario === "orientador");

      if (!temAcesso) {
        setMensagem(
          "Sua conta não possui acesso ao painel administrativo."
        );

        setTimeout(() => {
          router.replace("/");
        }, 1100);

        return;
      }

      setVerificando(false);
    }

    verificarAcesso();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      montado = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (verificando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "30px",
          background: "#f4f8fc",
        }}
      >
        <div
          style={{
            width: "min(460px, 100%)",
            padding: "36px",
            borderRadius: "24px",
            background: "#ffffff",
            border: "1px solid #dce7f1",
            boxShadow:
              "0 18px 50px rgba(7, 31, 92, 0.08)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 18px",
              borderRadius: "50%",
              border: "4px solid #dce7f1",
              borderTopColor: "#1AA8A5",
              animation: "painelGuardGirar 0.8s linear infinite",
            }}
          />

          <strong
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#071F5C",
              fontSize: "20px",
            }}
          >
            LASPOERJ
          </strong>

          <p
            style={{
              margin: 0,
              color: "#65758b",
              lineHeight: 1.6,
            }}
          >
            {mensagem}
          </p>

          <style jsx>{`
            @keyframes painelGuardGirar {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}