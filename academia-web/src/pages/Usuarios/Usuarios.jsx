import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  UserX,
  X,
} from "lucide-react";

import api from "../../services/api";
import UsuarioModal from "../../components/UsuarioModal/UsuarioModal";
import "./Usuarios.css";

const ITENS_POR_PAGINA = 10;

// Confira estes caminhos no Swagger.
const ROTAS = {
  listar: "/user/listar",
  criar: "/usuarios/register",
  atualizar: (id) => `/user/atualizar-user/${id}`,
  remover: (id) => `/user/remover-user/${id}`,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome-asc");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(null);
  const [usuarioExcluir, setUsuarioExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");
      const response = await api.get(ROTAS.listar);
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao listar usuários:", error.response?.data ?? error.message);
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, perfil, status, ordenacao]);

  const perfis = useMemo(
    () => [...new Set(usuarios.map(obterPerfil).filter(Boolean))].sort(),
    [usuarios]
  );

  const ROLES = {
  Administrador: 1,
  Admin: 1,
  Recepcionista: 2,
  Recep: 2,
  Nutri: 3,
  Nutricionista: 3,
  Aluno: 4,
};

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    const resultado = usuarios.filter((usuario) => {
      const perfilUsuario = obterPerfil(usuario);
      const ativo = obterAtivo(usuario);
      const texto = normalizar([
        obterLogin(usuario),
        obterNome(usuario),
        obterEmail(usuario),
        perfilUsuario,
      ].join(" "));

      return (
        (!termo || texto.includes(termo)) &&
        (perfil === "todos" || normalizar(perfilUsuario) === normalizar(perfil)) &&
        (status === "todos" ||
          (status === "ativos" && ativo) ||
          (status === "inativos" && !ativo))
      );
    });

    return [...resultado].sort((a, b) => {
      const nomeA = normalizar(obterNome(a));
      const nomeB = normalizar(obterNome(b));
      const loginA = normalizar(obterLogin(a));
      const loginB = normalizar(obterLogin(b));

      if (ordenacao === "nome-desc") return nomeB.localeCompare(nomeA);
      if (ordenacao === "login-asc") return loginA.localeCompare(loginB);
      if (ordenacao === "login-desc") return loginB.localeCompare(loginA);
      return nomeA.localeCompare(nomeB);
    });
  }, [usuarios, busca, perfil, status, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginados = filtrados.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA);

  const cards = useMemo(() => {
    const administradores = usuarios.filter((u) => normalizar(obterPerfil(u)).includes("admin")).length;
    const funcionarios = usuarios.filter((u) => {
      const p = normalizar(obterPerfil(u));
      return p.includes("funcion") || p.includes("recepcion") || p.includes("professor");
    }).length;
    const clientes = usuarios.filter((u) => {
      const p = normalizar(obterPerfil(u));
      return p.includes("cliente") || p.includes("aluno");
    }).length;

    return { total: usuarios.length, administradores, funcionarios, clientes };
  }, [usuarios]);

  async function salvarUsuario(dados) {
    try {
      setSalvando(true);
      setErro("");

      if (modal?.modo === "editar") {
        await api.put(ROTAS.atualizar(modal.usuario.id), dados);
      } else {
        await api.post(ROTAS.criar, dados);
      }

      await carregarUsuarios();
      setModal(null);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error.response?.data ?? error.message);
      throw new Error(obterMensagem(error) || "Não foi possível salvar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(usuario) {
    try {
      setErro("");
      setMenuAberto(null);

      if (obterAtivo(usuario)) {
        await api.patch(ROTAS.desativar(usuario.id));
      } else {
        await api.patch(ROTAS.ativar(usuario.id));
      }

      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao alterar status:", error.response?.data ?? error.message);
      setErro(obterMensagem(error) || "Não foi possível alterar o status.");
    }
  }

  async function confirmarExclusao() {
    if (!usuarioExcluir) return;

    try {
      setExcluindo(true);
      await api.delete(ROTAS.remover(usuarioExcluir.id));
      setUsuarioExcluir(null);
      await carregarUsuarios();
    } catch (error) {
      setErro(obterMensagem(error) || "Não foi possível excluir o usuário.");
    } finally {
      setExcluindo(false);
    }
  }

  function exportarCSV() {
    if (!filtrados.length) return;

    const linhas = filtrados.map((usuario) => [
      usuario.id,
      obterLogin(usuario),
      obterNome(usuario),
      obterEmail(usuario),
      obterPerfil(usuario),
      obterAtivo(usuario) ? "Ativo" : "Inativo",
      formatarData(usuario),
    ]);

    const conteudo = [["ID", "Usuário", "Nome", "Email", "Perfil", "Status", "Cadastro"], ...linhas]
      .map((linha) => linha.map((item) => `"${String(item ?? "").replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const url = URL.createObjectURL(new Blob([`\uFEFF${conteudo}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "usuarios.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const primeiro = filtrados.length ? (pagina - 1) * ITENS_POR_PAGINA + 1 : 0;
  const ultimo = Math.min(pagina * ITENS_POR_PAGINA, filtrados.length);

  return (
    <section className="usuarios-page">
      <header className="usuarios-page-header">
        <div>
          <h1>Usuários</h1>
          <p>Gerencie os usuários que têm acesso ao sistema.</p>
        </div>

        <div className="usuarios-page-buttons">
          <button className="usuarios-primary-button" onClick={() => setModal({ modo: "criar", usuario: null })}>
            <Plus size={19} /> Novo usuário
          </button>
          <button className="usuarios-secondary-button" onClick={exportarCSV} disabled={!filtrados.length}>
            <Download size={18} /> Exportar <ChevronDown size={15} />
          </button>
        </div>
      </header>

      <div className="usuarios-stats-grid">
        <StatCard titulo="Total de usuários" valor={cards.total} tipo="green" icone={<UsersRound size={25} />} />
        <StatCard titulo="Administradores" valor={cards.administradores} tipo="blue" icone={<ShieldCheck size={25} />} />
        <StatCard titulo="Funcionários" valor={cards.funcionarios} tipo="purple" icone={<UserRound size={25} />} />
        <StatCard titulo="Clientes (acesso)" valor={cards.clientes} tipo="orange" icone={<UserRound size={25} />} />
      </div>

      <div className="usuarios-panel">
        <div className="usuarios-filters">
          <div className="usuarios-search">
            <Search size={19} />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, email ou usuário..." />
          </div>

          <div className="usuarios-filter-actions">
            <button className={`usuarios-filter-button ${filtrosAbertos ? "active" : ""}`} onClick={() => setFiltrosAbertos(!filtrosAbertos)}>
              <Filter size={17} /> Filtros
            </button>
          </div>
        </div>

        {filtrosAbertos && (
          <div className="usuarios-extra-filters">
            <label>
              <span>Ordenar por</span>
              <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="nome-asc">Nome (A-Z)</option>
                <option value="nome-desc">Nome (Z-A)</option>
                <option value="login-asc">Usuário (A-Z)</option>
                <option value="login-desc">Usuário (Z-A)</option>
              </select>
            </label>
            <button onClick={() => { setBusca(""); setPerfil("todos"); setStatus("todos"); setOrdenacao("nome-asc"); }}>
              <X size={16} /> Limpar filtros
            </button>
          </div>
        )}

        {erro && <p className="usuarios-error">{erro}</p>}

        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan="7" className="usuarios-empty">Carregando usuários...</td></tr>
              ) : !paginados.length ? (
                <tr><td colSpan="7" className="usuarios-empty">Nenhum usuário encontrado.</td></tr>
              ) : (
                paginados.map((usuario, index) => {
                  const ativo = obterAtivo(usuario);
                  const perfilUsuario = obterPerfil(usuario);

                  return (
                    <tr key={usuario.id}>
                      <td>
                        <div className="usuario-login">
                          <span className={`usuario-avatar avatar-${index % 6}`}>{iniciais(obterNome(usuario))}</span>
                          <strong>{obterNome(usuario)}</strong>
                        </div>
                      </td>
                      <td>{obterLogin(usuario)}</td>
                      <td><span className={`usuario-role ${classePerfil(perfilUsuario)}`}>{perfilUsuario}</span></td>
                      <td>
                        <div className="usuarios-row-actions">
                          <button 
                            title="Editar" 
                            onClick={() => 
                            setModal({ modo: "editar", usuario })}>
                            <Edit3 size={17} />
                          </button>
                          
                          <button 
                            className="danger" 
                            onClick={() => { setUsuarioExcluir(usuario); 
                            setMenuAberto(null); }}>
                            <Trash2 size={16} />
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="usuarios-pagination">
        <p>Mostrando {primeiro} a {ultimo} de {filtrados.length} usuários</p>
        <div className="pagination-controls">
          <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}><ChevronLeft size={18} /> Anterior</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(0, 5).map((numero) => (
            <button key={numero} className={pagina === numero ? "active" : ""} onClick={() => setPagina(numero)}>{numero}</button>
          ))}
          <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}>Próxima <ChevronRight size={18} /></button>
        </div>
      </footer>

      {modal && (
        <UsuarioModal
          usuario={modal.usuario}
          modo={modal.modo}
          perfis={perfis}
          salvando={salvando}
          fechar={() => !salvando && setModal(null)}
          salvar={salvarUsuario}
        />
      )}

      {usuarioExcluir && (
        <div className="usuario-delete-overlay" onMouseDown={() => !excluindo && setUsuarioExcluir(null)}>
          <div className="usuario-delete-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="usuario-delete-close" onClick={() => setUsuarioExcluir(null)}><X size={19} /></button>
            <div className="usuario-delete-icon"><Trash2 size={25} /></div>
            <h2>Excluir usuário?</h2>
            <p>Você está prestes a excluir <strong>{obterNome(usuarioExcluir)}</strong>. Essa ação não poderá ser desfeita.</p>
            <div className="usuario-delete-actions">
              <button className="cancel" onClick={() => setUsuarioExcluir(null)} disabled={excluindo}>Cancelar</button>
              <button className="confirm" onClick={confirmarExclusao} disabled={excluindo}><Trash2 size={17} /> {excluindo ? "Excluindo..." : "Excluir usuário"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({ titulo, valor, tipo, icone }) {
  return <article className="usuarios-stat-card"><div className={`usuarios-stat-icon ${tipo}`}>{icone}</div><div><span>{titulo}</span><strong>{valor}</strong><small>Dados atuais do sistema</small></div></article>;
}

function Select({ value, onChange, options }) {
  return <div className="usuarios-select-wrapper"><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select><ChevronDown size={16} /></div>;
}

function obterNome(u) { return u.nome || u.name || "Nome não informado"; }
function obterEmail(u) { return u.email || "Email não informado"; }
function obterLogin(u) { return u.usuario || u.username || u.nomeUsuario || u.login || u.email?.split("@")[0] || `usuario.${u.id}`; }
function obterPerfil(u) { return u.perfil || u.role || u.funcao || u.tipoUsuario || (Array.isArray(u.roles) ? u.roles[0] : null) || "Sem perfil"; }
function obterAtivo(u) { return u.ativo ?? u.ativa ?? u.active ?? true; }
function normalizar(v) { return String(v ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function iniciais(nome) { return String(nome).split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join(""); }
function classePerfil(perfil) { const p = normalizar(perfil); if (p.includes("admin")) return "admin"; if (p.includes("recepcion")) return "recepcionista"; if (p.includes("professor")) return "professor"; if (p.includes("funcion")) return "funcionario"; if (p.includes("cliente") || p.includes("aluno")) return "cliente"; return "padrao"; }
function formatarData(u) { const valor = u.dataCadastro || u.criadoEm || u.createdAt || u.dataCriacao; if (!valor) return "-"; const data = new Date(valor); return Number.isNaN(data.getTime()) ? "-" : data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function obterMensagem(error) { const dados = error.response?.data; return typeof dados === "string" ? dados : dados?.mensagem || dados?.message || ""; }
