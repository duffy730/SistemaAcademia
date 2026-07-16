import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Dumbbell,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import api from "../../services/api";
import ProdutoModal from "../../components/ProdutoModal/ProdutoModal";
import "./Produtos.css";

const ITENS_POR_PAGINA = 8;
const LIMITE_ESTOQUE_BAIXO = 10;

const ROTAS = {
  listar: "/produtos/listar",
  criar: "/produtos/criar",
  atualizar: (id) => `/produtos/atualizar-produto/${id}`,
  remover: (id) => `/produtos/deletar/${id}`,
};

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome-asc");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [precoMinimo, setPrecoMinimo] = useState("");
  const [precoMaximo, setPrecoMaximo] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("criar");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [menuAberto, setMenuAberto] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(ROTAS.listar);
      setProdutos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(
        "Erro ao carregar produtos:",
        error.response?.data ?? error.message
      );
      setErro("Não foi possível carregar os produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [
    busca,
    tipoFiltro,
    statusFiltro,
    ordenacao,
    precoMinimo,
    precoMaximo,
  ]);

  const tiposDisponiveis = useMemo(() => {
    return [
      ...new Set(
        produtos
          .map((produto) => produto.tipo?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    const minimo = precoMinimo === "" ? null : Number(precoMinimo);
    const maximo = precoMaximo === "" ? null : Number(precoMaximo);

    const filtrados = produtos.filter((produto) => {
      const nome = normalizarTexto(produto.nome);
      const tipo = normalizarTexto(produto.tipo);
      const preco = obterPreco(produto);
      const estoque = obterEstoque(produto);
      const status = obterStatusProduto(estoque);

      return (
        (!termo ||
          nome.includes(termo) ||
          tipo.includes(termo) ||
          String(produto.id).includes(termo)) &&
        (tipoFiltro === "todos" ||
          normalizarTexto(tipoFiltro) === tipo) &&
        (statusFiltro === "todos" ||
          statusFiltro === status.chave) &&
        (minimo === null || preco >= minimo) &&
        (maximo === null || preco <= maximo)
      );
    });

    return [...filtrados].sort((a, b) => {
      const nomeA = normalizarTexto(a.nome);
      const nomeB = normalizarTexto(b.nome);
      const precoA = obterPreco(a);
      const precoB = obterPreco(b);
      const estoqueA = obterEstoque(a);
      const estoqueB = obterEstoque(b);

      switch (ordenacao) {
        case "nome-desc":
          return nomeB.localeCompare(nomeA);
        case "preco-asc":
          return precoA - precoB;
        case "preco-desc":
          return precoB - precoA;
        case "estoque-asc":
          return estoqueA - estoqueB;
        case "estoque-desc":
          return estoqueB - estoqueA;
        default:
          return nomeA.localeCompare(nomeB);
      }
    });
  }, [
    produtos,
    busca,
    tipoFiltro,
    statusFiltro,
    ordenacao,
    precoMinimo,
    precoMaximo,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA)
  );

  const produtosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return produtosFiltrados.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [produtosFiltrados, paginaAtual]);

  const estatisticas = useMemo(() => {
    const estoqueTotal = produtos.reduce(
      (soma, produto) => soma + obterEstoque(produto),
      0
    );

    const valorTotal = produtos.reduce(
      (soma, produto) =>
        soma + obterPreco(produto) * obterEstoque(produto),
      0
    );

    const estoqueBaixo = produtos.filter((produto) => {
      const estoque = obterEstoque(produto);
      return estoque > 0 && estoque <= LIMITE_ESTOQUE_BAIXO;
    }).length;

    return {
      total: produtos.length,
      estoqueTotal,
      valorTotal,
      estoqueBaixo,
    };
  }, [produtos]);

  function abrirCadastro() {
    setProdutoSelecionado(null);
    setModoModal("criar");
    setModalAberto(true);
  }

  function abrirVisualizacao(produto) {
    setProdutoSelecionado(produto);
    setModoModal("visualizar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function abrirEdicao(produto) {
    setProdutoSelecionado(produto);
    setModoModal("editar");
    setModalAberto(true);
    setMenuAberto(null);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setProdutoSelecionado(null);
  }

  async function salvarProduto(dados) {
    try {
      setSalvando(true);
      setErro("");

      if (modoModal === "editar" && produtoSelecionado) {
        await api.put(
          ROTAS.atualizar(produtoSelecionado.id),
          dados
        );
      } else {
        await api.post(ROTAS.criar, dados);
      }

      await carregarProdutos();
      setModalAberto(false);
      setProdutoSelecionado(null);
    } catch (error) {
      console.error(
        "Erro ao salvar produto:",
        error.response?.data ?? error.message
      );

      throw new Error(
        obterMensagemErro(error) ||
          "Não foi possível salvar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirExclusao(produto) {
    setProdutoParaExcluir(produto);
    setMenuAberto(null);
  }

  function fecharExclusao() {
    if (!excluindo) setProdutoParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!produtoParaExcluir) return;

    try {
      setExcluindo(true);
      setErro("");

      await api.delete(
        ROTAS.remover(produtoParaExcluir.id)
      );

      setProdutoParaExcluir(null);
      await carregarProdutos();
    } catch (error) {
      console.error(
        "Erro ao excluir produto:",
        error.response?.data ?? error.message
      );

      setErro(
        obterMensagemErro(error) ||
          "Não foi possível excluir o produto."
      );
    } finally {
      setExcluindo(false);
    }
  }

  function limparFiltros() {
    setBusca("");
    setTipoFiltro("todos");
    setStatusFiltro("todos");
    setOrdenacao("nome-asc");
    setPrecoMinimo("");
    setPrecoMaximo("");
  }

  function mudarPagina(novaPagina) {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  }

  function exportarCSV() {
    if (produtosFiltrados.length === 0) return;

    const cabecalho = [
      "ID",
      "Nome",
      "Tipo",
      "Preço",
      "Estoque",
      "Valor em estoque",
      "Status",
    ];

    const linhas = produtosFiltrados.map((produto) => {
      const preco = obterPreco(produto);
      const estoque = obterEstoque(produto);
      const status = obterStatusProduto(estoque);

      return [
        produto.id,
        produto.nome,
        produto.tipo,
        preco.toFixed(2),
        estoque,
        (preco * estoque).toFixed(2),
        status.texto,
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
    link.download = "produtos.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const primeiroItem =
    produtosFiltrados.length === 0
      ? 0
      : (paginaAtual - 1) * ITENS_POR_PAGINA + 1;

  const ultimoItem = Math.min(
    paginaAtual * ITENS_POR_PAGINA,
    produtosFiltrados.length
  );

  return (
    <section className="produtos-page">
      <div className="produtos-page-header">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie os produtos disponíveis para venda na academia.</p>
        </div>

        <div className="produtos-page-buttons">
          <button
            type="button"
            className="produtos-primary-button"
            onClick={abrirCadastro}
          >
            <Plus size={19} />
            Novo produto
          </button>

          <button
            type="button"
            className="produtos-secondary-button"
            onClick={exportarCSV}
            disabled={produtosFiltrados.length === 0}
          >
            <Download size={18} />
            Exportar
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      <div className="produtos-stats-grid">
        <StatCard
          titulo="Total de produtos"
          valor={estatisticas.total}
          texto="Produtos cadastrados"
          tipo="green"
          icone={<ShoppingBag size={25} />}
        />

        <StatCard
          titulo="Estoque total"
          valor={formatarNumero(estatisticas.estoqueTotal)}
          texto="Unidades disponíveis"
          tipo="blue"
          icone={<Boxes size={25} />}
        />

        <StatCard
          titulo="Valor total em estoque"
          valor={formatarMoeda(estatisticas.valorTotal)}
          texto="Preço multiplicado pelo estoque"
          tipo="orange"
          icone={<DollarSign size={25} />}
        />

        <StatCard
          titulo="Estoque baixo"
          valor={estatisticas.estoqueBaixo}
          texto={`Até ${LIMITE_ESTOQUE_BAIXO} unidades`}
          tipo="purple"
          icone={<AlertTriangle size={25} />}
        />
      </div>

      <div className="produtos-panel">
        <div className="produtos-filters">
          <div className="produtos-search">
            <Search size={19} />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar produto por nome ou tipo..."
            />
          </div>

          <div className="produtos-filter-actions">
            <Select
              value={tipoFiltro}
              onChange={setTipoFiltro}
              options={[
                ["todos", "Todos os tipos"],
                ...tiposDisponiveis.map((tipo) => [tipo, tipo]),
              ]}
            />

            <Select
              value={statusFiltro}
              onChange={setStatusFiltro}
              options={[
                ["todos", "Todos os status"],
                ["disponivel", "Disponível"],
                ["estoque-baixo", "Estoque baixo"],
                ["indisponivel", "Indisponível"],
              ]}
            />

            <button
              type="button"
              className={`produtos-filter-button ${
                filtrosAbertos ? "active" : ""
              }`}
              onClick={() =>
                setFiltrosAbertos((aberto) => !aberto)
              }
            >
              <Filter size={17} />
              Filtros
            </button>
          </div>
        </div>

        {filtrosAbertos && (
          <div className="produtos-extra-filters">
            <label>
              <span>Preço mínimo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precoMinimo}
                onChange={(event) =>
                  setPrecoMinimo(event.target.value)
                }
                placeholder="R$ 0,00"
              />
            </label>

            <label>
              <span>Preço máximo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precoMaximo}
                onChange={(event) =>
                  setPrecoMaximo(event.target.value)
                }
                placeholder="R$ 999,00"
              />
            </label>

            <label>
              <span>Ordenar</span>
              <select
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(event.target.value)
                }
              >
                <option value="nome-asc">Nome (A-Z)</option>
                <option value="nome-desc">Nome (Z-A)</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
                <option value="estoque-asc">Menor estoque</option>
                <option value="estoque-desc">Maior estoque</option>
              </select>
            </label>

            <button type="button" onClick={limparFiltros}>
              <X size={16} />
              Limpar filtros
            </button>
          </div>
        )}

        {erro && <p className="produtos-error">{erro}</p>}

        <div className="produtos-table-wrapper">
          <table className="produtos-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Valor em estoque</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="7" className="produtos-empty">
                    Carregando produtos...
                  </td>
                </tr>
              ) : produtosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="produtos-empty">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtosPaginados.map((produto, index) => {
                  const preco = obterPreco(produto);
                  const estoque = obterEstoque(produto);
                  const statusProduto =
                    obterStatusProduto(estoque);
                  const temaTipo =
                    obterTemaTipo(produto.tipo, index);

                  return (
                    <tr key={produto.id}>
                      <td>
                        <div className="produto-profile">
                          <div
                            className={`produto-thumbnail ${temaTipo}`}
                          >
                            {obterIconeTipo(produto.tipo)}
                          </div>

                          <div>
                            <strong>{produto.nome}</strong>
                            <span>ID: {produto.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`produto-type ${temaTipo}`}
                        >
                          {produto.tipo || "Não informado"}
                        </span>
                      </td>

                      <td>{formatarMoeda(preco)}</td>
                      <td>{formatarNumero(estoque)} un.</td>
                      <td>{formatarMoeda(preco * estoque)}</td>

                      <td>
                        <span
                          className={`produto-status ${statusProduto.chave}`}
                        >
                          {statusProduto.texto}
                        </span>
                      </td>

                      <td>
                        <div className="produtos-row-actions">
                            <button
                              type="button"
                              title="Editar"
                              onClick={() => abrirEdicao(produto)}
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                                className="danger"
                                onClick={() => abrirExclusao(produto)}
                                title="Excluir produto"
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

      <div className="produtos-pagination">
        <p>
          Mostrando {primeiroItem} a {ultimoItem} de{" "}
          {produtosFiltrados.length} produtos
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
        <ProdutoModal
          produto={produtoSelecionado}
          modo={modoModal}
          fechar={fecharModal}
          salvar={salvarProduto}
          salvando={salvando}
        />
      )}

      {produtoParaExcluir && (
        <div
          className="produto-delete-overlay"
          onMouseDown={fecharExclusao}
        >
          <div
            className="produto-delete-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="produto-delete-close"
              onClick={fecharExclusao}
            >
              <X size={19} />
            </button>

            <div className="produto-delete-icon">
              <Trash2 size={25} />
            </div>

            <h2>Excluir produto?</h2>

            <p>
              Você está prestes a excluir{" "}
              <strong>{produtoParaExcluir.nome}</strong>. Essa ação
              não poderá ser desfeita.
            </p>

            <div className="produto-delete-actions">
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
                {excluindo
                  ? "Excluindo..."
                  : "Excluir produto"}
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
    <article className="produtos-stat-card">
      <div className={`produtos-stat-icon ${tipo}`}>
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

function Select({ value, onChange, options }) {
  return (
    <div className="produtos-select-wrapper">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
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

function obterPreco(produto) {
  return Number(produto.preco ?? produto.valor ?? 0);
}

function obterEstoque(produto) {
  return Number(produto.estoque ?? produto.quantidade ?? 0);
}

function obterStatusProduto(estoque) {
  if (estoque <= 0) {
    return { chave: "indisponivel", texto: "Indisponível" };
  }

  if (estoque <= LIMITE_ESTOQUE_BAIXO) {
    return { chave: "estoque-baixo", texto: "Estoque baixo" };
  }

  return { chave: "disponivel", texto: "Disponível" };
}

function obterTemaTipo(tipo, index) {
  const valor = normalizarTexto(tipo);

  if (valor.includes("suplement")) return "green";
  if (valor.includes("vestuario") || valor.includes("roupa")) {
    return "blue";
  }
  if (valor.includes("acessor")) return "purple";
  if (valor.includes("treino") || valor.includes("equipamento")) {
    return "orange";
  }

  return ["green", "blue", "purple", "orange"][index % 4];
}

function obterIconeTipo(tipo) {
  const valor = normalizarTexto(tipo);

  if (valor.includes("vestuario") || valor.includes("roupa")) {
    return <Shirt size={23} />;
  }

  if (valor.includes("treino") || valor.includes("equipamento")) {
    return <Dumbbell size={23} />;
  }

  if (valor.includes("acessor")) {
    return <ShoppingBag size={23} />;
  }

  return <Package size={23} />;
}

function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarNumero(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR");
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
    return Array.from(
      { length: total },
      (_, index) => index + 1
    );
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

export default Produtos;
