import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { carregarUsuario } = useAuth();
    
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    async function entrar(event) {
  event.preventDefault();

  try {
    const response = await api.post("/usuarios/login", {
        usuario: email,
        senha
    });

    localStorage.setItem("token", response.data.token);

    await carregarUsuario();

    navigate("/dashboard");
  } catch (error) {
    console.error(
      "Erro no login:",
      error.response?.data ?? error.message
    );

    setErro("E-mail ou senha inválidos.");
  }
}

    return (
        <div className="login-container">

            <form className="login-box" onSubmit={entrar}>

                <h1>AcademiaPro</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

                {erro && <p className="erro">{erro}</p>}

                <button type="submit">
                    Entrar
                </button>

            </form>

        </div>
    );
}

export default Login;