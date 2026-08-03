import { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    role: "",
  });

  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setFormulario({
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      role: usuario?.role ?? "",
    });
  }, [usuario]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));
  }

  function salvarAlteracoes(event) {
    event.preventDefault();

    // Aqui você poderá chamar a API futuramente.
    console.log("Dados atualizados:", formulario);

    setEditando(false);
  }

  function sair() {
    logout();
    navigate("/");
  }

  return (
    <main className="perfil-page">
      <header className="perfil-header">
        <div>
          <span className="perfil-subtitle">MINHA CONTA</span>
          <h1>Perfil</h1>
          <p>Visualize e atualize suas informações pessoais.</p>
        </div>
      </header>

      <section className="perfil-card">
        <div className="perfil-user-info">
          <div className="perfil-avatar">
            <FaUser />
          </div>

          <div>
            <h2>{usuario?.nome ?? "Usuário"}</h2>
            <span>{usuario?.role ?? "Aluno"}</span>
          </div>
        </div>

        <button type="button" className="perfil-logout" onClick={sair}>
            <FaSignOutAlt />
            Sair da conta
        </button>
      </section>

      
    </main>
  );
}

export default Perfil;