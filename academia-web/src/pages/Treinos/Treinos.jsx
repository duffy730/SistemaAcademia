import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Dumbbell,
  Users,
  ClipboardList,
  CheckCircle2,
  MoreVertical,
  ChevronDown,
  Save,
  ArrowLeft,
} from "lucide-react";

import "./Treinos.css";
import api from "../../services/api";

function Treinos() {
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [objetivo, setObjetivo] = useState("Todos");
  const [divisao, setDivisao] = useState("Todos");
  const [status, setStatus] = useState("Todos");

  const [drawerAberto, setDrawerAberto] = useState(false);
  const [modalExercicio, setModalExercicio] = useState(false);

  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [exercicioEditando, setExercicioEditando] = useState(null);

  const [formExercicio, setFormExercicio] = useState({
    nome: "",
    descricao: "",
    grupoMuscular: "",
  });

  /*
   * ---------------------------------------------------------
   * EXERCÍCIOS
   * ---------------------------------------------------------
   */

  async function carregarExercicios() {
    try {
      setLoading(true);

      const response = await api.get("/exercicios/listar");

      setExercicios(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarExercicios();
  }, []);

  /*
   * ---------------------------------------------------------
   * EXERCÍCIO
   * ---------------------------------------------------------
   */

  function abrirNovoExercicio() {
    setModoEdicao(false);
    setExercicioEditando(null);

    setFormExercicio({
      nome: "",
      descricao: "",
      grupoMuscular: "",
    });

    setModalExercicio(true);
  }

  function abrirEditarExercicio(exercicio) {
    setModoEdicao(true);
    setExercicioEditando(exercicio);

    setFormExercicio({
      nome: exercicio.nome || "",
      descricao: exercicio.descricao || "",
      grupoMuscular: exercicio.grupoMuscular || "",
    });

    setModalExercicio(true);
  }

  async function salvarExercicio(e) {
    e.preventDefault();

    try {
      if (modoEdicao) {
        await api.put(
          `/exercicios/atualizar-exercicio/${exercicioEditando.id}`,
          formExercicio
        );
      } else {
        await api.post(
          "/exercicios/criar-exercicio",
          formExercicio
        );
      }

      setModalExercicio(false);
      carregarExercicios();
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);

      alert(
        error?.response?.data?.mensagem ||
          "Não foi possível salvar o exercício."
      );
    }
  }

  async function excluirExercicio(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este exercício?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/exercicios/remover-exercicio/${id}`);

      carregarExercicios();
    } catch (error) {
      console.error("Erro ao excluir exercício:", error);

      alert(
        error?.response?.data?.mensagem ||
          "Não foi possível excluir o exercício."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * TREINO
   * ---------------------------------------------------------
   */

  const [treinos, setTreinos] = useState([
    {
      id: 1,
      nome: "Hipertrofia A",
      aluno: "João Silva",
      objetivo: "Hipertrofia",
      divisao: "ABC",
      quantidadeExercicios: 8,
      status: "Ativo",
      atualizado: "Hoje",
      exercicios: [],
    },
    {
      id: 2,
      nome: "Hipertrofia B",
      aluno: "Mariana Rocha",
      objetivo: "Hipertrofia",
      divisao: "ABC",
      quantidadeExercicios: 7,
      status: "Ativo",
      atualizado: "Ontem",
      exercicios: [],
    },
    {
      id: 3,
      nome: "Emagrecimento",
      aluno: "Lucas Silva",
      objetivo: "Emagrecimento",
      divisao: "Full Body",
      quantidadeExercicios: 10,
      status: "Ativo",
      atualizado: "12/05/2026",
      exercicios: [],
    },
    {
      id: 4,
      nome: "Força A",
      aluno: "Ana Martins",
      objetivo: "Força",
      divisao: "AB",
      quantidadeExercicios: 6,
      status: "Ativo",
      atualizado: "10/05/2026",
      exercicios: [],
    },
    {
      id: 5,
      nome: "Condicionamento",
      aluno: "Carlos Souza",
      objetivo: "Condicionamento",
      divisao: "Full Body",
      quantidadeExercicios: 9,
      status: "Arquivado",
      atualizado: "02/05/2026",
      exercicios: [],
    },
  ]);

  const [novoTreino, setNovoTreino] = useState({
    nome: "",
    aluno: "",
    objetivo: "Hipertrofia",
    divisao: "ABC",
    observacoes: "",
  });

  function abrirNovoTreino() {
    setNovoTreino({
      nome: "",
      aluno: "",
      objetivo: "Hipertrofia",
      divisao: "ABC",
      observacoes: "",
    });

    setTreinoSelecionado({
      id: null,
      nome: "",
      aluno: "",
      objetivo: "Hipertrofia",
      divisao: "ABC",
      observacoes: "",
      exercicios: [],
      quantidadeExercicios: 0,
      status: "Ativo",
    });

    setDrawerAberto(true);
  }

  function abrirTreino(treino) {
    setTreinoSelecionado({
      ...treino,
      exercicios: treino.exercicios || [],
    });

    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);
    setTreinoSelecionado(null);
  }

  function adicionarExercicioAoTreino(exercicio) {
    if (!treinoSelecionado) return;

    const existe = treinoSelecionado.exercicios?.some(
      (item) => item.id === exercicio.id
    );

    if (existe) return;

    const novoExercicio = {
      ...exercicio,
      series: 3,
      repeticoes: 12,
      carga: "",
      descanso: "60s",
    };

    setTreinoSelecionado({
      ...treinoSelecionado,
      exercicios: [
        ...(treinoSelecionado.exercicios || []),
        novoExercicio,
      ],
    });
  }

  function removerExercicioDoTreino(id) {
    if (!treinoSelecionado) return;

    setTreinoSelecionado({
      ...treinoSelecionado,
      exercicios: treinoSelecionado.exercicios.filter(
        (item) => item.id !== id
      ),
    });
  }

  function atualizarExercicioTreino(id, campo, valor) {
    setTreinoSelecionado({
      ...treinoSelecionado,
      exercicios: treinoSelecionado.exercicios.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      ),
    });
  }

  function salvarTreinoLocal() {
    if (!treinoSelecionado.nome.trim()) {
      alert("Informe o nome do treino.");
      return;
    }

    if (!treinoSelecionado.aluno.trim()) {
      alert("Informe o aluno.");
      return;
    }

    if (treinoSelecionado.id) {
      setTreinos((prev) =>
        prev.map((treino) =>
          treino.id === treinoSelecionado.id
            ? {
                ...treino,
                ...treinoSelecionado,
                quantidadeExercicios:
                  treinoSelecionado.exercicios.length,
                atualizado: "Agora",
              }
            : treino
        )
      );
    } else {
      const novo = {
        ...treinoSelecionado,
        id: Date.now(),
        quantidadeExercicios:
          treinoSelecionado.exercicios.length,
        atualizado: "Agora",
      };

      setTreinos((prev) => [novo, ...prev]);
    }

    alert(
      "Treino salvo localmente. Quando você me passar o endpoint de Treino, substituímos esta função pela API."
    );

    fecharDrawer();
  }

  /*
   * ---------------------------------------------------------
   * FILTROS
   * ---------------------------------------------------------
   */

  const treinosFiltrados = useMemo(() => {
    return treinos.filter((treino) => {
      const texto = busca.toLowerCase();

      const correspondeBusca =
        treino.nome.toLowerCase().includes(texto) ||
        treino.aluno.toLowerCase().includes(texto);

      const correspondeObjetivo =
        objetivo === "Todos" ||
        treino.objetivo === objetivo;

      const correspondeDivisao =
        divisao === "Todos" ||
        treino.divisao === divisao;

      const correspondeStatus =
        status === "Todos" ||
        treino.status === status;

      return (
        correspondeBusca &&
        correspondeObjetivo &&
        correspondeDivisao &&
        correspondeStatus
      );
    });
  }, [treinos, busca, objetivo, divisao, status]);

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <main className="treinos-page">
      <div className="treinos-header">
        <div>
          <h1>Treinos</h1>
          <p>
            Gerencie os treinos e exercícios dos alunos.
          </p>
        </div>

        <div className="treinos-header-actions">
          <button
            className="treino-btn treino-btn-secondary"
            onClick={abrirNovoExercicio}
          >
            <Dumbbell size={17} />
            Novo exercício
          </button>

          <button
            className="treino-btn treino-btn-primary"
            onClick={abrirNovoTreino}
          >
            <Plus size={18} />
            Novo treino
          </button>
        </div>
      </div>

      {/* CARDS */}

      <section className="treinos-stats">
        <div className="treino-stat-card">
          <div className="treino-stat-icon verde">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Treinos cadastrados</span>
            <strong>{treinos.length}</strong>
            <small>+5 este mês</small>
          </div>
        </div>

        <div className="treino-stat-card">
          <div className="treino-stat-icon roxo">
            <Dumbbell size={21} />
          </div>

          <div>
            <span>Exercícios cadastrados</span>
            <strong>{exercicios.length}</strong>
            <small>Exercícios disponíveis</small>
          </div>
        </div>

        <div className="treino-stat-card">
          <div className="treino-stat-icon azul">
            <Users size={21} />
          </div>

          <div>
            <span>Alunos com treino</span>
            <strong>
              {new Set(treinos.map((t) => t.aluno)).size}
            </strong>
            <small>Alunos ativos</small>
          </div>
        </div>

        <div className="treino-stat-card">
          <div className="treino-stat-icon amarelo">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Treinos ativos</span>
            <strong>
              {treinos.filter(
                (t) => t.status === "Ativo"
              ).length}
            </strong>
            <small>Em funcionamento</small>
          </div>
        </div>
      </section>

      {/* EXERCÍCIOS */}

      <section className="treinos-exercicios-card">
        <div className="treinos-card-header">
          <div>
            <h2>Exercícios</h2>
            <p>
              Biblioteca de exercícios disponíveis para os
              treinos.
            </p>
          </div>

          <button
            className="treino-btn treino-btn-outline"
            onClick={abrirNovoExercicio}
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>

        {loading ? (
          <div className="treinos-loading">
            Carregando exercícios...
          </div>
        ) : exercicios.length === 0 ? (
          <div className="treinos-empty-exercicios">
            <Dumbbell size={30} />

            <strong>
              Nenhum exercício cadastrado
            </strong>

            <span>
              Cadastre exercícios para poder adicioná-los aos
              treinos.
            </span>

            <button
              className="treino-btn treino-btn-primary"
              onClick={abrirNovoExercicio}
            >
              <Plus size={16} />
              Criar exercício
            </button>
          </div>
        ) : (
          <div className="exercicios-scroll">
            {exercicios.slice(0, 6).map((exercicio) => (
              <div
                className="exercicio-mini-card"
                key={exercicio.id}
              >
                <div className="exercicio-mini-icon">
                  <Dumbbell size={17} />
                </div>

                <div className="exercicio-mini-info">
                  <strong>
                    {exercicio.nome}
                  </strong>

                  <span>
                    {exercicio.grupoMuscular ||
                      "Grupo não informado"}
                  </span>
                </div>

                <button
                  className="icon-btn"
                  onClick={() =>
                    abrirEditarExercicio(exercicio)
                  }
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>

                <button
                  className="icon-btn danger"
                  onClick={() =>
                    excluirExercicio(exercicio.id)
                  }
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TREINOS */}

      <section className="treinos-table-card">
        <div className="treinos-card-header">
          <div>
            <h2>Treinos cadastrados</h2>
            <p>
              Visualize e gerencie os treinos dos alunos.
            </p>
          </div>
        </div>

        {/* FILTROS */}

        <div className="treinos-filtros">
          <div className="treino-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Buscar treino ou aluno..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />
          </div>

          <div className="treino-select">
            <select
              value={objetivo}
              onChange={(e) =>
                setObjetivo(e.target.value)
              }
            >
              <option>Todos</option>
              <option>Hipertrofia</option>
              <option>Emagrecimento</option>
              <option>Força</option>
              <option>Condicionamento</option>
            </select>

            <ChevronDown size={15} />
          </div>

          <div className="treino-select">
            <select
              value={divisao}
              onChange={(e) =>
                setDivisao(e.target.value)
              }
            >
              <option>Todos</option>
              <option>ABC</option>
              <option>AB</option>
              <option>ABCD</option>
              <option>Full Body</option>
              <option>Push Pull Legs</option>
            </select>

            <ChevronDown size={15} />
          </div>

          <div className="treino-select">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option>Todos</option>
              <option>Ativo</option>
              <option>Arquivado</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        {/* TABELA */}

        <div className="treinos-table-wrapper">
          <table className="treinos-table">
            <thead>
              <tr>
                <th>Treino</th>
                <th>Aluno</th>
                <th>Objetivo</th>
                <th>Divisão</th>
                <th>Exercícios</th>
                <th>Atualização</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {treinosFiltrados.map((treino) => (
                <tr key={treino.id}>
                  <td>
                    <div className="treino-nome">
                      <div className="treino-row-icon">
                        <Dumbbell size={16} />
                      </div>

                      <strong>{treino.nome}</strong>
                    </div>
                  </td>

                  <td>{treino.aluno}</td>

                  <td>
                    <span className="treino-objetivo">
                      {treino.objetivo}
                    </span>
                  </td>

                  <td>{treino.divisao}</td>

                  <td>
                    <strong>
                      {treino.quantidadeExercicios}
                    </strong>
                  </td>

                  <td className="treino-data">
                    {treino.atualizado}
                  </td>

                  <td>
                    <span
                      className={`treino-status ${
                        treino.status === "Ativo"
                          ? "ativo"
                          : "arquivado"
                      }`}
                    >
                      {treino.status}
                    </span>
                  </td>

                  <td>
                    <div className="treino-acoes">
                      <button
                        className="icon-btn"
                        onClick={() =>
                          abrirTreino(treino)
                        }
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="icon-btn"
                        onClick={() =>
                          abrirTreino(treino)
                        }
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-btn"
                        title="Mais opções"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {treinosFiltrados.length === 0 && (
            <div className="treinos-sem-resultados">
              <Search size={30} />

              <strong>
                Nenhum treino encontrado
              </strong>

              <span>
                Tente alterar os filtros ou realizar outra
                busca.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          DRAWER DO TREINO
      ===================================================== */}

      {drawerAberto && treinoSelecionado && (
        <>
          <div
            className="treino-overlay"
            onClick={fecharDrawer}
          />

          <aside className="treino-drawer">
            <div className="treino-drawer-header">
              <div>
                <span>GERENCIAMENTO</span>

                <h2>
                  {treinoSelecionado.id
                    ? "Editar treino"
                    : "Novo treino"}
                </h2>
              </div>

              <button
                className="drawer-close"
                onClick={fecharDrawer}
              >
                <X size={19} />
              </button>
            </div>

            <div className="treino-drawer-body">
              {/* DADOS DO TREINO */}

              <div className="drawer-section">
                <div className="drawer-section-title">
                  <span>01</span>

                  <div>
                    <strong>Informações</strong>
                    <small>
                      Dados básicos do treino
                    </small>
                  </div>
                </div>

                <div className="treino-form-grid">
                  <label>
                    <span>Nome do treino</span>

                    <input
                      type="text"
                      placeholder="Ex: Hipertrofia A"
                      value={
                        treinoSelecionado.nome
                      }
                      onChange={(e) =>
                        setTreinoSelecionado({
                          ...treinoSelecionado,
                          nome: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Aluno</span>

                    <input
                      type="text"
                      placeholder="Nome do aluno"
                      value={
                        treinoSelecionado.aluno
                      }
                      onChange={(e) =>
                        setTreinoSelecionado({
                          ...treinoSelecionado,
                          aluno: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Objetivo</span>

                    <select
                      value={
                        treinoSelecionado.objetivo
                      }
                      onChange={(e) =>
                        setTreinoSelecionado({
                          ...treinoSelecionado,
                          objetivo: e.target.value,
                        })
                      }
                    >
                      <option>Hipertrofia</option>
                      <option>Emagrecimento</option>
                      <option>Força</option>
                      <option>
                        Condicionamento
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Divisão</span>

                    <select
                      value={
                        treinoSelecionado.divisao
                      }
                      onChange={(e) =>
                        setTreinoSelecionado({
                          ...treinoSelecionado,
                          divisao: e.target.value,
                        })
                      }
                    >
                      <option>ABC</option>
                      <option>AB</option>
                      <option>ABCD</option>
                      <option>Full Body</option>
                      <option>
                        Push Pull Legs
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              {/* EXERCÍCIOS */}

              <div className="drawer-section">
                <div className="drawer-section-title">
                  <span>02</span>

                  <div>
                    <strong>Exercícios</strong>
                    <small>
                      Configure os exercícios do treino
                    </small>
                  </div>
                </div>

                <div className="drawer-exercicios">
                  {treinoSelecionado.exercicios
                    ?.length === 0 ? (
                    <div className="drawer-empty">
                      <Dumbbell size={24} />

                      <strong>
                        Nenhum exercício adicionado
                      </strong>

                      <span>
                        Adicione exercícios abaixo.
                      </span>
                    </div>
                  ) : (
                    treinoSelecionado.exercicios.map(
                      (exercicio, index) => (
                        <div
                          className="drawer-exercicio"
                          key={exercicio.id}
                        >
                          <div className="drawer-exercicio-top">
                            <div className="drawer-exercicio-number">
                              {index + 1}
                            </div>

                            <div>
                              <strong>
                                {exercicio.nome}
                              </strong>

                              <small>
                                {exercicio.grupoMuscular ||
                                  "Exercício"}
                              </small>
                            </div>

                            <button
                              className="drawer-delete"
                              onClick={() =>
                                removerExercicioDoTreino(
                                  exercicio.id
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="drawer-exercicio-config">
                            <label>
                              <span>Séries</span>

                              <input
                                type="number"
                                value={
                                  exercicio.series
                                }
                                onChange={(e) =>
                                  atualizarExercicioTreino(
                                    exercicio.id,
                                    "series",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              <span>Repetições</span>

                              <input
                                type="number"
                                value={
                                  exercicio.repeticoes
                                }
                                onChange={(e) =>
                                  atualizarExercicioTreino(
                                    exercicio.id,
                                    "repeticoes",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              <span>Carga</span>

                              <input
                                type="text"
                                placeholder="40kg"
                                value={
                                  exercicio.carga
                                }
                                onChange={(e) =>
                                  atualizarExercicioTreino(
                                    exercicio.id,
                                    "carga",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              <span>Descanso</span>

                              <input
                                type="text"
                                placeholder="60s"
                                value={
                                  exercicio.descanso
                                }
                                onChange={(e) =>
                                  atualizarExercicioTreino(
                                    exercicio.id,
                                    "descanso",
                                    e.target.value
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* LISTA PARA ADICIONAR */}

                <div className="adicionar-exercicio">
                  <div className="adicionar-exercicio-header">
                    <strong>
                      Adicionar exercício
                    </strong>

                    <span>
                      {exercicios.length} disponíveis
                    </span>
                  </div>

                  <div className="adicionar-exercicio-lista">
                    {exercicios.map((exercicio) => {
                      const jaAdicionado =
                        treinoSelecionado.exercicios?.some(
                          (item) =>
                            item.id === exercicio.id
                        );

                      return (
                        <button
                          key={exercicio.id}
                          disabled={jaAdicionado}
                          className={
                            jaAdicionado
                              ? "exercicio-add disabled"
                              : "exercicio-add"
                          }
                          onClick={() =>
                            adicionarExercicioAoTreino(
                              exercicio
                            )
                          }
                        >
                          <div>
                            <Dumbbell size={15} />

                            <span>
                              {exercicio.nome}
                            </span>
                          </div>

                          {jaAdicionado ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <Plus size={15} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* OBSERVAÇÕES */}

              <div className="drawer-section">
                <div className="drawer-section-title">
                  <span>03</span>

                  <div>
                    <strong>Observações</strong>
                    <small>
                      Informações adicionais
                    </small>
                  </div>
                </div>

                <textarea
                  className="treino-observacoes"
                  placeholder="Ex: Priorizar execução correta dos exercícios..."
                  value={
                    treinoSelecionado.observacoes ||
                    ""
                  }
                  onChange={(e) =>
                    setTreinoSelecionado({
                      ...treinoSelecionado,
                      observacoes:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="treino-drawer-footer">
              <button
                className="treino-btn treino-btn-secondary"
                onClick={fecharDrawer}
              >
                Cancelar
              </button>

              <button
                className="treino-btn treino-btn-primary"
                onClick={salvarTreinoLocal}
              >
                <Save size={16} />
                Salvar treino
              </button>
            </div>
          </aside>
        </>
      )}

      {/* =====================================================
          MODAL EXERCÍCIO
      ===================================================== */}

      {modalExercicio && (
        <>
          <div
            className="treino-modal-overlay"
            onClick={() =>
              setModalExercicio(false)
            }
          />

          <div className="treino-modal">
            <div className="treino-modal-header">
              <div>
                <span>
                  BIBLIOTECA DE EXERCÍCIOS
                </span>

                <h2>
                  {modoEdicao
                    ? "Editar exercício"
                    : "Novo exercício"}
                </h2>
              </div>

              <button
                onClick={() =>
                  setModalExercicio(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={salvarExercicio}
              className="treino-modal-body"
            >
              <label>
                <span>Nome do exercício</span>

                <input
                  type="text"
                  placeholder="Ex: Supino reto"
                  value={formExercicio.nome}
                  onChange={(e) =>
                    setFormExercicio({
                      ...formExercicio,
                      nome: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span>Grupo muscular</span>

                <select
                  value={
                    formExercicio.grupoMuscular
                  }
                  onChange={(e) =>
                    setFormExercicio({
                      ...formExercicio,
                      grupoMuscular:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  <option>Peito</option>
                  <option>Costas</option>
                  <option>Ombros</option>
                  <option>Bíceps</option>
                  <option>Tríceps</option>
                  <option>Quadríceps</option>
                  <option>Posterior</option>
                  <option>Glúteos</option>
                  <option>Panturrilha</option>
                  <option>Abdômen</option>
                  <option>Cardio</option>
                </select>
              </label>

              <label>
                <span>Descrição</span>

                <textarea
                  placeholder="Descrição do exercício..."
                  value={
                    formExercicio.descricao
                  }
                  onChange={(e) =>
                    setFormExercicio({
                      ...formExercicio,
                      descricao:
                        e.target.value,
                    })
                  }
                />
              </label>

              <div className="treino-modal-footer">
                <button
                  type="button"
                  className="treino-btn treino-btn-secondary"
                  onClick={() =>
                    setModalExercicio(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="treino-btn treino-btn-primary"
                >
                  <Save size={16} />

                  {modoEdicao
                    ? "Salvar alterações"
                    : "Criar exercício"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </main>
  );
}

export default Treinos;