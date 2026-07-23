import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import "./UsuarioModal.css";

/*
 * Os números devem corresponder ao enum Roles da API:
 *
 * Admin = 1
 * Recep = 2
 * Nutri = 3
 * Aluno = 4
 */
const PERFIS = [
  {
    valor: "Admin",
    texto: "Administrador",
    role: 1,
  },
  {
    valor: "Recep",
    texto: "Recepcionista",
    role: 2,
  },
  {
    valor: "Nutri",
    texto: "Nutricionista",
    role: 3,
  },
  {
    valor: "Aluno",
    texto: "Aluno",
    role: 4,
  },
];

const ROLE_POR_PERFIL = {
  Admin: 1,
  Recep: 2,
  Nutri: 3,
  Aluno: 4,
};

const FORMULARIO_INICIAL = {
  nome: "",
  email: "",
  perfil: "Recep",
  ativo: true,
  senha: "",
  confirmarSenha: "",
};

function normalizarPerfil(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  if (typeof valor === "number") {
    const perfilEncontrado = PERFIS.find(
      (perfil) => perfil.role === valor
    );

    return perfilEncontrado?.valor ?? "";
  }

  const texto = String(valor)
    .trim()
    .toLowerCase();

  const perfisConhecidos = {
    "1": "Admin",
    admin: "Admin",
    administrador: "Admin",

    "2": "Recep",
    recep: "Recep",
    recepcionista: "Recep",

    "3": "Nutri",
    nutri: "Nutri",
    nutricionista: "Nutri",

    "4": "Aluno",
    aluno: "Aluno",
  };

  return perfisConhecidos[texto] ?? "";
}

function obterEmailUsuario(usuario) {
  return (
    usuario?.email ??
    usuario?.usuario ??
    usuario?.username ??
    usuario?.nomeUsuario ??
    usuario?.login ??
    ""
  );
}

