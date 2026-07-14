import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  async function carregarUsuario() {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsuario(null);
      setCarregandoUsuario(false);
      return;
    }

    try {
      setCarregandoUsuario(true);

      const response = await api.get("/user/me");

      setUsuario(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar usuário:",
        error.response?.data ?? error.message
      );

      localStorage.removeItem("token");
      setUsuario(null);
    } finally {
      setCarregandoUsuario(false);
    }
  }

  useEffect(() => {
    carregarUsuario();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        carregandoUsuario,
        carregarUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return contexto;
}