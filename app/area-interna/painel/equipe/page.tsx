"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type GrupoEquipe = "diretoria" | "orientador";

type MembroEquipe = {
  id: number;
  nome: string;
  cargo: string;
  bio: string | null;
  foto_url: string | null;
  grupo: GrupoEquipe;
  ordem: number;
  ativo: boolean;
};

const formularioVazio = {
  nome: "",
  cargo: "",
  bio: "",
  foto_url: "",
  grupo: "diretoria" as GrupoEquipe,
  ordem: 1,
  ativo: true,
};

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

export default function EquipePage() {
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [formularioAberto, setFormularioAberto] =
    useState(false);

  const [editando, setEditando] =
    useState<MembroEquipe | null>(null);

  const [formulario, setFormulario] =
    useState(formularioVazio);

  const [arquivoFoto, setArquivoFoto] =
    useState<File | null>(null);

  const [previewFoto, setPreviewFoto] =
    useState("");

  useEffect(() => {
    carregarEquipe();
  }, []);

  useEffect(() => {
    return () => {
      if (previewFoto.startsWith("blob:")) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [previewFoto]);

  async function carregarEquipe() {
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("equipe")
      .select(
        "id, nome, cargo, bio, foto_url, grupo, ordem, ativo"
      )
      .order("grupo", { ascending: true })
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Erro ao carregar equipe:", error);

      setMensagem(
        `Erro ao carregar equipe: ${error.message}`
      );

      setEquipe([]);
    } else {
      setEquipe((data ?? []) as MembroEquipe[]);
    }

    setCarregando(false);
  }

  const diretoria = useMemo(
    () =>
      equipe.filter(
        (membro) => membro.grupo === "diretoria"
      ),
    [equipe]
  );

  const orientadores = useMemo(
    () =>
      equipe.filter(
        (membro) => membro.grupo === "orientador"
      ),
    [equipe]
  );

  function limparPreview() {
    if (previewFoto.startsWith("blob:")) {
      URL.revokeObjectURL(previewFoto);
    }

    setPreviewFoto("");
    setArquivoFoto(null);
  }

  function abrirNovo(grupo: GrupoEquipe) {
    limparPreview();

    const grupoAtual =
      grupo === "diretoria"
        ? diretoria
        : orientadores;

    const proximaOrdem =
      grupoAtual.length === 0
        ? 1
        : Math.max(
            ...grupoAtual.map(
              (membro) => membro.ordem
            )
          ) + 1;

    setEditando(null);

    setFormulario({
      ...formularioVazio,
      grupo,
      ordem: proximaOrdem,
    });

    setMensagem("");
    setFormularioAberto(true);
  }

  function abrirEdicao(membro: MembroEquipe) {
    limparPreview();

    setEditando(membro);

    setFormulario({
      nome: membro.nome,
      cargo: membro.cargo,
      bio: membro.bio ?? "",
      foto_url: membro.foto_url ?? "",
      grupo: membro.grupo,
      ordem: membro.ordem,
      ativo: membro.ativo,
    });

    setPreviewFoto(membro.foto_url ?? "");
    setMensagem("");
    setFormularioAberto(true);
  }

  function fecharFormulario() {
    limparPreview();

    setFormularioAberto(false);
    setEditando(null);
    setFormulario(formularioVazio);
  }

  function selecionarFoto(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setMensagem(
        "Selecione um arquivo de imagem."
      );
      e.target.value = "";
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setMensagem(
        "A imagem deve ter no máximo 5 MB."
      );
      e.target.value = "";
      return;
    }

    if (previewFoto.startsWith("blob:")) {
      URL.revokeObjectURL(previewFoto);
    }

    setArquivoFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
    setMensagem("");
  }

  function normalizarNomeArquivo(nome: string) {
    return nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-");
  }

  async function enviarFotoStorage() {
    if (!arquivoFoto) {
      return formulario.foto_url.trim() || null;
    }

    setEnviandoFoto(true);

    try {
      const extensaoOriginal =
        arquivoFoto.name.split(".").pop() || "jpg";

      const extensao =
        extensaoOriginal
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      const nomeBase = normalizarNomeArquivo(
        formulario.nome.trim() || "membro"
      ).replace(/\.[^.]+$/, "");

      const caminho = `${
        formulario.grupo
      }/${Date.now()}-${nomeBase}.${extensao}`;

      const { error: uploadError } =
        await supabase.storage
          .from("equipe")
          .upload(caminho, arquivoFoto, {
            cacheControl: "3600",
            upsert: false,
            contentType: arquivoFoto.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("equipe")
        .getPublicUrl(caminho);

      return data.publicUrl;
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvarMembro(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !formulario.nome.trim() ||
      !formulario.cargo.trim()
    ) {
      setMensagem("Preencha nome e cargo.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    try {
      const fotoUrl = await enviarFotoStorage();

      const payload = {
        nome: formulario.nome.trim(),
        cargo: formulario.cargo.trim(),
        bio: formulario.bio.trim() || null,
        foto_url: fotoUrl,
        grupo: formulario.grupo,
        ordem: Number(formulario.ordem) || 1,
        ativo: formulario.ativo,
        updated_at: new Date().toISOString(),
      };

      const resultado = editando
        ? await supabase
            .from("equipe")
            .update(payload)
            .eq("id", editando.id)
        : await supabase
            .from("equipe")
            .insert(payload);

      if (resultado.error) {
        throw resultado.error;
      }

      const estavaEditando = Boolean(editando);

      fecharFormulario();
      await carregarEquipe();

      setMensagem(
        estavaEditando
          ? "Membro atualizado com sucesso."
          : "Membro adicionado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao salvar membro:",
        error
      );

      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o membro.";

      setMensagem(
        `Erro ao salvar: ${mensagemErro}`
      );
    } finally {
      setSalvando(false);
      setEnviandoFoto(false);
    }
  }

  async function alternarAtivo(
    membro: MembroEquipe
  ) {
    const { error } = await supabase
      .from("equipe")
      .update({
        ativo: !membro.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membro.id);

    if (error) {
      setMensagem(
        `Erro ao alterar status: ${error.message}`
      );
      return;
    }

    await carregarEquipe();
  }

  async function excluirMembro(
    membro: MembroEquipe
  ) {
    const confirmou = window.confirm(
      `Excluir ${membro.nome} da equipe?`
    );

    if (!confirmou) return;

    const { error } = await supabase
      .from("equipe")
      .delete()
      .eq("id", membro.id);

    if (error) {
      setMensagem(
        `Erro ao excluir: ${error.message}`
      );
      return;
    }

    await carregarEquipe();

    setMensagem(
      "Membro excluído com sucesso."
    );
  }

  function renderizarGrupo(
    titulo: string,
    grupo: GrupoEquipe,
    membros: MembroEquipe[]
  ) {
    return (
      <section className="equipeAdminSecao">
        <div className="equipeAdminSecaoTopo">
          <div>
            <p className="painelSubtitulo">
              {grupo === "diretoria"
                ? "GESTÃO DA LIGA"
                : "CONSELHO CIENTÍFICO"}
            </p>

            <h2>{titulo}</h2>

            <p>
              {membros.length}{" "}
              {membros.length === 1
                ? "membro cadastrado"
                : "membros cadastrados"}
            </p>
          </div>

          <button
            type="button"
            className="painelBotaoPrincipal"
            onClick={() =>
              abrirNovo(grupo)
            }
          >
            + Adicionar
          </button>
        </div>

        {membros.length === 0 ? (
          <div className="painelEstadoVazio">
            Nenhum membro cadastrado
            neste grupo.
          </div>
        ) : (
          <div className="equipeAdminGrid">
            {membros.map((membro) => (
              <article
                className="equipeAdminCard"
                key={membro.id}
              >
                <div className="equipeAdminFoto">
                  {membro.foto_url ? (
                    <img
                      src={membro.foto_url}
                      alt={membro.nome}
                    />
                  ) : (
                    <div className="equipeAdminSemFoto">
                      {membro.nome
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="equipeAdminConteudo">
                  <div className="equipeAdminStatus">
                    <span>
                      Ordem {membro.ordem}
                    </span>

                    <span
                      className={
                        membro.ativo
                          ? "equipeStatusAtivo"
                          : "equipeStatusInativo"
                      }
                    >
                      {membro.ativo
                        ? "Ativo"
                        : "Oculto"}
                    </span>
                  </div>

                  <h3>{membro.nome}</h3>

                  <strong>
                    {membro.cargo}
                  </strong>

                  <p>
                    {membro.bio ||
                      "Sem biografia cadastrada."}
                  </p>

                  <div className="equipeAdminAcoes">
                    <button
                      type="button"
                      onClick={() =>
                        abrirEdicao(membro)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        alternarAtivo(membro)
                      }
                    >
                      {membro.ativo
                        ? "Ocultar"
                        : "Ativar"}
                    </button>

                    <button
                      type="button"
                      className="equipeExcluir"
                      onClick={() =>
                        excluirMembro(membro)
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="painelDashboard">
      <div className="painelCabecalho">
        <div>
          <p className="painelSubtitulo">
            PESSOAS
          </p>

          <h1>Equipe</h1>

          <p>
            Gerencie a Diretoria e os
            Professores Orientadores exibidos
            no site da LASPOERJ.
          </p>
        </div>

        <button
          type="button"
          className="painelBotaoSecundario"
          onClick={carregarEquipe}
        >
          Atualizar
        </button>
      </div>

      {mensagem && (
        <div className="painelMensagem">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="painelEstadoVazio">
          Carregando equipe...
        </div>
      ) : (
        <>
          {renderizarGrupo(
            "Diretoria LASPOERJ",
            "diretoria",
            diretoria
          )}

          {renderizarGrupo(
            "Professores Orientadores",
            "orientador",
            orientadores
          )}
        </>
      )}

      {formularioAberto && (
        <div
          className="usuarioModalOverlay"
          onClick={fecharFormulario}
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
                  {editando
                    ? "EDITAR MEMBRO"
                    : "NOVO MEMBRO"}
                </p>

                <h2>
                  {editando
                    ? editando.nome
                    : formulario.grupo ===
                      "diretoria"
                    ? "Nova pessoa da Diretoria"
                    : "Novo Orientador"}
                </h2>
              </div>

              <button
                type="button"
                className="eventoFechar"
                onClick={fecharFormulario}
              >
                ×
              </button>
            </div>

            <form
              className="equipeFormulario"
              onSubmit={salvarMembro}
            >
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
                  required
                />
              </label>

              <label>
                <span>Cargo</span>

                <input
                  type="text"
                  value={formulario.cargo}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      cargo: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span>Grupo</span>

                <select
                  value={formulario.grupo}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      grupo:
                        e.target
                          .value as GrupoEquipe,
                    })
                  }
                >
                  <option value="diretoria">
                    Diretoria
                  </option>

                  <option value="orientador">
                    Professor Orientador
                  </option>
                </select>
              </label>

              <label>
                <span>Ordem de exibição</span>

                <input
                  type="number"
                  min="1"
                  value={formulario.ordem}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      ordem: Number(
                        e.target.value
                      ),
                    })
                  }
                />
              </label>

              <div className="equipeUploadBox">
                <div>
                  <span className="equipeUploadTitulo">
                    Foto
                  </span>

                  <p>
                    Envie JPG, PNG ou outra imagem
                    aceita pelo navegador. Máximo de
                    5 MB.
                  </p>
                </div>

                {previewFoto && (
                  <div className="equipeUploadPreview">
                    <img
                      src={previewFoto}
                      alt="Prévia da foto"
                    />
                  </div>
                )}

                <label className="equipeUploadBotao">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={selecionarFoto}
                  />

                  <span>
                    {arquivoFoto
                      ? "Trocar imagem selecionada"
                      : "Escolher imagem"}
                  </span>
                </label>

                {arquivoFoto && (
                  <small>
                    Selecionada: {arquivoFoto.name}
                  </small>
                )}
              </div>

              <label>
                <span>
                  URL/caminho da foto
                </span>

                <input
                  type="text"
                  value={formulario.foto_url}
                  onChange={(e) => {
                    const valor =
                      e.target.value;

                    setFormulario({
                      ...formulario,
                      foto_url: valor,
                    });

                    if (!arquivoFoto) {
                      setPreviewFoto(valor);
                    }
                  }}
                  placeholder="Preenchido automaticamente após o upload"
                />

                <small>
                  Você ainda pode usar uma URL
                  pública ou um caminho da pasta
                  public manualmente.
                </small>
              </label>

              <label>
                <span>Biografia</span>

                <textarea
                  rows={5}
                  value={formulario.bio}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      bio: e.target.value,
                    })
                  }
                />
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
                    Exibir no site
                  </strong>

                  <span>
                    Quando desativado, o membro
                    permanece cadastrado no painel,
                    mas não aparece na Home.
                  </span>
                </div>
              </label>

              <div className="usuarioModalAcoes">
                <button
                  type="button"
                  className="painelBotaoSecundario"
                  onClick={fecharFormulario}
                  disabled={
                    salvando || enviandoFoto
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="painelBotaoPrincipal"
                  disabled={
                    salvando || enviandoFoto
                  }
                >
                  {enviandoFoto
                    ? "Enviando foto..."
                    : salvando
                    ? "Salvando..."
                    : editando
                    ? "Salvar alterações"
                    : "Adicionar membro"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}