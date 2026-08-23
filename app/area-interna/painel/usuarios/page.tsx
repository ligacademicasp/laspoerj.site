"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  cargo: string | null;
  tipo_usuario: "administrador" | "orientador" | "ligante";
  ativo: boolean;
  created_at: string | null;
};

const tiposUsuario = [
  {
    valor: "administrador",
    label: "Administrador",
  },
  {
    valor: "orientador",
    label: "Orientador",
  },
  {
    valor: "ligante",
    label: "Ligante",
  },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemSistema, setMensagemSistema] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [usuarioEditando, setUsuarioEditando] =
    useState<Profile | null>(null);

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    cargo: "",
    tipo_usuario: "ligante" as
      | "administrador"
      | "orientador"
      | "ligante",
    ativo: true,
  });

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setCarregando(true);
    setMensagemSistema("");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, nome, email, cargo, tipo_usuario, ativo, created_at"
      )
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar usuários:", error);

      setMensagemSistema(
        `Erro ao carregar usuários: ${error.message}`
      );

      setUsuarios([]);
    } else {
      setUsuarios((data ?? []) as Profile[]);
    }

    setCarregando(false);
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return usuarios.filter((usuario) => {
      const texto = [
        usuario.nome,
        usuario.email,
        usuario.cargo,
        usuario.tipo_usuario,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const correspondeBusca =
        !termo || texto.includes(termo);

      const correspondeTipo =
        filtroTipo === "todos" ||
        usuario.tipo_usuario === filtroTipo;

      const correspondeStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && usuario.ativo) ||
        (filtroStatus === "inativos" && !usuario.ativo);

      return (
        correspondeBusca &&
        correspondeTipo &&
        correspondeStatus
      );
    });
  }, [usuarios, busca, filtroTipo, filtroStatus]);

  const contadores = useMemo(() => {
    return {
      total: usuarios.length,

      administradores: usuarios.filter(
        (usuario) =>
          usuario.tipo_usuario === "administrador"
      ).length,

      orientadores: usuarios.filter(
        (usuario) =>
          usuario.tipo_usuario === "orientador"
      ).length,

      ligantes: usuarios.filter(
        (usuario) =>
          usuario.tipo_usuario === "ligante"
      ).length,

      ativos: usuarios.filter(
        (usuario) => usuario.ativo
      ).length,
    };
  }, [usuarios]);

  function abrirEdicao(usuario: Profile) {
    setUsuarioEditando(usuario);

    setFormulario({
      nome: usuario.nome ?? "",
      email: usuario.email ?? "",
      cargo: usuario.cargo ?? "",
      tipo_usuario:
        usuario.tipo_usuario ?? "ligante",
      ativo: usuario.ativo ?? true,
    });

    setMensagemSistema("");
  }

  function fecharEdicao() {
    setUsuarioEditando(null);

    setFormulario({
      nome: "",
      email: "",
      cargo: "",
      tipo_usuario: "ligante",
      ativo: true,
    });
  }

  async function salvarUsuario() {
    if (!usuarioEditando) return;

    if (!formulario.nome.trim()) {
      setMensagemSistema(
        "Informe o nome do usuário."
      );
      return;
    }

    setSalvando(true);
    setMensagemSistema("");

    const { error } = await supabase
      .from("profiles")
      .update({
        nome: formulario.nome.trim(),
        email: formulario.email.trim() || null,
        cargo: formulario.cargo.trim() || null,
        tipo_usuario: formulario.tipo_usuario,
        ativo: formulario.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", usuarioEditando.id);

    if (error) {
      console.error("Erro ao atualizar usuário:", error);

      setMensagemSistema(
        `Erro ao atualizar usuário: ${error.message}`
      );

      setSalvando(false);
      return;
    }

    setMensagemSistema(
      "Usuário atualizado com sucesso."
    );

    fecharEdicao();
    await carregarUsuarios();

    setSalvando(false);
  }

  async function alternarStatus(usuario: Profile) {
    const novoStatus = !usuario.ativo;

    const acao = novoStatus ? "ativar" : "desativar";

    const confirmou = window.confirm(
      `Deseja realmente ${acao} ${usuario.nome || "este usuário"}?`
    );

    if (!confirmou) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        ativo: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", usuario.id);

    if (error) {
      setMensagemSistema(
        `Erro ao alterar status: ${error.message}`
      );
      return;
    }

    setMensagemSistema(
      novoStatus
        ? "Usuário ativado com sucesso."
        : "Usuário desativado com sucesso."
    );

    await carregarUsuarios();
  }

  function formatarTipo(tipo: string) {
    return (
      tiposUsuario.find(
        (item) => item.valor === tipo
      )?.label || tipo
    );
  }

  function formatarData(data: string | null) {
    if (!data) return "Não informada";

    return new Date(data).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">
            CONTROLE DE ACESSO
          </p>

          <h1>Usuários</h1>

          <p>
            Gerencie os perfis cadastrados na LASPOERJ,
            seus cargos, funções e status de acesso.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoSecundario"
          onClick={carregarUsuarios}
        >
          Atualizar
        </button>
      </div>

      {mensagemSistema && (
        <div className="painelMensagem">
          {mensagemSistema}
        </div>
      )}

      <section className="usuariosResumoGrid">
        <div className="usuariosResumoCard">
          <span>Total</span>
          <strong>{contadores.total}</strong>
          <p>perfis cadastrados</p>
        </div>

        <div className="usuariosResumoCard">
          <span>Administradores</span>
          <strong>
            {contadores.administradores}
          </strong>
          <p>controle do painel</p>
        </div>

        <div className="usuariosResumoCard">
          <span>Orientadores</span>
          <strong>{contadores.orientadores}</strong>
          <p>professores orientadores</p>
        </div>

        <div className="usuariosResumoCard">
          <span>Ligantes</span>
          <strong>{contadores.ligantes}</strong>
          <p>membros da Liga</p>
        </div>

        <div className="usuariosResumoCard">
          <span>Ativos</span>
          <strong>{contadores.ativos}</strong>
          <p>acessos habilitados</p>
        </div>
      </section>

      <section className="usuariosPainelCard">
        <div className="usuariosFiltros">
          <label>
            <span>Buscar</span>

            <input
              type="search"
              placeholder="Nome, e-mail ou cargo..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />
          </label>

          <label>
            <span>Tipo</span>

            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(e.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="administrador">
                Administradores
              </option>

              <option value="orientador">
                Orientadores
              </option>

              <option value="ligante">
                Ligantes
              </option>
            </select>
          </label>

          <label>
            <span>Status</span>

            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="ativos">
                Ativos
              </option>

              <option value="inativos">
                Inativos
              </option>
            </select>
          </label>
        </div>

        {carregando ? (
          <div className="painelEstadoVazio">
            Carregando usuários...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="painelEstadoVazio">
            <h3>Nenhum usuário encontrado</h3>

            <p>
              Não existem perfis correspondentes
              aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="usuariosTabela">
            <div className="usuariosTabelaCabecalho">
              <span>Usuário</span>
              <span>Cargo</span>
              <span>Tipo</span>
              <span>Status</span>
              <span>Ações</span>
            </div>

            {usuariosFiltrados.map(
              (usuario) => (
                <article
                  className="usuarioLinha"
                  key={usuario.id}
                >
                  <div className="usuarioIdentidade">
                    <div className="usuarioAvatar">
                      {(usuario.nome ||
                        usuario.email ||
                        "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {usuario.nome ||
                          "Sem nome"}
                      </strong>

                      <span>
                        {usuario.email ||
                          "Sem e-mail"}
                      </span>

                      <small>
                        Cadastrado em{" "}
                        {formatarData(
                          usuario.created_at
                        )}
                      </small>
                    </div>
                  </div>

                  <div className="usuarioCargo">
                    {usuario.cargo ||
                      "Não informado"}
                  </div>

                  <div>
                    <span
                      className={`usuarioTipo usuarioTipo-${usuario.tipo_usuario}`}
                    >
                      {formatarTipo(
                        usuario.tipo_usuario
                      )}
                    </span>
                  </div>

                  <div>
                    <span
                      className={
                        usuario.ativo
                          ? "usuarioStatus usuarioStatusAtivo"
                          : "usuarioStatus usuarioStatusInativo"
                      }
                    >
                      {usuario.ativo
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </div>

                  <div className="usuarioAcoes">
                    <button
                      type="button"
                      onClick={() =>
                        abrirEdicao(usuario)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={
                        usuario.ativo
                          ? "usuarioDesativar"
                          : "usuarioAtivar"
                      }
                      onClick={() =>
                        alternarStatus(usuario)
                      }
                    >
                      {usuario.ativo
                        ? "Desativar"
                        : "Ativar"}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {usuarioEditando && (
        <div
          className="usuarioModalOverlay"
          onClick={fecharEdicao}
        >
          <section
            className="usuarioModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="usuarioModalCabecalho">
              <div>
                <p className="painelSubtitulo">
                  EDITAR USUÁRIO
                </p>

                <h2>
                  {usuarioEditando.nome ||
                    "Usuário"}
                </h2>
              </div>

              <button
                type="button"
                className="eventoFechar"
                onClick={fecharEdicao}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="usuarioFormulario">
              <label>
                <span>Nome</span>

                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      nome: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>E-mail</span>

                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      email: e.target.value,
                    })
                  }
                />

                <small>
                  Este campo identifica o perfil.
                  A alteração aqui não muda automaticamente
                  o e-mail usado no Supabase Auth.
                </small>
              </label>

              <label>
                <span>Cargo na LASPOERJ</span>

                <input
                  type="text"
                  value={formulario.cargo}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      cargo: e.target.value,
                    })
                  }
                  placeholder="Ex.: Presidente, Secretário-Geral..."
                />
              </label>

              <label>
                <span>Tipo de usuário</span>

                <select
                  value={
                    formulario.tipo_usuario
                  }
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      tipo_usuario:
                        e.target.value as
                          | "administrador"
                          | "orientador"
                          | "ligante",
                    })
                  }
                >
                  {tiposUsuario.map(
                    (tipo) => (
                      <option
                        key={tipo.valor}
                        value={tipo.valor}
                      >
                        {tipo.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="usuarioToggle">
                <input
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      ativo: e.target.checked,
                    })
                  }
                />

                <div>
                  <strong>
                    Usuário ativo
                  </strong>

                  <span>
                    Usuários inativos não deverão
                    ter acesso às áreas protegidas
                    quando concluirmos as permissões.
                  </span>
                </div>
              </label>
            </div>

            <div className="usuarioModalAcoes">
              <button
                type="button"
                className="painelBotaoSecundario"
                onClick={fecharEdicao}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="painelBotaoPrincipal"
                onClick={salvarUsuario}
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}