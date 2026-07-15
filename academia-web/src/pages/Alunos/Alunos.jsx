import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  MoreHorizontal,
  Plus,
  Ruler,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  Weight,
} from "lucide-react";

import api from "../../services/api";
import AlunoModal from "../../components/AlunoModal/AlunoModal";
import "./Alunos.css";

const ITENS_POR_PAGINA = 10;

function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [alunoParaExcluir, setAlunoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarAlunos() {
    try {
      setCarregando(true);
      setErro("");

      // Troque pela rota exata exibida no seu Swagger.
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

  useEffect(() => {
    carregarAlunos();
  }, []);

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return alunos;
    }

    return alunos.filter((aluno) => {
      return (
        aluno.nome?.toLowerCase().includes(termo) ||
        aluno.email?.toLowerCase().includes(termo) ||
        String(aluno.id).includes(termo)
      );
    });
  }, [alunos, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alunosFiltrados.length / ITENS_POR_PAGINA)
  );

  const alunosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;

    return alunosFiltrados.slice(inicio, fim);
  }, [alunosFiltrados, paginaAtual]);

  const estatisticas = useMemo(() => {
    if (alunos.length === 0) {
      return {
        total: 0,
        pesoMedio: 0,
        alturaMedia: 0,
        idadeMedia: 0,
      };
    }

    const pesoTotal = alunos.reduce(
      (total, aluno) => total + Number(aluno.peso || 0),
      0
    );

    const alturaTotal = alunos.reduce(
      (total, aluno) => total + Number(aluno.altura || 0),
      0
    );

    const idadeTotal = alunos.reduce(
      (total, aluno) =>
        total + calcularIdade(aluno.dataNascimento),
      0
    );

    return {
      total: alunos.length,
      pesoMedio: pesoTotal / alunos.length,
      alturaMedia: alturaTotal / alunos.length,
      idadeMedia: idadeTotal / alunos.length,
    };
  }, [alunos]);

  function abrirCadastro() {
    setAlunoSelecionado(null);
    setModalAberto(true);
  }

  function abrirEdicao(aluno) {
    setAlunoSelecionado(aluno);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setAlunoSelecionado(null);
  }

  function abrirModalExclusao(aluno) {
  setAlunoParaExcluir(aluno);
}

function fecharModalExclusao() {
  if (!excluindo) {
    setAlunoParaExcluir(null);
  }
}

