import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { usuario, logout } = useAuth();
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEstatisticas() {
      try {
        const response = await api.get(
          "/estatistica/listar-dados"
        );

        console.log("Resposta da API:", response.data);

        setEstatisticas(response.data);
      } catch (error) {
        console.error("Erro completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Resposta:", error.response?.data);

        if (error.response?.status === 401) {
          setErro("Você precisa fazer login.");
        } else if (error.response?.status === 403) {
          setErro("Seu usuário não possui permissão.");
        } else {
          setErro("Não foi possível carregar as estatísticas.");
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarEstatisticas();
  }, []);

  if (carregando) {
    return <p>Carregando...</p>;
  }

  if (erro) {
    return <p>{erro}</p>;
  }

  if (!estatisticas) {
    return <p>Nenhuma estatística encontrada.</p>;
  }

  return (
    <main>
      <h1>Bem Vindo, <span className="user">{usuario?.nome ?? "Carregando..."}</span></h1>

      <p>Alunos ativos: {estatisticas.alunosAtivos}</p>

      <p>
        Matrículas: {estatisticas.quantidadeMatriculas}
      </p>

      <p>
        Faturamento:{" "}
        {Number(estatisticas.faturamento).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>
    </main>
  );
}

export default Dashboard;