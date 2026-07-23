import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CreditCard, DollarSign, Download, Edit3, Eye, Filter,
  MoreHorizontal, Plus, Search, Trash2, WalletCards, X
} from "lucide-react";

import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import PagamentoModal from "../../components/PagamentoModal/PagamentoModal";
import "./Pagamentos.css";

const ITENS_POR_PAGINA = 8;

const ROTAS = {
  listarPagamentos: "/pagamentos/listar",
  criarPagamento: "/pagamentos/criar-pagamento",
  atualizarPagamento: (id) => `/pagamentos/atualizar-pagamento/${id}`,
  removerPagamento: (id) => `/pagamentos/remover-pagamento/${id}`,
  listarMatriculas: "/matriculas/listar",
  listarProdutos: "/produtos/listar",
  listarPlanos: "/planos/listar",
};

function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [metodoFiltro, setMetodoFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("criar");
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [menuAberto, setMenuAberto] = useState(null);
  const [pagamentoParaExcluir, setPagamentoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("acao") !== "novo") return;

    setModalAberto(true);

    const novosParametros = new URLSearchParams(searchParams);
    novosParametros.delete("acao");

    setSearchParams(novosParametros, {
      replace: true,
    });
  }, [searchParams, setSearchParams]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        pagamentosResponse,
        matriculasResponse,
        produtosResponse,
        planosResponse,
      ] = await Promise.all([
        api.get(ROTAS.listarPagamentos),
        api.get(ROTAS.listarMatriculas),
        api.get(ROTAS.listarProdutos),
        api.get(ROTAS.listarPlanos),
      ]);

      setPagamentos(Array.isArray(pagamentosResponse.data) ? pagamentosResponse.data : []);
      setMatriculas(Array.isArray(matriculasResponse.data) ? matriculasResponse.data : []);
      setProdutos(Array.isArray(produtosResponse.data) ? produtosResponse.data : []);
      setPlanos(Array.isArray(planosResponse.data) ? planosResponse.data : []);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error.response?.data ?? error.message);
      setErro("Não foi possível carregar os pagamentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, metodoFiltro, tipoFiltro, dataInicial, dataFinal]);

  const pagamentosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return pagamentos.filter((pagamento) => {
      const matricula = obterMatricula(pagamento, matriculas);
      const produto = obterProduto(pagamento, produtos);
      const tipo = obterTipoPagamento(pagamento);
      const metodo = normalizarTexto(pagamento.metodoPagamento ?? pagamento.metodo);

      const texto = normalizarTexto([
        obterNomeAluno(pagamento, matricula),
        obterNomeOrigem(pagamento, matricula, produto),
        pagamento.descricao,
        pagamento.id,
        pagamento.matriculaId,
      ].join(" "));

      const data = converterParaData(pagamento.dataPagamento);

      return (
        (!termo || texto.includes(termo)) &&
        (metodoFiltro === "todos" || metodo === normalizarTexto(metodoFiltro)) &&
        (tipoFiltro === "todos" || tipo === tipoFiltro) &&
        (!dataInicial || (data && data >= criarDataLocal(dataInicial))) &&
        (!dataFinal || (data && data <= fimDoDia(criarDataLocal(dataFinal))))
      );
    });
  }, [
    pagamentos, matriculas, produtos, busca,
    metodoFiltro, tipoFiltro, dataInicial, dataFinal
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(pagamentosFiltrados.length / ITENS_POR_PAGINA)
  );

  const pagamentosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return pagamentosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [pagamentosFiltrados, paginaAtual]);

  const estatisticas = useMemo(() => {
    const faturamento = pagamentos.reduce(
      (soma, pagamento) => soma + Number(pagamento.valor ?? 0),
      0
    );

    const hoje = new Date();
    const pagamentosEsteMes = pagamentos.filter((pagamento) => {
      const data = converterParaData(pagamento.dataPagamento);
      return data &&
        data.getMonth() === hoje.getMonth() &&
        data.getFullYear() === hoje.getFullYear();
    }).length;

    return {
      faturamento,
      total: pagamentos.length,
      pagamentosEsteMes,
      ticketMedio: pagamentos.length ? faturamento / pagamentos.length : 0,
    };
  }, [pagamentos]);

  function abrirCadastro() {
    setPagamentoSelecionado(null);
    setModoModal("criar");
    abrirCadastro();
  }

  function abrirVisualizacao(pagamento) {
    setPagamentoSelecionado(pagamento);
    setModoModal("visualizar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function abrirEdicao(pagamento) {
    setPagamentoSelecionado(pagamento);
    setModoModal("editar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setPagamentoSelecionado(null);
  }

  async function salvarPagamento(dados) {
    try {
      setSalvando(true);
      setErro("");

      if (modoModal === "editar" && pagamentoSelecionado) {
        await api.put(
          ROTAS.atualizarPagamento(pagamentoSelecionado.id),
          dados
        );
      } else {
        await api.post(ROTAS.criarPagamento, dados);
      }

      await carregarDados();
      setModalAberto(false);
      setPagamentoSelecionado(null);
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error.response?.data ?? error.message);
      throw new Error(
        obterMensagemErro(error) || "Não foi possível salvar o pagamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirExclusao(pagamento) {
    setPagamentoParaExcluir(pagamento);
    setMenuAberto(null);
  }

  function fecharExclusao() {
    if (!excluindo) setPagamentoParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!pagamentoParaExcluir) return;

    try {
      setExcluindo(true);
      setErro("");

      await api.delete(ROTAS.removerPagamento(pagamentoParaExcluir.id));

      setPagamentoParaExcluir(null);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error.response?.data ?? error.message);
      setErro(
        obterMensagemErro(error) || "Não foi possível excluir o pagamento."
      );
    } finally {
      setExcluindo(false);
    }
  }

  function limparFiltros() {
    setBusca("");
    setMetodoFiltro("todos");
    setTipoFiltro("todos");
    setDataInicial("");
    setDataFinal("");
  }

  function mudarPagina(novaPagina) {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  }

  function exportarCSV() {
    if (!pagamentosFiltrados.length) return;

    const cabecalho = [
      "ID", "Aluno", "Matrícula", "Tipo", "Plano ou produto",
      "Quantidade", "Descrição", "Valor", "Método", "Data"
    ];

    const linhas = pagamentosFiltrados.map((pagamento) => {
      const matricula = obterMatricula(pagamento, matriculas);
      const produto = obterProduto(pagamento, produtos);

      return [
        pagamento.id,
        obterNomeAluno(pagamento, matricula),
        pagamento.matriculaId ?? matricula?.id ?? "",
        obterTipoPagamento(pagamento),
        obterNomeOrigem(pagamento, matricula, produto),
        pagamento.quantidade ?? "",
        pagamento.descricao,
        Number(pagamento.valor ?? 0).toFixed(2),
        pagamento.metodoPagamento ?? pagamento.metodo,
        formatarData(pagamento.dataPagamento),
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
    link.download = "pagamentos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const primeiroItem = pagamentosFiltrados.length
    ? (paginaAtual - 1) * ITENS_POR_PAGINA + 1
    : 0;

  const ultimoItem = Math.min(
    paginaAtual * ITENS_POR_PAGINA,
    pagamentosFiltrados.length
  );

  return (
    <section className="pagamentos-page">
      <header className="pagamentos-page-header">
        <div>
          <h1>Pagamentos</h1>
          <p>Acompanhe todos os pagamentos realizados na academia.</p>
        </div>

        <div className="pagamentos-page-buttons">
          <button
            type="button"
            className="pagamentos-primary-button"
            onClick={abrirCadastro}
          >
            <Plus size={19} />
            Novo pagamento
          </button>

          <button
            type="button"
            className="pagamentos-secondary-button"
            onClick={exportarCSV}
            disabled={!pagamentosFiltrados.length}
          >
            <Download size={18} />
            Exportar
            <ChevronDown size={15} />
          </button>
        </div>
      </header>

      <div className="pagamentos-stats-grid">
        <StatCard
          titulo="Faturamento total"
          valor={formatarMoeda(estatisticas.faturamento)}
          texto="Somatório dos pagamentos"
          tipo="green"
          icone={<DollarSign size={25} />}
        />
        <StatCard
          titulo="Total de pagamentos"
          valor={estatisticas.total}
          texto="Pagamentos registrados"
          tipo="blue"
          icone={<CreditCard size={25} />}
        />
        <StatCard
          titulo="Pagamentos este mês"
          valor={estatisticas.pagamentosEsteMes}
          texto="Registrados no mês atual"
          tipo="purple"
          icone={<CalendarDays size={25} />}
        />
        <StatCard
          titulo="Ticket médio"
          valor={formatarMoeda(estatisticas.ticketMedio)}
          texto="Média por pagamento"
          tipo="orange"
          icone={<WalletCards size={25} />}
        />
      </div>

      <div className="pagamentos-panel">
        <div className="pagamentos-filters">
          <div className="pagamentos-search">
            <Search size={19} />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por aluno, produto, plano ou descrição..."
            />
          </div>

          <div className="pagamentos-filter-actions">
            <Select
              value={metodoFiltro}
              onChange={setMetodoFiltro}
              options={[
                ["todos", "Todos os métodos"],
                ["PIX", "PIX"],
                ["Crédito", "Crédito"],
                ["Débito", "Débito"],
                ["Dinheiro", "Dinheiro"],
              ]}
            />

            <Select
              value={tipoFiltro}
              onChange={setTipoFiltro}
              options={[
                ["todos", "Todos os tipos"],
                ["plano", "Plano"],
                ["produto", "Produto"],
              ]}
            />

            <button
              type="button"
              className={`pagamentos-filter-button ${filtrosAbertos ? "active" : ""}`}
              onClick={() => setFiltrosAbertos((aberto) => !aberto)}
            >
              <Filter size={17} />
              Filtros
            </button>
          </div>
        </div>

        {filtrosAbertos && (
          <div className="pagamentos-extra-filters">
            <label>
              <span>Data inicial</span>
              <input
                type="date"
                value={dataInicial}
                onChange={(event) => setDataInicial(event.target.value)}
              />
            </label>

            <label>
              <span>Data final</span>
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

        {erro && <p className="pagamentos-error">{erro}</p>}

        <div className="pagamentos-table-wrapper">
          <table className="pagamentos-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Plano / produto</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Valor</th>
                <th>Método</th>
                <th>Data do pagamento</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="8" className="pagamentos-empty">
                    Carregando pagamentos...
                  </td>
                </tr>
              ) : !pagamentosPaginados.length ? (
                <tr>
                  <td colSpan="8" className="pagamentos-empty">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : (
                pagamentosPaginados.map((pagamento) => {
                  const matricula = obterMatricula(pagamento, matriculas);
                  const produto = obterProduto(pagamento, produtos);
                  const tipo = obterTipoPagamento(pagamento);

                  return (
                    <tr key={pagamento.id}>
                      <td>
                        <div className="pagamento-aluno">
                          <div className="pagamento-avatar">
                            {obterIniciais(obterNomeAluno(pagamento, matricula))}
                          </div>
                          <div>
                            <strong>{obterNomeAluno(pagamento, matricula)}</strong>
                            <span>
                              Matrícula #
                              {String(
                                pagamento.matriculaId ?? matricula?.id ?? "-"
                              ).padStart(6, "0")}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="pagamento-origem">
                          <strong>
                            {obterNomeOrigem(pagamento, matricula, produto)}
                          </strong>
                          <span className={`pagamento-tipo ${tipo}`}>
                            {tipo === "produto" ? "Produto" : "Plano"}
                          </span>
                        </div>
                      </td>

                      <td>{pagamento.descricao || "-"}</td>

                      <td>
                        {tipo === "produto"
                          ? `${pagamento.quantidade ?? 1} un.`
                          : "-"}
                      </td>

                      <td>
                        <strong>{formatarMoeda(pagamento.valor)}</strong>
                      </td>

                      <td>
                        <span
                          className={`pagamento-metodo ${obterClasseMetodo(
                            pagamento.metodoPagamento ?? pagamento.metodo
                          )}`}
                        >
                          {pagamento.metodoPagamento ?? pagamento.metodo ?? "-"}
                        </span>
                      </td>

                      <td>
                        <div className="pagamento-data">
                          <strong>{formatarData(pagamento.dataPagamento)}</strong>
                          <span>{formatarHora(pagamento.dataPagamento)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="pagamentos-row-actions">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => abrirEdicao(pagamento)}
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            className="danger"
                            type="button"
                            onClick={() => abrirExclusao(pagamento)}
                          >
                            <Trash2 size={17} />
                          </button>
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

      <div className="pagamentos-pagination">
        <p>
          Mostrando {primeiroItem} a {ultimoItem} de{" "}
          {pagamentosFiltrados.length} pagamentos
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
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
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
        <PagamentoModal
          pagamento={pagamentoSelecionado}
          matriculas={matriculas}
          produtos={produtos}
          planos={planos}
          modo={modoModal}
          fechar={fecharModal}
          salvar={salvarPagamento}
          salvando={salvando}
        />
      )}

      {pagamentoParaExcluir && (
        <div className="pagamento-delete-overlay" onMouseDown={fecharExclusao}>
          <div
            className="pagamento-delete-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pagamento-delete-close"
              onClick={fecharExclusao}
            >
              <X size={19} />
            </button>

            <div className="pagamento-delete-icon">
              <Trash2 size={25} />
            </div>

            <h2>Excluir pagamento?</h2>

            <p>
              O pagamento será apagado permanentemente. Em vendas de produto,
              a API deve devolver a quantidade ao estoque.
            </p>

            <div className="pagamento-delete-actions">
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
                {excluindo ? "Excluindo..." : "Excluir pagamento"}
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
    <article className="pagamentos-stat-card">
      <div className={`pagamentos-stat-icon ${tipo}`}>{icone}</div>
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
    <div className="pagamentos-select-wrapper">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, texto]) => (
          <option key={optionValue} value={optionValue}>
            {texto}
          </option>
        ))}
      </select>
      <ChevronDown size={16} />
    </div>
  );
}

function obterMatricula(pagamento, matriculas) {
  if (pagamento.matricula && typeof pagamento.matricula === "object") {
    return pagamento.matricula;
  }

  return matriculas.find(
    (matricula) =>
      Number(matricula.id) === Number(pagamento.matriculaId)
  );
}

function obterProduto(pagamento, produtos) {
  if (pagamento.produto && typeof pagamento.produto === "object") {
    return pagamento.produto;
  }

  return produtos.find(
    (produto) =>
      Number(produto.id) === Number(pagamento.produtoId)
  );
}

function obterNomeAluno(pagamento, matricula) {
  if (pagamento.aluno) {
    return typeof pagamento.aluno === "string"
      ? pagamento.aluno
      : pagamento.aluno.nome;
  }

  if (matricula?.aluno) {
    return typeof matricula.aluno === "string"
      ? matricula.aluno
      : matricula.aluno.nome;
  }

  return pagamento.alunoNome || matricula?.alunoNome || "Aluno não encontrado";
}

function obterTipoPagamento(pagamento) {
  const tipo = normalizarTexto(
    pagamento.tipoPagamento ?? pagamento.tipo
  );

  return (
    pagamento.produtoId ||
    pagamento.produto ||
    tipo.includes("produto")
  )
    ? "produto"
    : "plano";
}

function obterNomeOrigem(pagamento, matricula, produto) {
  if (obterTipoPagamento(pagamento) === "produto") {
    if (typeof pagamento.produto === "string") {
      return pagamento.produto;
    }

    return produto?.nome || pagamento.produtoNome || "Produto não encontrado";
  }

  if (typeof pagamento.plano === "string") {
    return pagamento.plano;
  }

  if (typeof matricula?.plano === "string") {
    return matricula.plano;
  }

  return (
    pagamento.planoNome ||
    matricula?.plano?.nome ||
    matricula?.planoNome ||
    "Plano não encontrado"
  );
}

function obterClasseMetodo(metodo) {
  const valor = normalizarTexto(metodo);

  if (valor.includes("pix")) return "pix";
  if (valor.includes("credito")) return "credito";
  if (valor.includes("debito")) return "debito";
  if (valor.includes("dinheiro")) return "dinheiro";

  return "outro";
}

function converterParaData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarData(valor) {
  const data = converterParaData(valor);
  return data ? data.toLocaleDateString("pt-BR") : "-";
}

function formatarHora(valor) {
  const texto = String(valor ?? "");

  if (!texto.includes("T") && !texto.includes(":")) return "";

  const data = converterParaData(valor);

  return data
    ? data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
}

function criarDataLocal(valor) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function fimDoDia(data) {
  const copia = new Date(data);
  copia.setHours(23, 59, 59, 999);
  return copia;
}

function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

export default Pagamentos;