async function confirmarExclusao() {
  if (!alunoParaExcluir) {
    return;
  }

  try {
    setExcluindo(true);
    setErro("");

    await api.delete(
      `/alunos/remover-aluno/${alunoParaExcluir.id}`
    );

    setAlunoParaExcluir(null);
    await carregarAlunos();
  } catch (error) {
    console.error(
      "Erro ao excluir aluno:",
      error.response?.data ?? error.message
    );

    setErro("Não foi possível excluir o aluno.");
  } finally {
    setExcluindo(false);
  }
}

  function alterarBusca(event) {
    setBusca(event.target.value);
    setPaginaAtual(1);
  }

  function mudarPagina(novaPagina) {
    if (novaPagina < 1 || novaPagina > totalPaginas) {
      return;
    }

    setPaginaAtual(novaPagina);
  }

  function exportarCSV() {
    if (alunosFiltrados.length === 0) {
      return;
    }

    const cabecalho = [
      "ID",
      "Nome",
      "Email",
      "Peso",
      "Altura",
      "Data de nascimento",
    ];

    const linhas = alunosFiltrados.map((aluno) => [
      aluno.id,
      aluno.nome,
      aluno.email,
      aluno.peso,
      aluno.altura,
      formatarData(aluno.dataNascimento),
    ]);

    const conteudo = [cabecalho, ...linhas]
      .map((linha) =>
        linha
          .map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`)
          .join(";")
      )
      .join("\n");

    const arquivo = new Blob([`\uFEFF${conteudo}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "alunos.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const primeiroItem =
    alunosFiltrados.length === 0
      ? 0
      : (paginaAtual - 1) * ITENS_POR_PAGINA + 1;

  const ultimoItem = Math.min(
    paginaAtual * ITENS_POR_PAGINA,
    alunosFiltrados.length
  );

  return (
    <section className="alunos-page">
      <div className="alunos-page-header">
        <div>
          <h1>Alunos</h1>
          <p>Gerencie os alunos cadastrados na academia.</p>
        </div>

        <div className="alunos-page-buttons">
          <button
            type="button"
            className="alunos-primary-button"
            onClick={abrirCadastro}
          >
            <Plus size={19} />
            Novo aluno
          </button>

          <button
            type="button"
            className="alunos-secondary-button"
            onClick={exportarCSV}
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      <div className="alunos-stats-grid">
        <StatCard
          titulo="Total de alunos"
          valor={estatisticas.total}
          texto="Alunos cadastrados"
          tipo="green"
          icone={<UsersRound size={25} />}
        />

        <StatCard
          titulo="Peso médio"
          valor={`${estatisticas.pesoMedio.toFixed(1)} kg`}
          texto="Média dos alunos"
          tipo="blue"
          icone={<Weight size={25} />}
        />

        <StatCard
          titulo="Altura média"
          valor={`${estatisticas.alturaMedia.toFixed(2)} m`}
          texto="Média dos alunos"
          tipo="orange"
          icone={<Ruler size={25} />}
        />

        <StatCard
          titulo="Idade média"
          valor={`${Math.round(estatisticas.idadeMedia)} anos`}
          texto="Média dos alunos"
          tipo="purple"
          icone={<UserRound size={25} />}
        />
      </div>

      <div className="alunos-panel">
        <div className="alunos-filters">
          <div className="alunos-search">
            <Search size={19} />

            <input
              type="search"
              value={busca}
              onChange={alterarBusca}
              placeholder="Buscar aluno por nome, e-mail..."
            />
          </div>

          <div className="alunos-filter-results">
            {alunosFiltrados.length} resultado(s)
          </div>
        </div>

        {erro && <p className="alunos-error">{erro}</p>}

        <div className="alunos-table-wrapper">
          <table className="alunos-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>E-mail</th>
                <th>Peso</th>
                <th>Altura</th>
                <th>Data de nascimento</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="6" className="alunos-empty">
                    Carregando alunos...
                  </td>
                </tr>
              ) : alunosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="alunos-empty">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                alunosPaginados.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>
                      <div className="aluno-profile">
                        <div className="aluno-avatar">
                          {obterIniciais(aluno.nome)}
                        </div>

                        <div>
                          <strong>{aluno.nome}</strong>
                        </div>
                      </div>
                    </td>

                    <td>{aluno.email}</td>
                    <td>{Number(aluno.peso).toFixed(1)} kg</td>
                    <td>{Number(aluno.altura).toFixed(2)} m</td>
                    <td>{formatarData(aluno.dataNascimento)}</td>

                    <td>
                      <div className="alunos-row-actions">

                        <button
                          type="button"
                          title="Editar"
                          onClick={() => abrirEdicao(aluno)}
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                            className="danger"
                            onClick={() => abrirModalExclusao(aluno)}
                            title="Excluir aluno"
                            >
                            <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="alunos-pagination">
        <p>
          Mostrando {primeiroItem} a {ultimoItem} de{" "}
          {alunosFiltrados.length} alunos
        </p>

        <div className="pagination-controls">
          <button
            type="button"
            disabled={paginaAtual === 1}
            onClick={() => mudarPagina(paginaAtual - 1)}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          {gerarPaginas(paginaAtual, totalPaginas).map(
            (pagina, index) =>
              pagina === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="pagination-ellipsis"
                >
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={pagina}
                  className={
                    paginaAtual === pagina ? "active" : ""
                  }
                  onClick={() => mudarPagina(pagina)}
                >
                  {pagina}
                </button>
              )
          )}

          <button
            type="button"
            disabled={paginaAtual === totalPaginas}
            onClick={() => mudarPagina(paginaAtual + 1)}
          >
            Próxima
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {modalAberto && (
        <AlunoModal
          aluno={alunoSelecionado}
          fechar={fecharModal}
          aoSalvar={carregarAlunos}
        />
      )}

    {alunoParaExcluir && (
        <div
            className="modal-exclusao-overlay"
            onMouseDown={fecharModalExclusao}
        >
            <div
            className="modal-exclusao"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-exclusao"
            onMouseDown={(evento) => evento.stopPropagation()}
            >
            <button
                type="button"
                className="modal-exclusao-fechar"
                onClick={fecharModalExclusao}
                aria-label="Fechar"
            >
                ×
            </button>

            <div className="modal-exclusao-icone">
                <Trash2 size={30} />
            </div>

            <h2 id="titulo-modal-exclusao">Excluir aluno?</h2>

            <p>
                Você está prestes a excluir{" "}
                <strong>{alunoParaExcluir.nome}</strong>. Essa ação não poderá ser
                desfeita.
            </p>

            <div className="modal-exclusao-acoes">
                <button
                type="button"
                className="modal-botao-cancelar"
                onClick={fecharModalExclusao}
                disabled={excluindo}
                >
                Cancelar
                </button>

                <button
                type="button"
                className="modal-botao-confirmar"
                onClick={confirmarExclusao}
                disabled={excluindo}
                >
                {excluindo ? (
                    <>
                    <span className="modal-spinner"></span>
                    Excluindo...
                    </>
                ) : (
                    <>
                    <i className="bi bi-trash3"></i>
                    Excluir aluno
                    </>
                )}
                </button>
            </div>
            </div>
        </div>
        )}
    </section>
  );
}

function StatCard({ titulo, valor, texto, tipo, icone }) {
  return (
    <article className="alunos-stat-card">
      <div className={`alunos-stat-icon ${tipo}`}>
        {icone}
      </div>

      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
        <small>{texto}</small>
      </div>
    </article>
  );
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  const dataLimpa = data.split("T")[0];
  const [ano, mes, dia] = dataLimpa.split("-");

  return `${dia}/${mes}/${ano}`;
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) {
    return 0;
  }

  const dataLimpa = dataNascimento.split("T")[0];
  const [ano, mes, dia] = dataLimpa.split("-").map(Number);

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;

  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes ||
    (hoje.getMonth() + 1 === mes &&
      hoje.getDate() < dia);

  if (aindaNaoFezAniversario) {
    idade--;
  }

  return idade;
}

function obterIniciais(nome) {
  if (!nome) {
    return "A";
  }

  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

function gerarPaginas(atual, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (atual <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (atual >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", atual - 1, atual, atual + 1, "...", total];
}

export default Alunos;