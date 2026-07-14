import "./Header.css";
import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const paginas = {
    "/dashboard": {
        titulo: "Dashboard",
        descricao: "Visão geral da academia"
    },
    "/alunos": {
        titulo: "Alunos",
        descricao: "Gerencie os alunos cadastrados"
    },
    "/planos": {
        titulo: "Planos",
        descricao: "Gerencie os planos da academia"
    },
    "/produtos": {
        titulo: "Produtos",
        descricao: "Controle os produtos disponíveis"
    },
    "/matriculas": {
        titulo: "Matrículas",
        descricao: "Gerencie as matrículas"
    },
    "/pagamentos": {
        titulo: "Pagamentos",
        descricao: "Controle os pagamentos"
    },
    "/usuarios": {
        titulo: "Usuários",
        descricao: "Gerencie os usuários do sistema"
    }
  };

  const paginaAtual =
    paginas[location.pathname] ??
    {
        titulo: "AcademiaPro",
        descricao: ""
    };

  return (
    <header className="dashboard-header">
      <div>
        <h2>{paginaAtual.titulo}</h2>
      </div>

      <div className="header-search">
        <input
          type="search"
          placeholder="Buscar aluno, plano ou produto..."
        />
      </div>

      <div className="header-notification">
        <button type="button" className="notification-button">
          🔔
        </button>
      </div>
    </header>
  );
}

export default Header;