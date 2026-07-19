import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Bookmark,
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import api from "../../services/api";
import PlanoModal from "../../components/PlanoModal/PlanoModal";
import "./Planos.css";

const ITENS_POR_PAGINA = 10;

/*
  Ajuste somente estas rotas caso os nomes no seu Swagger sejam diferentes.
*/
const ROTAS = {
  listar: "/planos/listar",
  criar: "/planos/criar",
  atualizar: (id) => `/planos/atualizar-plano/${id}`,
  remover: (id) => `/planos/deletar/${id}`,
};

function Planos() {
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome-asc");
  const [precoMinimo, setPrecoMinimo] = useState("");
  const [precoMaximo, setPrecoMaximo] = useState("");
  const [duracaoFiltro, setDuracaoFiltro] = useState("todas");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("criar");
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [menuAberto, setMenuAberto] = useState(null);

  const [planoParaExcluir, setPlanoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarPlanos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(ROTAS.listar);
      const dados = Array.isArray(response.data) ? response.data : [];

      setPlanos(dados);
    } catch (error) {
      console.error(
        "Erro ao carregar planos:",
        error.response?.data ?? error.message
      );

      setErro("Não foi possível carregar os planos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPlanos();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, status, ordenacao, precoMinimo, precoMaximo, duracaoFiltro]);

  const planosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const minimo = precoMinimo === "" ? null : Number(precoMinimo);
    const maximo = precoMaximo === "" ? null : Number(precoMaximo);

    const resultado = planos.filter((plano) => {
      const nome = plano.nome?.toLowerCase() ?? "";
      const descricao = plano.descricao?.toLowerCase() ?? "";
      const valor = Number(plano.valor ?? 0);
      const dias = Number(plano.duracaoDias ?? 0);
      const ativo = plano.ativo ?? true;

      const correspondeBusca =
        !termo ||
        nome.includes(termo) ||
        descricao.includes(termo) ||
        String(plano.id).includes(termo);

      const correspondeStatus =
        status === "todos" ||
        (status === "ativos" && ativo) ||
        (status === "inativos" && !ativo);

      const correspondePrecoMinimo = minimo === null || valor >= minimo;
      const correspondePrecoMaximo = maximo === null || valor <= maximo;

      const correspondeDuracao =
        duracaoFiltro === "todas" ||
        (duracaoFiltro === "mensal" && dias <= 45) ||
        (duracaoFiltro === "trimestral" && dias > 45 && dias <= 120) ||
        (duracaoFiltro === "semestral" && dias > 120 && dias < 300) ||
        (duracaoFiltro === "anual" && dias >= 300);

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondePrecoMinimo &&
        correspondePrecoMaximo &&
        correspondeDuracao
      );
    });

    return [...resultado].sort((a, b) => {
      const nomeA = a.nome?.toLowerCase() ?? "";
      const nomeB = b.nome?.toLowerCase() ?? "";
      const valorA = Number(a.valor ?? 0);
      const valorB = Number(b.valor ?? 0);
      const duracaoA = Number(a.duracaoDias ?? 0);
      const duracaoB = Number(b.duracaoDias ?? 0);

      switch (ordenacao) {
        case "nome-desc":
          return nomeB.localeCompare(nomeA);
        case "valor-asc":
          return valorA - valorB;
        case "valor-desc":
          return valorB - valorA;
        case "duracao-asc":
          return duracaoA - duracaoB;
        case "duracao-desc":
          return duracaoB - duracaoA;
        default:
          return nomeA.localeCompare(nomeB);
      }
    });
  }, [
    planos,
    busca,
    status,
    ordenacao,
    precoMinimo,
    precoMaximo,
    duracaoFiltro,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(planosFiltrados.length / ITENS_POR_PAGINA)
  );

  const planosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;

    return planosFiltrados.slice(inicio, fim);
  }, [planosFiltrados, paginaAtual]);

  const estatisticas = useMemo(() => {
    const total = planos.length;

    const ativos = planos.filter((plano) => plano.ativo ?? true).length;

    const matriculasAtivas = planos.reduce(
      (soma, plano) => soma + obterMatriculasAtivas(plano),
      0
    );

    const faturamentoMensal = planos.reduce((soma, plano) => {
      const matriculas = obterMatriculasAtivas(plano);
      const valorMensal = obterValorMensal(plano);

      return soma + matriculas * valorMensal;
    }, 0);

    return {
      total,
      ativos,
      matriculasAtivas,
      faturamentoMensal,
    };
  }, [planos]);

  function abrirCadastro() {
    setPlanoSelecionado(null);
    setModoModal("criar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function abrirVisualizacao(plano) {
    setPlanoSelecionado(plano);
    setModoModal("visualizar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function abrirEdicao(plano) {
    setPlanoSelecionado(plano);
    setModoModal("editar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
    setPlanoSelecionado(null);
  }

  async function salvarPlano(dados) {
    try {
      setSalvando(true);
      setErro("");

      if (modoModal === "editar" && planoSelecionado) {
        await api.put(ROTAS.atualizar(planoSelecionado.id), dados);
      } else {
        await api.post(ROTAS.criar, dados);
      }

      await carregarPlanos();
      setModalAberto(false);
      setPlanoSelecionado(null);
    } catch (error) {
      console.error(
        "Erro ao salvar plano:",
        error.response?.data ?? error.message
      );

      throw new Error(
        obterMensagemErro(error) || "Não foi possível salvar o plano."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirExclusao(plano) {
    setPlanoParaExcluir(plano);
    setMenuAberto(null);
  }

  function fecharExclusao() {
    if (!excluindo) {
      setPlanoParaExcluir(null);
    }
  }

  async function confirmarExclusao() {
    if (!planoParaExcluir) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await api.delete(ROTAS.remover(planoParaExcluir.id));

      setPlanoParaExcluir(null);
      await carregarPlanos();
    } catch (error) {
      console.error(
        "Erro ao excluir plano:",
        error.response?.data ?? error.message
      );

      setErro(
        obterMensagemErro(error) ||
          "Não foi possível excluir o plano. Verifique se existem matrículas vinculadas."
      );
    } finally {
      setExcluindo(false);
    }
  }

  function limparFiltros() {
    setBusca("");
    setStatus("todos");
    setOrdenacao("nome-asc");
    setPrecoMinimo("");
    setPrecoMaximo("");
    setDuracaoFiltro("todas");
  }

  function mudarPagina(novaPagina) {
    if (novaPagina < 1 || novaPagina > totalPaginas) {
      return;
    }

    setPaginaAtual(novaPagina);
  }

  function exportarCSV() {
    if (planosFiltrados.length === 0) {
      return;
    }

    const cabecalho = [
      "ID",
      "Nome",
      "Descrição",
      "Valor",
      "Duração em dias",
      "Matrículas ativas",
      "Status",
    ];

    const linhas = planosFiltrados.map((plano) => [
      plano.id,
      plano.nome,
      plano.descricao,
      Number(plano.valor ?? 0).toFixed(2),
      plano.duracaoDias,
      obterMatriculasAtivas(plano),
      plano.ativo ?? true ? "Ativo" : "Inativo",
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
    link.download = "planos.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const primeiroItem =
    planosFiltrados.length === 0
      ? 0
      : (paginaAtual - 1) * ITENS_POR_PAGINA + 1;

  const ultimoItem = Math.min(
    paginaAtual * ITENS_POR_PAGINA,
    planosFiltrados.length
  );

  return (
    <section className="planos-page">
      <div className="planos-page-header">
        <div>
          <h1>Planos</h1>
          <p>Gerencie os planos disponíveis na academia.</p>
        </div>

        <div className="planos-page-buttons">
          <button
            type="button"
            className="planos-primary-button"
            onClick={abrirCadastro}
          >
            <Plus size={19} />
            Novo plano
          </button>

          <button
            type="button"
            className="planos-secondary-button"
            onClick={exportarCSV}
            disabled={planosFiltrados.length === 0}
          >
            <Download size={18} />
            Exportar
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      <div className="planos-stats-grid">
        <StatCard
          titulo="Total de planos"
          valor={estatisticas.total}
          texto="Planos cadastrados"
          tipo="green"
          icone={<Bookmark size={25} />}
        />

        <StatCard
          titulo="Planos ativos"
          valor={estatisticas.ativos}
          texto="Disponíveis para matrícula"
          tipo="blue"
          icone={<BadgeDollarSign size={25} />}
        />

        <StatCard
          titulo="Matrículas ativas"
          valor={estatisticas.matriculasAtivas}
          texto="Vinculadas aos planos"
          tipo="purple"
          icone={<CalendarCheck2 size={25} />}
        />

        <StatCard
          titulo="Faturamento mensal"
          valor={formatarMoeda(estatisticas.faturamentoMensal)}
          texto="Estimativa pelos planos"
          tipo="orange"
          icone={<BadgeDollarSign size={25} />}
        />
      </div>

      <div className="planos-panel">
        <div className="planos-filters">
          <div className="planos-search">
            <Search size={19} />

            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar plano por nome ou descrição..."
            />
          </div>

          <div className="planos-filter-actions">
            <div className="planos-select-wrapper planos-order-select">
              <select
                value={ordenacao}
                onChange={(event) => setOrdenacao(event.target.value)}
              >
                <option value="nome-asc">Ordenar por: Nome (A-Z)</option>
                <option value="nome-desc">Ordenar por: Nome (Z-A)</option>
                <option value="valor-asc">Menor valor</option>
                <option value="valor-desc">Maior valor</option>
                <option value="duracao-asc">Menor duração</option>
                <option value="duracao-desc">Maior duração</option>
              </select>
              <ChevronDown size={16} />
            </div>

            <button
              type="button"
              className={`planos-filter-button ${
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
          <div className="planos-extra-filters">
            <label>
              <span>Valor mínimo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precoMinimo}
                onChange={(event) => setPrecoMinimo(event.target.value)}
                placeholder="R$ 0,00"
              />
            </label>

            <label>
              <span>Valor máximo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precoMaximo}
                onChange={(event) => setPrecoMaximo(event.target.value)}
                placeholder="R$ 999,00"
              />
            </label>

            <label>
              <span>Duração</span>
              <select
                value={duracaoFiltro}
                onChange={(event) => setDuracaoFiltro(event.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="mensal">Até 45 dias</option>
                <option value="trimestral">Até 4 meses</option>
                <option value="semestral">Até 10 meses</option>
                <option value="anual">Anual</option>
              </select>
            </label>

            <button type="button" onClick={limparFiltros}>
              <X size={16} />
              Limpar filtros
            </button>
          </div>
        )}

        {erro && <p className="planos-error">{erro}</p>}

        <div className="planos-table-wrapper">
          <table className="planos-table">
            <thead>
              <tr>
                <th>Plano</th>
                <th>Duração</th>
                <th>Valor</th>
                <th>Matrículas ativas</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="6" className="planos-empty">
                    Carregando planos...
                  </td>
                </tr>
              ) : planosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="planos-empty">
                    Nenhum plano encontrado.
                  </td>
                </tr>
              ) : (
                planosPaginados.map((plano, index) => {
                  const matriculasAtivas = obterMatriculasAtivas(plano);
                  const totalMatriculas = Math.max(
                    1,
                    estatisticas.matriculasAtivas
                  );

                  const percentual = Math.min(
                    100,
                    (matriculasAtivas / totalMatriculas) * 100
                  );

                  const tema = obterTemaPlano(plano, index);
                  const ativo = plano.ativo ?? true;

                  return (
                    <tr key={plano.id}>
                      <td>
                        <div className="plano-profile">
                          <div className={`plano-icon ${tema}`}>
                            {obterIconePlano(plano)}
                          </div>

                          <div>
                            <strong>{plano.nome}</strong>
                            <p>{plano.descricao || "Sem descrição cadastrada."}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="plano-duration">
                          <strong>{formatarDuracaoPrincipal(plano.duracaoDias)}</strong>
                          <span>{plano.duracaoDias} dias</span>
                        </div>
                      </td>

                      <td>
                        <div className="plano-price">
                          <strong>{formatarMoeda(plano.valor)}</strong>
                          <span>{obterPeriodicidade(plano.duracaoDias)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="plano-enrollments">
                          <strong>{matriculasAtivas}</strong>
                          <span>{percentual.toFixed(1)}% do total</span>

                          <div className="plano-progress">
                            <span
                              className={tema}
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="planos-row-actions">
                          <div className="plano-more-wrapper">
                            <button
                              type="button"
                              onClick={() => abrirExclusao(plano)}
                            >
                              <Trash2 size={17} />
                            </button>
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

      <div className="planos-pagination">
        <p>
          Mostrando {primeiroItem} a {ultimoItem} de {planosFiltrados.length}{" "}
          planos
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
        <PlanoModal
          plano={planoSelecionado}
          modo={modoModal}
          fechar={fecharModal}
          salvar={salvarPlano}
          salvando={salvando}
        />
      )}

      {planoParaExcluir && (
        <div
          className="plano-delete-overlay"
          onMouseDown={fecharExclusao}
        >
          <div
            className="plano-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-excluir-plano"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="plano-delete-close"
              onClick={fecharExclusao}
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div className="plano-delete-icon">
              <Trash2 size={25} />
            </div>

            <h2 id="titulo-excluir-plano">Excluir plano?</h2>

            <p>
              Você está prestes a excluir{" "}
              <strong>{planoParaExcluir.nome}</strong>. Essa ação não poderá ser
              desfeita.
            </p>

            <div className="plano-delete-actions">
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
                className="confirm"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                <Trash2 size={17} />
                {excluindo ? "Excluindo..." : "Excluir plano"}
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
    <article className="planos-stat-card">
      <div className={`planos-stat-icon ${tipo}`}>{icone}</div>

      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
        <small>{texto}</small>
      </div>
    </article>
  );
}

function obterMatriculasAtivas(plano) {
  if (Number.isFinite(Number(plano.matriculasAtivas))) {
    return Number(plano.matriculasAtivas);
  }

  if (Array.isArray(plano.matriculas)) {
    return plano.matriculas.filter((matricula) => matricula.ativa).length;
  }

  return 0;
}

function obterValorMensal(plano) {
  const valor = Number(plano.valor ?? 0);
  const dias = Number(plano.duracaoDias ?? 30);
  const meses = Math.max(1, Math.round(dias / 30));

  return valor / meses;
}

function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDuracaoPrincipal(dias) {
  const quantidadeDias = Number(dias ?? 0);

  if (quantidadeDias >= 360) {
    const anos = Math.max(1, Math.round(quantidadeDias / 365));
    return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  }

  if (quantidadeDias >= 30) {
    const meses = Math.max(1, Math.round(quantidadeDias / 30));
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }

  return `${quantidadeDias} ${quantidadeDias === 1 ? "dia" : "dias"}`;
}

function obterPeriodicidade(dias) {
  const quantidadeDias = Number(dias ?? 0);

  if (quantidadeDias >= 300) {
    return "por ano";
  }

  if (quantidadeDias <= 45) {
    return "por mês";
  }

  return "por período";
}

function obterTemaPlano(plano, index) {
  const nome = plano.nome?.toLowerCase() ?? "";

  if (nome.includes("básico") || nome.includes("premium")) {
    return "green";
  }

  if (nome.includes("anual")) {
    return "purple";
  }

  if (nome.includes("trimestral")) {
    return "blue";
  }

  if (nome.includes("black") || nome.includes("basico")) {
    return "orange";
  }

  return ["green", "purple", "blue", "orange"][index % 4];
}

function obterIconePlano(plano) {
  const nome = plano.nome?.toLowerCase() ?? "";

  if (nome.includes("black") || nome.includes("premium")) {
    return <Crown size={26} />;
  }

  if (nome.includes("anual")) {
    return <CalendarCheck2 size={25} />;
  }

  if (nome.includes("mensal")) {
    return <CalendarDays size={25} />;
  }

  return <UserRound size={25} />;
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

function obterMensagemErro(error) {
  const dados = error.response?.data;

  if (typeof dados === "string") {
    return dados;
  }

  return dados?.mensagem || dados?.message || "";
}

export default Planos;
