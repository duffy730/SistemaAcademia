import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  Droplets,
  Dumbbell,
  Flame,
  Leaf,
  LoaderCircle,
  Plus,
  Printer,
  Scale,
  Sparkles,
  Utensils,
  Wheat,
} from "lucide-react";

import PlanoNutricaoModal from "../../components/NutricaoModal/PlanoNutricaoModal";
import "./Nutricao.css";

const API_URL = "https://localhost:5000/api";

const ABAS = [
  "Resumo",
  "Plano Alimentar",
  "Histórico",
];

function authConfig() {
  const token = localStorage.getItem("token");

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
}

function normalizarLista(resposta) {
  const dados = resposta?.data;

  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.dados)) return dados.dados;
  if (Array.isArray(dados?.items)) return dados.items;

  return [];
}

function nomeAluno(aluno) {
  return aluno?.nome ?? aluno?.name ?? "Aluno sem nome";
}

function matriculaAluno(aluno) {
  const id =
    aluno?.matriculaId ??
    aluno?.matricula?.id ??
    aluno?.matricula ??
    aluno?.id;

  return id
    ? `Matrícula #${String(id).padStart(6, "0")}`
    : "Sem matrícula";
}

function formatarNumero(valor, casas = 0) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function formatarData(valor) {
  if (!valor) return "-";
  return new Date(valor).toLocaleDateString("pt-BR");
}

