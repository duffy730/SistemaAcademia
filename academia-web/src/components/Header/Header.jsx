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
    "/nutri": {
        titulo: "Nutricionista Virtual",
        descricao: "Gerencie a saúde dos usuários do sistema"
    },
    "/usuarios": {
        titulo: "Usuários",
        descricao: "Gerencie os usuários do sistema"
    },
    "/config": {
      titulo: "Configurações",
    }
  };

  const paginaAtual =
    paginas[location.pathname] ??
    {
        titulo: "GymPilot",
        descricao: ""
    };

  return (
    <header className="dashboard-header">
      <div>
        <h2>{paginaAtual.titulo}</h2>
      </div>
    </header>
  );
}

export default Header;