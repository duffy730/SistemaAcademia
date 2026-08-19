import { NavLink, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";

import iconPeso from "../../assets/icons/icon.png";
import iconHome from "../../assets/icons/home.png";
import iconAlunos from "../../assets/icons/alunos.png";
import iconPlanos from "../../assets/icons/planos.png";
import iconProdutos from "../../assets/icons/produtos.png";
import iconMatriculas from "../../assets/icons/matriculas.png";
import iconPagamentos from "../../assets/icons/pagamentos.png";
import iconUser from "../../assets/icons/usuario.png";
import iconNutri from "../../assets/icons/plant.png";
import iconTreino from "../../assets/icons/peso.png";

function Sidebar() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function sair() {
    logout();
    navigate("/");
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img
            className="sidebar-logo-icon"
            src={iconPeso}
            alt="Logo GymPilot"
          />

          <h1 className="sidebar-logo-title">
            Gym
            <span className="sidebar-logo-title-pro">Pilot</span>
          </h1>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section desktop-only">GERAL</span>

          <NavLink to="/dashboard" className="sections desktop-only">
            <img className="icon" src={iconHome} alt="" />
            Dashboard
          </NavLink>

          <span className="sidebar-section desktop-only">
            CADASTROS
          </span>

          <NavLink to="/alunos" className="sections desktop-only">
            <img className="icon" src={iconAlunos} alt="" />
            Alunos
          </NavLink>

          <NavLink to="/planos" className="sections desktop-only">
            <img className="icon" src={iconPlanos} alt="" />
            Planos
          </NavLink>

          <NavLink to="/produtos" className="sections desktop-only">
            <img className="icon" src={iconProdutos} alt="" />
            Produtos
          </NavLink>

          <NavLink to="/matriculas" className="sections desktop-only">
            <img className="icon" src={iconMatriculas} alt="" />
            Matrículas
          </NavLink>

          <NavLink to="/pagamentos" className="sections desktop-only">
            <img className="icon" src={iconPagamentos} alt="" />
            Pagamentos
          </NavLink>

          <NavLink to="/treinos" className="sections">
            <img className="icon" src={iconTreino} alt="" />
            Treinos
          </NavLink>

          <NavLink to="/nutri" className="sections">
            <img className="icon" src={iconNutri} alt="" />
            Nutri. Virtual
          </NavLink>

          <span className="sidebar-section desktop-only">
            ADMINISTRAÇÃO
          </span>

          <NavLink to="/usuarios" className="sections desktop-only">
            <img className="icon" src={iconUser} alt="" />
            Usuários
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <FaUser className="avatar-user-icon" />
            </div>

            <div>
              <strong>{usuario?.nome ?? "Carregando..."}</strong>
              <small>{usuario?.role ?? ""}</small>
            </div>
          </div>

          <button className="sidebar-logout" type="button" onClick={sair}>
            Sair
          </button>
        </div>
      </aside>

      <nav className="mobile-bottom-menu">
        <NavLink
          to="/treinos"
          className={({ isActive }) =>
            `mobile-menu-item ${isActive ? "active" : ""}`
          }
        >
          <img src={iconTreino} alt="" />
          <span>Treino</span>
        </NavLink>

        <NavLink
          to="/nutri"
          className={({ isActive }) =>
            `mobile-menu-item ${isActive ? "active" : ""}`
          }
        >
          <img src={iconNutri} alt="" />
          <span>Nutrição</span>
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `mobile-menu-item ${isActive ? "active" : ""}`
          }
        >
          <FaUser className="mobile-menu-react-icon" />
          <span>Perfil</span>
        </NavLink>
      </nav>
    </>
  );
}

export default Sidebar;