export default function Nutricao() {
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState("");
  const [plano, setPlano] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("Resumo");
  const [erro, setErro] = useState("");
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const [carregandoPlano, setCarregandoPlano] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarAlunos();
  }, []);

  useEffect(() => {
    if (!alunoId) {
      setPlano(null);
      return;
    }

    carregarPlano(alunoId);
  }, [alunoId]);

  async function carregarAlunos() {
  try {
    setCarregandoAlunos(true);
    setErro("");

    const [respostaAlunos, respostaMatriculas] =
      await Promise.all([
        axios.get(
          `${API_URL}/alunos/listar`,
          authConfig()
        ),

        axios.get(
          `${API_URL}/matriculas/listar`,
          authConfig()
        ),
      ]);

    const listaAlunos = normalizarLista(respostaAlunos);
    const listaMatriculas = normalizarLista(
      respostaMatriculas
    );

    const matriculasAtivas = listaMatriculas.filter(
      matriculaEstaAtiva
    );

    const alunosComMatriculaAtiva = listaAlunos
      .map((aluno) => {
        const matriculaAtiva = matriculasAtivas.find(
          (matricula) =>
            String(
              matricula.alunoId ??
                matricula.aluno?.id
            ) === String(aluno.id)
        );

        if (!matriculaAtiva) {
          return null;
        }

        return {
          ...aluno,
          matriculaId: matriculaAtiva.id,
          matricula: matriculaAtiva,
        };
      })
      .filter(Boolean)
      .sort((alunoA, alunoB) =>
        nomeAluno(alunoA).localeCompare(
          nomeAluno(alunoB),
          "pt-BR",
          {
            sensitivity: "base",
          }
        )
      );

    setAlunos(alunosComMatriculaAtiva);

    if (alunosComMatriculaAtiva.length > 0) {
      setAlunoId(
        String(alunosComMatriculaAtiva[0].id)
      );
    } else {
      setAlunoId("");
      setPlano(null);
    }
  } catch (error) {
    console.error(
      "Erro ao carregar alunos ativos:",
      error.response?.data ?? error
    );

    setErro(
      "Não foi possível carregar os alunos com matrícula ativa."
    );

    setAlunos([]);
    setAlunoId("");
  } finally {
    setCarregandoAlunos(false);
  }
}

  async function carregarPlano(id) {
    try {
      setCarregandoPlano(true);
      setErro("");

      const resposta = await axios.get(
        `${API_URL}/nutricao/aluno/${id}`,
        authConfig()
      );

      setPlano(resposta.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setPlano(null);
        return;
      }

      console.error(
        "Erro ao carregar plano nutricional:",
        error.response?.data ?? error
      );

      setErro("Não foi possível carregar o plano nutricional.");
    } finally {
      setCarregandoPlano(false);
    }
  }

  async function salvarPlano(dados) {
    try {
      setSalvando(true);

      const resposta = plano?.id
        ? await axios.put(
            `${API_URL}/nutricao/${plano.id}`,
            dados,
            authConfig()
          )
        : await axios.post(
            `${API_URL}/nutricao`,
            dados,
            authConfig()
          );

      setPlano(resposta.data);
      setModalAberto(false);
    } catch (error) {
      const mensagem =
        error.response?.data?.mensagem ??
        error.response?.data?.message ??
        "Não foi possível salvar o plano nutricional.";

      throw new Error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  const alunosFiltrados = alunos;

  const alunoSelecionado = useMemo(
    () => alunos.find((aluno) => String(aluno.id) === String(alunoId)),
    [alunos, alunoId]
  );

  const medidas = useMemo(
    () =>
      [...(plano?.medidas ?? [])].sort(
        (a, b) => new Date(a.data) - new Date(b.data)
      ),
    [plano]
  );

  const observacoes = useMemo(
    () =>
      String(plano?.observacoes ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [plano]
  );

  const macros = [
    {
      titulo: "Calorias Diárias",
      valor: `${formatarNumero(plano?.caloriasMeta)} kcal`,
      meta: `Meta: ${formatarNumero(plano?.caloriasMeta)} kcal`,
      classe: "verde",
      icone: <Flame size={22} />,
    },
    {
      titulo: "Proteínas",
      valor: `${formatarNumero(plano?.proteinasMeta)} g`,
      meta: `Meta: ${formatarNumero(plano?.proteinasMeta)} g`,
      classe: "azul",
      icone: <Dumbbell size={22} />,
    },
    {
      titulo: "Carboidratos",
      valor: `${formatarNumero(plano?.carboidratosMeta)} g`,
      meta: `Meta: ${formatarNumero(plano?.carboidratosMeta)} g`,
      classe: "amarelo",
      icone: <Wheat size={22} />,
    },
    {
      titulo: "Gorduras",
      valor: `${formatarNumero(plano?.gordurasMeta)} g`,
      meta: `Meta: ${formatarNumero(plano?.gordurasMeta)} g`,
      classe: "roxo",
      icone: <Droplets size={22} />,
    },
    {
      titulo: "Água",
      valor: `${formatarNumero(plano?.aguaMetaLitros, 1)} L`,
      meta: `Meta: ${formatarNumero(plano?.aguaMetaLitros, 1)} L`,
      classe: "ciano",
      icone: <Droplets size={22} />,
    },
  ];

  function matriculaEstaAtiva(matricula) {
  const status = String(matricula?.status ?? "")
    .trim()
    .toLowerCase();

  if (matricula?.ativa === true) {
    return true;
  }

  return status === "ativa" || status === "ativo";
}

  function PlanoAlimentar() {
    const refeicoes = plano?.refeicoes ?? [];

    return (
      <section className="nutricao-card nutricao-plano">
        <header className="nutricao-card-header">
          <div>
            <h2>Plano Alimentar</h2>
            <p>Refeições e quantidades definidas para o aluno.</p>
          </div>

          <span className="nutricao-data">
            {formatarData(plano?.dataInicio)}
          </span>
        </header>

        <div className="nutricao-tabela-wrapper">
          <table className="nutricao-tabela">
            <thead>
              <tr>
                <th>Refeição</th>
                <th>Alimentos</th>
                <th>Quantidade</th>
                <th>Calorias</th>
              </tr>
            </thead>

            <tbody>
              {refeicoes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="nutricao-vazio-tabela">
                    Nenhuma refeição cadastrada.
                  </td>
                </tr>
              ) : (
                refeicoes.map((refeicao, indice) => (
                  <tr key={refeicao.id ?? `${refeicao.nome}-${indice}`}>
                    <td>
                      <div className="nutricao-refeicao">
                        <span className={`ponto ponto-${indice % 6}`} />
                        <div>
                          <strong>{refeicao.nome}</strong>
                          <small>{refeicao.horario || "--:--"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="nutricao-lista">
                        {String(refeicao.alimentos ?? "")
                          .split("\n")
                          .filter(Boolean)
                          .map((item) => (
                            <span key={item}>• {item}</span>
                          ))}
                      </div>
                    </td>

                    <td>
                      <div className="nutricao-lista">
                        {String(refeicao.quantidades ?? "")
                          .split("\n")
                          .filter(Boolean)
                          .map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                      </div>
                    </td>

                    <td>
                      <strong>{formatarNumero(refeicao.calorias)} kcal</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {refeicoes.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="2">Total do dia</td>
                  <td className="texto-azul">
                    {formatarNumero(plano?.proteinasMeta)}g proteína
                  </td>
                  <td className="texto-verde">
                    {formatarNumero(plano?.caloriasMeta)} kcal
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    );
  }

  function ObservacoesSuplementos() {
    return (
      <section className="nutricao-grid-inferior">
        <article className="nutricao-card">
          <header className="nutricao-card-header">
            <div>
              <h2>Observações</h2>
              <p>Orientações gerais do plano.</p>
            </div>
          </header>

          {observacoes.length === 0 ? (
            <div className="nutricao-empty pequeno">
              <Leaf size={24} />
              <span>Nenhuma observação cadastrada.</span>
            </div>
          ) : (
            <ul className="nutricao-observacoes">
              {observacoes.map((observacao) => (
                <li key={observacao}>{observacao}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="nutricao-card">
          <header className="nutricao-card-header">
            <div>
              <h2>Suplementos Sugeridos</h2>
              <p>Suplementação associada ao plano.</p>
            </div>
          </header>

          <div className="nutricao-suplementos">
            {(plano?.suplementos ?? []).length === 0 ? (
              <div className="nutricao-empty pequeno">
                <Sparkles size={24} />
                <span>Nenhum suplemento cadastrado.</span>
              </div>
            ) : (
              plano.suplementos.map((suplemento) => (
                <div
                  className="nutricao-suplemento"
                  key={suplemento.id ?? suplemento.nome}
                >
                  <span>
                    <Sparkles size={16} />
                  </span>

                  <div>
                    <strong>{suplemento.nome}</strong>
                    <small>{suplemento.dosagem}</small>
                  </div>

                  <b>✓</b>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    );
  }

  function conteudoAba() {
    if (!plano) return null;

    if (abaAtiva === "Plano Alimentar") return <PlanoAlimentar />;

    if (abaAtiva === "Histórico") {
      return (
        <section className="nutricao-card nutricao-historico">

          <div className="nutricao-historico-lista">
            {medidas.length === 0 ? (
              <div className="nutricao-empty">
                <Scale size={36} />
                <strong>Nenhum histórico disponível</strong>
              </div>
            ) : (
              [...medidas].reverse().map((medida) => (
                <div
                  className="nutricao-historico-item"
                  key={medida.id ?? medida.data}
                >
                  <span>{formatarData(medida.data)}</span>
                  <strong>{formatarNumero(medida.peso, 1)} kg</strong>
                  <span>Cintura: {formatarNumero(medida.cintura, 1)} cm</span>
                  <span>Braço: {formatarNumero(medida.braco, 1)} cm</span>
                  <span>Peito: {formatarNumero(medida.peito, 1)} cm</span>
                </div>
              ))
            )}
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="nutricao-macros">
          {macros.map((macro) => (
            <article
              className={`nutricao-macro ${macro.classe}`}
              key={macro.titulo}
            >
              <div className="nutricao-macro-topo">
                <span>{macro.icone}</span>
                <div>
                  <small>{macro.titulo}</small>
                  <strong>{macro.valor}</strong>
                </div>
              </div>

              <div className="nutricao-macro-meta">
                <small>{macro.meta}</small>
                <b>100%</b>
              </div>

              <div className="nutricao-progresso">
                <span />
              </div>
            </article>
          ))}
        </section>
        <PlanoAlimentar />
        <ObservacoesSuplementos />
      </>
    );
  }

  return (
    <main className="nutricao-page">
      <header className="nutricao-page-header">
        <div>
          <h1>Nutrição Virtual</h1>
          <p>Acompanhe planos alimentares e evolução dos alunos.</p>
        </div>

        <div className="nutricao-actions">
          <button
            type="button"
            className="nutricao-button-primary"
            onClick={() => setModalAberto(true)}
            disabled={!alunoSelecionado}
          >
            <Plus size={18} />
            {plano ? "Editar Plano" : "Novo Plano"}
          </button>

          <button
            type="button"
            className="nutricao-button-outline"
            onClick={() => window.print()}
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </header>

      {erro && <div className="nutricao-alerta">{erro}</div>}

      <section className="nutricao-filtros">
        <div className="nutricao-aluno-select">
          <div className="nutricao-avatar">
            {nomeAluno(alunoSelecionado)
              .split(" ")
              .slice(0, 2)
              .map((parte) => parte[0])
              .join("") || "AL"}
          </div>

          <div>
            <strong>{nomeAluno(alunoSelecionado)}</strong>
            <span>{alunoSelecionado?.matriculaId ? `Matrícula: #${alunoSelecionado.matriculaId}` : "Sem matrícula ativa"}</span>
          </div>

          <ChevronDown size={16} />

          <select
            value={alunoId}
            onChange={(event) => setAlunoId(event.target.value)}
            disabled={carregandoAlunos}
          >
            <option value="" disabled>
              {carregandoAlunos ? "Carregando..." : "Selecione um aluno"}
            </option>

            {alunosFiltrados.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {nomeAluno(aluno)}
              </option>
            ))}
          </select>
        </div>

        <nav className="nutricao-tabs">
          {ABAS.map((aba) => (
            <button
              type="button"
              key={aba}
              className={abaAtiva === aba ? "ativa" : ""}
              onClick={() => setAbaAtiva(aba)}
            >
              {aba}
            </button>
          ))}
        </nav>
      </section>

      {carregandoPlano ? (
        <div className="nutricao-carregando">
          <LoaderCircle size={31} className="girando" />
          <span>Carregando plano nutricional...</span>
        </div>
      ) : !alunoSelecionado ? (
        <div className="nutricao-empty nutricao-empty-principal">
          <Scale size={43} />
          <strong>Selecione um aluno</strong>
        </div>
      ) : !plano ? (
        <div className="nutricao-empty nutricao-empty-principal">
          <Utensils size={45} />
          <strong>Este aluno ainda não possui um plano nutricional</strong>
          <span>Cadastre metas, refeições e suplementação.</span>

          <button
            type="button"
            className="nutricao-button-primary"
            onClick={() => setModalAberto(true)}
          >
            <Plus size={18} />
            Criar primeiro plano
          </button>
        </div>
      ) : (
        conteudoAba()
      )}

      {modalAberto && alunoSelecionado && (
        <PlanoNutricaoModal
          aluno={alunoSelecionado}
          plano={plano}
          salvar={salvarPlano}
          fechar={() => setModalAberto(false)}
          salvando={salvando}
        />
      )}
    </main>
  );
}