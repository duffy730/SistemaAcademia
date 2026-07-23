import { NavLink, useNavigate } from "react-router-dom";
import { FaUser } from 'react-icons/fa'; 
import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";

import iconPeso from '../../assets/icons/peso.png'
import iconHome from '../../assets/icons/home.png'
import iconAlunos from '../../assets/icons/alunos.png'
import iconPlanos from '../../assets/icons/planos.png'
import iconProdutos from '../../assets/icons/produtos.png'
import iconMatriculas from '../../assets/icons/matriculas.png'
import iconPagamentos from '../../assets/icons/pagamentos.png'
import iconUser from '../../assets/icons/usuario.png'
import iconConfig from '../../assets/icons/config.png'
import iconNutri from '../../assets/icons/plant.png'

function Sidebar() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function sair() {
      logout();
      navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img className="sidebar-logo-icon" src={iconPeso} alt="icon" />
        <h1 className="sidebar-logo-title">Gym<span className="sidebar-logo-title-pro">Pilot</span></h1>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section">GERAL</span>

        <NavLink to="/dashboard" className="sections">
          <img className="icon" src={iconHome} alt="icon" />
          Dashboard
        </NavLink>

        <span className="sidebar-section">CADASTROS</span>

        <NavLink to="/alunos" className="sections">
          <img className="icon" src={iconAlunos} alt="icon" />
          Alunos
        </NavLink>

        <NavLink to="/planos" className="sections">
          <img className="icon" src={iconPlanos} alt="icon" />
          Planos
        </NavLink>

        <NavLink to="/produtos" className="sections">
          <img className="icon" src={iconProdutos} alt="icon" />
          Produtos
        </NavLink>

        <NavLink to="/matriculas" className="sections">
          <img className="icon" src={iconMatriculas} alt="icon" />
          Matrículas
        </NavLink>

        <NavLink to="/pagamentos" className="sections">
          <img className="icon" src={iconPagamentos} alt="icon" />
          Pagamentos
        </NavLink>

        <NavLink to="/nutri" className="sections">
          <img className="icon" src={iconNutri} alt="icon" />
          Nutri. Virtual
        </NavLink>

        <span className="sidebar-section">ADMINISTRAÇÃO</span>

        <NavLink to="/usuarios" className="sections">
          <img className="icon" src={iconUser} alt="icon" />
          Usuários
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <FaUser size={21}/>
          </div>
          <div>
            <strong>{usuario?.nome ?? "Carregando..."}</strong>
            <small>{usuario?.role ?? ""}</small>
          </div>
        </div>

        <button type="button" onClick={sair}>
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;