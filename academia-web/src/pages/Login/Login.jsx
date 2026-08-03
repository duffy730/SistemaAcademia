import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Icone from "../../assets/icons/icon.png";

import api from "../../services/api";
import "./Login.css";

const ROTAS = {
  login: "/usuarios/login",
};

const RECURSOS = [
  {
    titulo: "Controle Centralizado",
    texto: "Gerencie equipe, alunos e operações com praticidade.",
    icone: UsersRound,
  },
  {
    titulo: "Visão de Desempenho",
    texto: "Acompanhe métricas e crescimento em tempo real.",
    icone: BarChart3,
  },
  {
    titulo: "Agenda Inteligente",
    texto: "Organize aulas, sessões e recursos com eficiência.",
    icone: CalendarDays,
  },
  {
    titulo: "Seguro e Confiável",
    texto: "Segurança profissional para proteger seus dados.",
    icone: ShieldCheck,
  },
];

function obterMensagemErro(error) {
  const dados = error?.response?.data;

  if (typeof dados === "string") {
    return dados;
  }

  return (
    dados?.mensagem ??
    dados?.message ??
    dados?.erro ??
    "Não foi possível entrar. Verifique seus dados."
  );
}

function obterToken(dados) {
  return (
    dados?.token ??
    dados?.accessToken ??
    dados?.dados?.token ??
    dados?.dados?.accessToken ??
    ""
  );
}

function obterUsuario(dados) {
  return (
    dados?.usuario ??
    dados?.user ??
    dados?.dados?.usuario ??
    dados?.dados?.user ??
    null
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    usuario: "",
    senha: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarUsuario, setLembrarUsuario] = useState(true);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const usuarioLembrado = localStorage.getItem("loginLembrado");

    if (usuarioLembrado) {
      setFormulario((atual) => ({
        ...atual,
        usuario: usuarioLembrado,
      }));
    }
  }, []);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));

    if (erro) {
      setErro("");
    }
  }

  async function entrar(event) {
    event.preventDefault();

    const usuario = formulario.usuario.trim();
    const senha = formulario.senha;

    if (!usuario || !senha) {
      setErro("Preencha o usuário e a senha.");
      return;
    }

    try {
      setEntrando(true);
      setErro("");

      const response = await api.post(ROTAS.login, {
        usuario,
        senha,
      });

      const token = obterToken(response.data);
      const usuarioLogado = obterUsuario(response.data);

      if (!token) {
        throw new Error("A API não retornou um token de acesso.");
      }

      localStorage.setItem("token", token);

      if (usuarioLogado) {
        localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioLogado)
        );
      }

      if (lembrarUsuario) {
        localStorage.setItem("loginLembrado", usuario);
      } else {
        localStorage.removeItem("loginLembrado");
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erro ao entrar:",
        error?.response?.data ?? error
      );

      setErro(
        error?.response
          ? obterMensagemErro(error)
          : error?.message || "Não foi possível conectar com a API."
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-presentation">
        <div className="login-brand">

          <div>
            <strong>GymPilot</strong>
            <span>Gestão de academia</span>
          </div>
        </div>

        <div className="login-presentation-content">
          <span className="login-admin-badge">
            Acesso administrativo
          </span>

          <h1>Gerencie. Acompanhe. Evolua.</h1>

          <p>
            Uma plataforma completa para gerenciar operações,
            equipe, alunos, agenda e desempenho em um só lugar.
          </p>

          <div className="login-features">
            {RECURSOS.map(({ titulo, texto, icone: Icone }) => (
              <article key={titulo}>
                <span>
                  <Icone size={22} />
                </span>

                <div>
                  <strong>{titulo}</strong>
                  <p>{texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className="login-presentation-footer">
          <ShieldCheck size={18} />
          <span>
            Ambiente restrito a administradores e funcionários autorizados.
          </span>
        </footer>

        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />
        <div className="login-dots" />
      </section>

      <section className="login-access">
        <div className="login-card">
          <div className="login-card-icon">
            <img className="icon" src={Icone} alt="icon" />
          </div>

          <header>
            <h2>Bem-vindo de volta</h2>
            <p>Entre na sua conta administrativa</p>
          </header>

          <form onSubmit={entrar}>
            <label className="login-field">
              <span>E-mail ou usuário</span>

              <div>
                <UserRound size={19} />

                <input
                  type="text"
                  name="usuario"
                  value={formulario.usuario}
                  onChange={alterarCampo}
                  placeholder="Digite seu e-mail ou usuário"
                  autoComplete="username"
                  disabled={entrando}
                />
              </div>
            </label>

            <label className="login-field">
              <span>Senha</span>

              <div>
                <LockKeyhole size={19} />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={formulario.senha}
                  onChange={alterarCampo}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  disabled={entrando}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  aria-label={
                    mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                  }
                  disabled={entrando}
                >
                  {mostrarSenha ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={lembrarUsuario}
                  onChange={(event) =>
                    setLembrarUsuario(event.target.checked)
                  }
                  disabled={entrando}
                />

                <span>
                  <Check size={14} />
                </span>

                Lembrar de mim
              </label>

              <button
                type="button"
                className="login-forgot"
                onClick={() =>
                  setErro(
                    "A recuperação de senha ainda não foi configurada."
                  )
                }
              >
                Esqueceu a senha?
              </button>
            </div>

            {erro && (
              <div className="login-error" role="alert">
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={entrando}
            >
              {entrando ? "Entrando..." : "Entrar"}
              {!entrando && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-divider">
            <span />
            <small>Acesso seguro</small>
            <span />
          </div>

          <div className="login-security">
            <LockKeyhole size={16} />
            <span>
              Suas credenciais são enviadas de forma protegida.
            </span>
          </div>
        </div>

        <footer className="login-access-footer">
          <span>© 2026 GymPilot. Todos os direitos reservados.</span>
          <span>Ambiente administrativo</span>
        </footer>
      </section>
    </main>
  );
}