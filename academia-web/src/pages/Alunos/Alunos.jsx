import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Alunos.css";
import AlunoModal from "../../components/AlunoModal/AlunoModal";

function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  
    async function carregarAlunos() {
        try {
            setCarregando(true);
            setErro("");

            const response = await api.get("/alunos/listar");

            setAlunos(response.data);
        } catch (error) {
            console.error(
            "Erro ao carregar alunos:",
            error.response?.data ?? error.message
            );

            setErro("Não foi possível carregar os alunos.");
        } finally {
            setCarregando(false);
        }
    }

    function editarAluno(aluno) {
        setAlunoSelecionado(aluno);
        setModalAberto(true);
    }

    useEffect(() => {
    carregarAlunos();
    }, []);

    if (carregando) {
        return <p>Carregando alunos...</p>;
    }

    if (erro) {
        return <p className="alunos-erro">{erro}</p>;
    }

    return (
        <section className="alunos-page">
            <div className="alunos-actions">
                <div>
                <h2>Alunos cadastrados</h2>
                <p>{alunos.length} alunos encontrados</p>
                </div>

                <button type="button" onClick={() => setModalAberto(true)}>
                    + Novo aluno
                </button>
            </div>

            <div className="alunos-table-container">
                <table className="alunos-table">
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Peso</th>
                    <th>Altura</th>
                    <th>Nascimento</th>
                    <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {alunos.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="alunos-empty">
                        Nenhum aluno cadastrado.
                        </td>
                    </tr>
                    ) : (
                    alunos.map((aluno) => (
                        <tr key={aluno.id}>
                        <td>{aluno.id}</td>
                        <td>{aluno.nome}</td>
                        <td>{aluno.email}</td>
                        <td>{aluno.peso} kg</td>
                        <td>{aluno.altura} m</td>
                        <td>{formatarData(aluno.dataNascimento)}</td>
                        <td>
                            <div className="alunos-row-actions">
                            <button type="button" onClick={() => editarAluno(aluno)}>
                                Editar
                            </button>

                            <button type="button" className="danger">
                                Excluir
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>

            {modalAberto && (
                <AlunoModal
                    aluno={alunoSelecionado}
                    fechar={() => {
                    setModalAberto(false);
                    setAlunoSelecionado(null);
                    }}
                    aoSalvar={carregarAlunos}
                />
            )}
        </section>
    );
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

export default Alunos;