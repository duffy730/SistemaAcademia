import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  UserRoundCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import api from "../../services/api";
import MatriculaModal from "../../components/MatriculaModal/MatriculaModal";
import "./Matriculas.css";

const ITENS_POR_PAGINA = 8;

const ROTAS = {
  listarMatriculas: "/matriculas/listar",
  criarMatricula: "/matriculas/criar-matricula",
  atualizarMatricula: (id) => `/matriculas/atualizar-matricula/${id}`,
  desativarMatricula: (id) => `/matriculas/desativar/${id}`,
  ativarMatricula: (id) => `/matriculas/ativar/${id}`,
  excluirMatricula: (id) => `/matriculas/remover/${id}`,
  listarAlunos: "/alunos/listar",
  listarPlanos: "/planos/listar",
};

function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [planoFiltro, setPlanoFiltro] = useState("todos");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("criar");
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [menuAberto, setMenuAberto] = useState(null);
  const [matriculaParaDesativar, setMatriculaParaDesativar] = useState(null);
  const [desativando, setDesativando] = useState(false);

  const [matriculaParaAtivar, setMatriculaParaAtivar] = useState(null);

  const [planoAtivacaoId, setPlanoAtivacaoId] = useState("");
  const [ativando, setAtivando] = useState(false);
  const [matriculaParaExcluir, setMatriculaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [matriculasResponse, alunosResponse, planosResponse] =
        await Promise.all([
          api.get(ROTAS.listarMatriculas),
          api.get(ROTAS.listarAlunos),
          api.get(ROTAS.listarPlanos),
        ]);

      setMatriculas(Array.isArray(matriculasResponse.data) ? matriculasResponse.data : []);
      setAlunos(Array.isArray(alunosResponse.data) ? alunosResponse.data : []);
      setPlanos(Array.isArray(planosResponse.data) ? planosResponse.data : []);
    } catch (error) {
      console.error("Erro ao carregar matrículas:", error.response?.data ?? error.message);
      setErro("Não foi possível carregar as matrículas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, status, planoFiltro, dataInicial, dataFinal]);

  const matriculasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const planoSelecionado = planos.find(
      (plano) => String(plano.id) === planoFiltro
    );

    return matriculas.filter((matricula) => {
      const aluno = obterAluno(matricula, alunos);
      const plano = obterPlano(matricula, planos);
      const ativa = matricula.ativa ?? matricula.ativo ?? false;

      const textoBusca = [
        formatarNumeroMatricula(matricula.id),
        String(matricula.id),
        obterNomeAluno(matricula, aluno),
        obterEmailAluno(matricula, aluno),
        obterNomePlano(matricula, plano),
      ]
        .join(" ")
        .toLowerCase();

      const correspondeBusca = !termo || textoBusca.includes(termo);

      const correspondeStatus =
        status === "todos" ||
        (status === "ativas" && ativa) ||
        (status === "nao-ativas" && !ativa);

      const planoIdMatricula =
      matricula.planoId ??
      plano?.id ??
      null;

    const nomePlanoMatricula = obterNomePlano(
      matricula,
      plano
    )
      .trim()
      .toLowerCase();

    const nomePlanoSelecionado =
      planoSelecionado?.nome
        ?.trim()
        .toLowerCase() ?? "";

    const correspondePlano =
      planoFiltro === "todos" ||
      (
        planoIdMatricula !== null &&
        String(planoIdMatricula) === planoFiltro
      ) ||
      (
        nomePlanoSelecionado &&
        nomePlanoMatricula === nomePlanoSelecionado
      );

      const inicio = obterDataInicio(matricula);

      const correspondeDataInicial =
        !dataInicial || (inicio && inicio >= dataLocal(dataInicial));

      const correspondeDataFinal =
        !dataFinal || (inicio && inicio <= dataLocal(dataFinal));

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondePlano &&
        correspondeDataInicial &&
        correspondeDataFinal
      );
    });
  }, [matriculas, alunos, planos, busca, status, planoFiltro, dataInicial, dataFinal]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(matriculasFiltradas.length / ITENS_POR_PAGINA)
  );

  const matriculasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return matriculasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [matriculasFiltradas, paginaAtual]);

  const estatisticas = useMemo(() => {
    const total = matriculas.length;
    const ativas = matriculas.filter(
      (matricula) => matricula.ativa ?? matricula.ativo ?? false
    ).length;

    const hoje = new Date();
    const novasEsteMes = matriculas.filter((matricula) => {
      const data = obterDataInicio(matricula);

      return (
        data &&
        data.getMonth() === hoje.getMonth() &&
        data.getFullYear() === hoje.getFullYear()
      );
    }).length;

    return {
      total,
      ativas,
      naoAtivas: total - ativas,
      novasEsteMes,
    };
  }, [matriculas]);

  function abrirCadastro() {
    setMatriculaSelecionada(null);
    setModoModal("criar");
    setModalAberto(true);
  }

  function abrirVisualizacao(matricula) {
    setMatriculaSelecionada(matricula);
    setModoModal("visualizar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function abrirEdicao(matricula) {
    setMatriculaSelecionada(matricula);
    setModoModal("editar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setMatriculaSelecionada(null);
  }

  async function salvarMatricula(dados) {
    try {
      setSalvando(true);
      setErro("");

      if (modoModal === "editar" && matriculaSelecionada) {
        await api.put(
          ROTAS.atualizarMatricula(matriculaSelecionada.id),
          dados
        );
      } else {
        await api.post(ROTAS.criarMatricula, dados);
      }

      await carregarDados();
      setModalAberto(false);
      setMatriculaSelecionada(null);
    } catch (error) {
      console.error("Erro ao salvar matrícula:", error.response?.data ?? error.message);
      throw new Error(
        obterMensagemErro(error) || "Não foi possível salvar a matrícula."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirDesativacao(matricula) {
    setMatriculaParaDesativar(matricula);
    setMenuAberto(null);
  }

  function fecharDesativacao() {
    if (!desativando) setMatriculaParaDesativar(null);
  }

  async function confirmarDesativacao() {
    if (!matriculaParaDesativar) return;

    try {
      setDesativando(true);
      setErro("");

      await api.patch(
        ROTAS.desativarMatricula(matriculaParaDesativar.id)
      );

      setMatriculaParaDesativar(null);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao desativar matrícula:", error.response?.data ?? error.message);
      setErro(
        obterMensagemErro(error) || "Não foi possível desativar a matrícula."
      );
    } finally {
      setDesativando(false);
    }
  }

  function abrirAtivacao(matricula) {
    setMatriculaParaAtivar(matricula);
    setPlanoAtivacaoId("");
    setMenuAberto(null);
    setErro("");
  }

  function fecharAtivacao() {
    if (ativando) return;

    setMatriculaParaAtivar(null);
    setPlanoAtivacaoId("");
  }

  async function confirmarAtivacao() {
  if (!matriculaParaAtivar) {
    return;
  }

  try {
    setAtivando(true);
    setErro("");

    await api.put(
      ROTAS.ativarMatricula(matriculaParaAtivar.id)
    );

    setMatriculaParaAtivar(null);

    await carregarDados();
  } catch (error) {
    console.error(
      "Erro ao ativar matrícula:",
      error.response?.data ?? error.message
    );

    setErro(
      obterMensagemErro(error) ||
        "Não foi possível ativar a matrícula."
    );
  } finally {
    setAtivando(false);
  }
}

  function abrirExclusao(matricula) {
    setMatriculaParaExcluir(matricula);
    setMenuAberto(null);
    setErro("");
  }

  function fecharExclusao() {
    if (excluindo) return;

    setMatriculaParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!matriculaParaExcluir) return;

    try {
      setExcluindo(true);
      setErro("");

      await api.delete(
        ROTAS.excluirMatricula(matriculaParaExcluir.id)
      );

      setMatriculaParaExcluir(null);
      await carregarDados();
    } catch (error) {
      console.error(
        "Erro ao excluir matrícula:",
        error.response?.data ?? error.message
      );

      setErro(
        obterMensagemErro(error) ||
          "Não foi possível excluir a matrícula."
      );
    } finally {
      setExcluindo(false);
    }
  }

  function limparFiltros() {
    setBusca("");
    setStatus("todos");
    setPlanoFiltro("todos");
    setDataInicial("");
    setDataFinal("");
  }

  function mudarPagina(novaPagina) {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  }

  function exportarCSV() {
    if (matriculasFiltradas.length === 0) return;

    const cabecalho = [
      "Matrícula",
      "Aluno",
      "E-mail",
      "Plano",
      "Data de início",
      "Data de término",
      "Status",
    ];

    const linhas = matriculasFiltradas.map((matricula) => {
      const aluno = obterAluno(matricula, alunos);
      const plano = obterPlano(matricula, planos);
      const inicio = obterDataInicio(matricula);
      const termino = obterDataTermino(matricula, plano);

      return [
        formatarNumeroMatricula(matricula.id),
        obterNomeAluno(matricula, aluno),
        obterEmailAluno(matricula, aluno),
        obterNomePlano(matricula, plano),
        formatarData(inicio),
        formatarData(termino),
        matricula.ativa ?? matricula.ativo ?? false ? "Ativa" : "Não ativa",
      ];
    });

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
    link.download = "matriculas.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const primeiroItem =
    matriculasFiltradas.length === 0
      ? 0
      : (paginaAtual - 1) * ITENS_POR_PAGINA + 1;

  const ultimoItem = Math.min(
    paginaAtual * ITENS_POR_PAGINA,
    matriculasFiltradas.length
  );

  return (
    <section className="matriculas-page">
      <div className="matriculas-page-header">
        <div>
          <h1>Matrículas</h1>
          <p>Gerencie todas as matrículas realizadas na academia.</p>
        </div>

        <div className="matriculas-page-buttons">
          <button
            type="button"
            className="matriculas-primary-button"
            onClick={abrirCadastro}
          >
            <Plus size={19} />
            Nova matrícula
          </button>

          <button
            type="button"
            className="matriculas-secondary-button"
            onClick={exportarCSV}
            disabled={matriculasFiltradas.length === 0}
          >
            <Download size={18} />
            Exportar
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      <div className="matriculas-stats-grid">
        <StatCard
          titulo="Total de matrículas"
          valor={estatisticas.total}
          texto="Matrículas cadastradas"
          tipo="green"
          icone={<UsersRound size={25} />}
        />

        <StatCard
          titulo="Matrículas ativas"
          valor={estatisticas.ativas}
          texto="Atualmente em vigor"
          tipo="blue"
          icone={<CheckCircle2 size={25} />}
        />

        <StatCard
          titulo="Matrículas não ativas"
          valor={estatisticas.naoAtivas}
          texto="Desativadas ou vencidas"
          tipo="orange"
          icone={<Clock3 size={25} />}
        />

        <StatCard
          titulo="Novas este mês"
          valor={estatisticas.novasEsteMes}
          texto="Criadas no mês atual"
          tipo="purple"
          icone={<CalendarCheck2 size={25} />}
        />
      </div>

      <div className="matriculas-panel">
        <div className="matriculas-filters">
          <div className="matriculas-search">
            <Search size={19} />

            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por aluno, plano ou número da matrícula..."
            />
          </div>

          <div className="matriculas-filter-actions">
            <Select
              value={status}
              onChange={setStatus}
              options={[
                ["todos", "Todos os status"],
                ["ativas", "Ativas"],
                ["nao-ativas", "Não ativas"],
              ]}
            />

            <Select
              value={planoFiltro}
              onChange={setPlanoFiltro}
              options={[
                ["todos", "Todos os planos"],
                ...planos.map((plano) => [String(plano.id), plano.nome]),
              ]}
            />

            <button
              type="button"
              className={`matriculas-filter-button ${
                filtrosAbertos ? "active" : ""
              }`}
              onClick={() => setFiltrosAbertos((aberto) => !aberto)}
            >
              <Filter size={17} />
              Filtros
            </button>
          </div>
        </div>

        {filtrosAbertos && (
          <div className="matriculas-extra-filters">
            <label>
              <span>Início a partir de</span>
              <input
                type="date"
                value={dataInicial}
                onChange={(event) => setDataInicial(event.target.value)}
              />
            </label>

            <label>
              <span>Início até</span>
              <input
                type="date"
                value={dataFinal}
                onChange={(event) => setDataFinal(event.target.value)}
              />
            </label>

            <button type="button" onClick={limparFiltros}>
              <X size={16} />
              Limpar filtros
            </button>
          </div>
        )}

        {erro && <p className="matriculas-error">{erro}</p>}

        <div className="matriculas-table-wrapper">
          <table className="matriculas-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Aluno</th>
                <th>Plano</th>
                <th>Data de início</th>
                <th>Data de término</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="7" className="matriculas-empty">
                    Carregando matrículas...
                  </td>
                </tr>
              ) : matriculasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="matriculas-empty">
                    Nenhuma matrícula encontrada.
                  </td>
                </tr>
              ) : (
                matriculasPaginadas.map((matricula, index) => {
                  const aluno = obterAluno(matricula, alunos);
                  const plano = obterPlano(matricula, planos);
                  const inicio = obterDataInicio(matricula);
                  const termino = obterDataTermino(matricula, plano);
                  const ativa = matricula.ativa ?? matricula.ativo ?? false;
                  const nomePlano = obterNomePlano(matricula, plano);
                  const tema = obterTemaPlano(nomePlano, index);

                  return (
                    <tr key={matricula.id}>
                      <td>
                        <div className="matricula-number">
                          <strong>{formatarNumeroMatricula(matricula.id)}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="matricula-aluno">
                          <div className="matricula-avatar">
                            {obterIniciais(obterNomeAluno(matricula, aluno))}
                          </div>

                          <div>
                            <strong>{obterNomeAluno(matricula, aluno)}</strong>
                            <span>
                              {obterEmailAluno(matricula, aluno) ||
                                "E-mail não informado"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="matricula-plano">
                          <span className={`matricula-plano-tag ${tema}`}>
                            {nomePlano}
                          </span>
                          <small>
                            {formatarDuracaoPlano(
                              plano?.duracaoDias ?? matricula.duracaoDias
                            )}
                          </small>
                        </div>
                      </td>

                      <td>
                        <strong>{formatarData(inicio)}</strong>
                      </td>

                      <td>
                        <div className="matricula-termino">
                          <strong>{formatarData(termino)}</strong>
                          <span>{formatarTempoRestante(termino, ativa)}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`matricula-status ${
                            ativa ? "active" : "inactive"
                          }`}
                        >
                          {ativa ? "Ativa" : "Não ativa"}
                        </span>
                      </td>

                      <td>
                        <div className="matriculas-row-actions">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => abrirEdicao(matricula)}
                          >
                            <Edit3 size={17} />
                          </button>
                          


                          <div className="matricula-more-wrapper">
                            <button
                              type="button"
                              title="Mais opções"
                              onClick={() =>
                                setMenuAberto((idAtual) =>
                                  idAtual === matricula.id ? null : matricula.id
                                )
                              }
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {menuAberto === matricula.id && (
                              <div className="matricula-row-menu">
                                {ativa ? (
                                  <button
                                    type="button"
                                    className="menu-desativar"
                                    onClick={() => abrirDesativacao(matricula)}
                                  >
                                    <UserRoundCheck size={16} />
                                    Desativar matrícula
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="menu-ativar"
                                    onClick={() => abrirAtivacao(matricula)}
                                  >
                                    <CheckCircle2 size={16} />
                                    Ativar matrícula
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="menu-excluir"
                                  onClick={() => abrirExclusao(matricula)}
                                >
                                  <Trash2 size={16} />
                                  Excluir matrícula
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="matriculas-pagination">
        <p>
          Mostrando {primeiroItem} a {ultimoItem} de{" "}
          {matriculasFiltradas.length} matrículas
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

          {gerarPaginas(paginaAtual, totalPaginas).map((pagina, index) =>
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
                className={paginaAtual === pagina ? "active" : ""}
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
        <MatriculaModal
          matricula={matriculaSelecionada}
          alunos={alunos}
          planos={planos}
          modo={modoModal}
          fechar={fecharModal}
          salvar={salvarMatricula}
          salvando={salvando}
        />
      )}

      {matriculaParaDesativar && (
        <div
          className="matricula-delete-overlay"
          onMouseDown={fecharDesativacao}
        >
          <div
            className="matricula-delete-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="matricula-delete-close"
              onClick={fecharDesativacao}
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div className="matricula-delete-icon">
              <UserRoundCheck size={25} />
            </div>

            <h2>Desativar matrícula?</h2>

            <p>
              A matrícula{" "}
              <strong>
                {formatarNumeroMatricula(matriculaParaDesativar.id)}
              </strong>{" "}
              será marcada como não ativa. O histórico continuará salvo.
            </p>

            <div className="matricula-delete-actions">
              <button
                type="button"
                className="cancel"
                onClick={fecharDesativacao}
                disabled={desativando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="confirm"
                onClick={confirmarDesativacao}
                disabled={desativando}
              >
                <UserRoundCheck size={17} />
                {desativando ? "Desativando..." : "Desativar matrícula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {matriculaParaAtivar && (
        <div
          className="matricula-delete-overlay"
          onMouseDown={fecharAtivacao}
        >
          <div
            className="matricula-delete-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="matricula-delete-close"
              onClick={fecharAtivacao}
            >
              <X size={19} />
            </button>

            <div className="matricula-activate-icon">
              <CheckCircle2 size={25} />
            </div>

            <h2>Ativar matrícula</h2>

            <p>
              Selecione o plano que será vinculado novamente à matrícula{" "}
              <strong>
                {formatarNumeroMatricula(
                  matriculaParaAtivar.id
                )}
              </strong>
              .
            </p>

            <div className="matricula-delete-actions">
              <button
                type="button"
                className="cancel"
                onClick={fecharAtivacao}
                disabled={ativando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="activate"
                onClick={confirmarAtivacao}
                disabled={ativando}
              >
                <CheckCircle2 size={17} />

                {ativando
                  ? "Ativando..."
                  : "Ativar matrícula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {matriculaParaExcluir && (
        <div
          className="matricula-delete-overlay"
          onMouseDown={fecharExclusao}
        >
          <div
            className="matricula-delete-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="matricula-delete-close"
              onClick={fecharExclusao}
            >
              <X size={19} />
            </button>

            <div className="matricula-exclude-icon">
              <Trash2 size={25} />
            </div>

            <h2>Excluir matrícula?</h2>

            <p>
              A matrícula{" "}
              <strong>
                {formatarNumeroMatricula(
                  matriculaParaExcluir.id
                )}
              </strong>{" "}
              será apagada permanentemente. O histórico também será perdido.
            </p>

            <div className="matricula-delete-actions">
              <button
                type="button"
                className="cancel"
                onClick={fecharExclusao}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="delete"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                <Trash2 size={17} />

                {excluindo
                  ? "Excluindo..."
                  : "Excluir matrícula"}
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
    <article className="matriculas-stat-card">
      <div className={`matriculas-stat-icon ${tipo}`}>{icone}</div>
      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
        <small>{texto}</small>
      </div>
    </article>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="matriculas-select-wrapper">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} />
    </div>
  );
}

function obterAluno(matricula, alunos) {
  if (matricula.aluno && typeof matricula.aluno === "object") {
    return matricula.aluno;
  }

  return alunos.find(
    (aluno) => Number(aluno.id) === Number(matricula.alunoId)
  );
}

function obterPlano(matricula, planos) {
  if (
    matricula.plano &&
    typeof matricula.plano === "object"
  ) {
    return matricula.plano;
  }

  if (matricula.planoId !== null && matricula.planoId !== undefined) {
    const planoPorId = planos.find(
      (plano) =>
        Number(plano.id) === Number(matricula.planoId)
    );

    if (planoPorId) {
      return planoPorId;
    }
  }

  const nomePlanoMatricula =
    typeof matricula.plano === "string"
      ? matricula.plano
      : matricula.planoNome || matricula.nomePlano;

  if (!nomePlanoMatricula) {
    return null;
  }

  return planos.find(
    (plano) =>
      normalizarTexto(plano.nome) ===
      normalizarTexto(nomePlanoMatricula)
  );
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obterNomeAluno(matricula, aluno) {
  if (typeof matricula.aluno === "string") return matricula.aluno;

  return (
    aluno?.nome ||
    matricula.alunoNome ||
    matricula.nomeAluno ||
    "Aluno não encontrado"
  );
}

function obterEmailAluno(matricula, aluno) {
  return (
    aluno?.email ||
    matricula.alunoEmail ||
    matricula.emailAluno ||
    ""
  );
}

function obterNomePlano(matricula, plano) {
  if (typeof matricula.plano === "string") return matricula.plano;

  return (
    plano?.nome ||
    matricula.planoNome ||
    matricula.nomePlano ||
    "Sem plano"
  );
}

function obterDataInicio(matricula) {
  const valor =
    matricula.dataInicio ||
    matricula.dataMatricula ||
    matricula.dataCadastro ||
    matricula.criadaEm;

  if (valor) return converterParaData(valor);

  const descricao = matricula.descricao || "";
  const resultado = descricao.match(
    /(?:Ativada|Criada|Cadastrada)\s+em\s+(\d{2})\/(\d{2})\/(\d{4})/i
  );

  if (!resultado) return null;

  const [, dia, mes, ano] = resultado;
  return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

function obterDataTermino(matricula, plano) {
  const dataRecebida =
    matricula.dataTermino ||
    matricula.dataFim ||
    matricula.dataVencimento;

  if (dataRecebida) {
    return converterParaData(dataRecebida);
  }

  const dataInicio = obterDataInicio(matricula);

  const duracaoDias = Number(
    matricula.duracaoDias ??
    plano?.duracaoDias ??
    0
  );

  if (
    !dataInicio ||
    Number.isNaN(dataInicio.getTime()) ||
    duracaoDias <= 0
  ) {
    return null;
  }

  const dataTermino = new Date(dataInicio);

  dataTermino.setDate(
    dataTermino.getDate() + duracaoDias
  );

  return dataTermino;
}

function converterParaData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;

  const texto = String(valor);

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    const [ano, mes, dia] = texto.split("T")[0].split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(texto)) {
    const [dia, mes, ano] = texto.split(" ")[0].split("/").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  const data = new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

function dataLocal(valor) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarData(data) {
  if (!data || Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
}

function formatarNumeroMatricula(id) {
  return `#${String(id ?? 0).padStart(6, "0")}`;
}

function formatarDuracaoPlano(dias) {
  const quantidade = Number(dias ?? 0);

  if (!quantidade) return "Duração não informada";

  if (quantidade >= 360) {
    const anos = Math.max(1, Math.round(quantidade / 365));
    return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  }

  if (quantidade >= 30) {
    const meses = Math.max(1, Math.round(quantidade / 30));
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }

  return `${quantidade} ${quantidade === 1 ? "dia" : "dias"}`;
}

function formatarTempoRestante(dataTermino, ativa) {
  if (!dataTermino) return "Término não informado";
  if (!ativa) return "Matrícula desativada";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const termino = new Date(dataTermino);
  termino.setHours(0, 0, 0, 0);

  const dias = Math.ceil((termino - hoje) / 86400000);

  if (dias < 0) return `Vencida há ${Math.abs(dias)} dias`;
  if (dias === 0) return "Vence hoje";

  return `Faltam ${dias} dias`;
}

function obterTemaPlano(nomePlano, index) {
  const nome = String(nomePlano || "").toLowerCase();

  if (nome.includes("básico") || nome.includes("premium")) return "green";
  if (nome.includes("anual")) return "purple";
  if (nome.includes("trimestral")) return "blue";
  if (nome.includes("black") || nome.includes("basico")) return "orange";

  return ["green", "purple", "blue", "orange"][index % 4];
}

function obterIniciais(nome) {
  if (!nome) return "A";

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

  if (atual <= 3) return [1, 2, 3, 4, "...", total];
  if (atual >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", atual - 1, atual, atual + 1, "...", total];
}

function obterMensagemErro(error) {
  const dados = error.response?.data;

  if (typeof dados === "string") return dados;

  return dados?.mensagem || dados?.message || "";
}

export default Matriculas;