export default function UsuarioModal({
  usuario,
  modo,
  salvar,
  fechar,
  salvando,
}) {
  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL
  );

  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const editando = modo === "editar";

  useEffect(() => {
    setErro("");
    setMostrarSenha(false);

    if (!usuario) {
      setFormulario(FORMULARIO_INICIAL);
      return;
    }

    const perfilRecebido =
      usuario.perfil ??
      usuario.role ??
      usuario.funcao ??
      usuario.tipoUsuario;

    setFormulario({
      nome:
        usuario.nome ??
        usuario.name ??
        "",

      /*
       * Email e usuário agora são um único campo.
       */
      email: obterEmailUsuario(usuario),

      perfil:
        normalizarPerfil(perfilRecebido),

      ativo:
        usuario.ativo ??
        usuario.ativa ??
        usuario.active ??
        true,

      senha: "",
      confirmarSenha: "",
    });
  }, [usuario]);

  function alterarCampo(event) {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (erro) {
      setErro("");
    }
  }

  async function enviar(event) {
    event.preventDefault();
    setErro("");

    const nome = formulario.nome.trim();
    const email = formulario.email
      .trim()
      .toLowerCase();

    const perfil = formulario.perfil;
    const senha = formulario.senha;
    const confirmarSenha =
      formulario.confirmarSenha;

    if (!nome) {
      setErro("Informe o nome do usuário.");
      return;
    }

    if (!email) {
      setErro("Informe o email.");
      return;
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );

    if (!emailValido) {
      setErro("Informe um email válido.");
      return;
    }

    const role =
      ROLE_POR_PERFIL[perfil];

    if (!role) {
      setErro(
        "Selecione um perfil válido."
      );
      return;
    }

    if (!editando && !senha) {
      setErro("Informe uma senha.");
      return;
    }

    if (senha && senha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro(
        "As senhas não coincidem."
      );
      return;
    }

    const dados = {
      nome,

      /*
       * A API ainda espera os dois campos,
       * então os dois recebem o email.
       */
      usuario: email,
      email,

      role,
      ativo: Boolean(formulario.ativo),
    };

    /*
     * Na edição, a senha não é enviada
     * quando o campo estiver vazio.
     */
    if (senha) {
      dados.senha = senha;
    }

    console.log(
      "Usuário enviado:",
      dados
    );

    try {
      await salvar(dados);
    } catch (error) {
      console.error(
        "Erro ao salvar usuário:",
        error.response?.data ?? error
      );

      const errosValidacao =
        error.response?.data?.errors;

      const primeiraMensagem =
        errosValidacao
          ? Object.values(errosValidacao)
              .flat()
              .find(Boolean)
          : null;

      setErro(
        primeiraMensagem ||
          error.response?.data?.mensagem ||
          error.message ||
          "Não foi possível salvar o usuário."
      );
    }
  }

  return (
    <div
      className="usuario-modal-overlay"
      onMouseDown={fechar}
    >
      <div
        className="usuario-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="usuario-modal-header">
          <div>
            <span className="usuario-modal-heading-icon">
              <UserRound size={21} />
            </span>

            <div>
              <h2>
                {editando
                  ? "Editar usuário"
                  : "Novo usuário"}
              </h2>

              <p>
                {editando
                  ? "Atualize os dados e permissões."
                  : "Cadastre uma nova pessoa com acesso ao sistema."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="usuario-modal-close"
            onClick={fechar}
            disabled={salvando}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={enviar}>
          <div className="usuario-modal-body">
            {erro && (
              <p className="usuario-modal-error">
                {erro}
              </p>
            )}

            <Campo
              label="Nome"
              icone={
                <UserRound size={18} />
              }
            >
              <input
                type="text"
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                placeholder="Ex.: Pedro Chair"
                autoComplete="name"
                disabled={salvando}
              />
            </Campo>

            <div className="usuario-modal-grid">
              <Campo
                label="Email de acesso"
                icone={<Mail size={18} />}
              >
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={alterarCampo}
                  placeholder="usuario@email.com"
                  autoComplete="email"
                  disabled={salvando}
                />
              </Campo>

              <Campo
                label="Perfil de acesso"
                icone={
                  <ShieldCheck size={18} />
                }
              >
                <select
                  name="perfil"
                  value={formulario.perfil}
                  onChange={alterarCampo}
                  disabled={salvando}
                >
                  <option
                    value=""
                    disabled
                  >
                    Selecione um perfil
                  </option>

                  {PERFIS.map((perfil) => (
                    <option
                      key={perfil.valor}
                      value={perfil.valor}
                    >
                      {perfil.texto}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="usuario-modal-grid">
              <Campo
                label={
                  editando
                    ? "Nova senha"
                    : "Senha"
                }
                icone={
                  <LockKeyhole size={18} />
                }
              >
                <input
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  name="senha"
                  value={formulario.senha}
                  onChange={alterarCampo}
                  placeholder={
                    editando
                      ? "Deixe vazio para manter"
                      : "Mínimo de 6 caracteres"
                  }
                  autoComplete={
                    editando
                      ? "new-password"
                      : "new-password"
                  }
                  disabled={salvando}
                />

                <button
                  type="button"
                  className="usuario-password-toggle"
                  onClick={() =>
                    setMostrarSenha(
                      (valorAtual) =>
                        !valorAtual
                    )
                  }
                  disabled={salvando}
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </Campo>

              <Campo
                label="Confirmar senha"
                icone={
                  <LockKeyhole size={18} />
                }
              >
                <input
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  name="confirmarSenha"
                  value={
                    formulario.confirmarSenha
                  }
                  onChange={alterarCampo}
                  placeholder={
                    editando
                      ? "Confirme apenas se alterar"
                      : "Digite a senha novamente"
                  }
                  autoComplete="new-password"
                  disabled={salvando}
                />
              </Campo>
            </div>
          </div>

          <footer className="usuario-modal-footer">
            <button
              type="button"
              className="usuario-modal-cancel"
              onClick={fechar}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="usuario-modal-save"
              disabled={salvando}
            >
              <Save size={17} />

              {salvando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar usuário"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  icone,
  children,
}) {
  return (
    <label className="usuario-modal-field">
      <span>{label}</span>

      <div>
        {icone}
        {children}
      </div>
    </label>
  );
}