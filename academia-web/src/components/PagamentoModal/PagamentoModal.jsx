import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CalendarDays,
  CreditCard,
  Eye,
  Package,
  Save,
  ShoppingBag,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import "./PagamentoModal.css";

const FORMULARIO_INICIAL = {
  tipoPagamento: "plano",
  matriculaId: "",
  produtoId: "",
  quantidade: 1,
  descricao: "",
  valor: "",
  metodoPagamento: "PIX",
  dataPagamento: obterDataAtual(),
};

function PagamentoModal({
  pagamento,
  matriculas,
  produtos,
  modo,
  fechar,
  salvar,
  salvando,
}) {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [erro, setErro] = useState("");

  const somenteLeitura = modo === "visualizar";
  const editando = modo === "editar";

  useEffect(() => {
    if (pagamento) {
      const tipo =
        pagamento.produtoId ||
        pagamento.produto ||
        String(pagamento.tipoPagamento ?? pagamento.tipo)
          .toLowerCase()
          .includes("produto")
          ? "produto"
          : "plano";

      setFormulario({
        tipoPagamento: tipo,
        matriculaId: String(
          pagamento.matriculaId ??
            pagamento.matricula?.id ??
            ""
        ),
        produtoId: String(
          pagamento.produtoId ??
            pagamento.produto?.id ??
            ""
        ),
        quantidade: pagamento.quantidade ?? 1,
        descricao: pagamento.descricao ?? "",
        valor: pagamento.valor ?? "",
        metodoPagamento:
          pagamento.metodoPagamento ??
          pagamento.metodo ??
          "PIX",
        dataPagamento: normalizarDataInput(
          pagamento.dataPagamento
        ),
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setErro("");
  }, [pagamento, modo]);

  const produtoSelecionado = useMemo(
    () =>
      produtos.find(
        (produto) =>
          String(produto.id) === formulario.produtoId
      ),
    [produtos, formulario.produtoId]
  );

  const matriculaSelecionada = useMemo(
    () =>
      matriculas.find(
        (matricula) =>
          String(matricula.id) === formulario.matriculaId
      ),
    [matriculas, formulario.matriculaId]
  );

  const valorProduto = useMemo(() => {
    if (!produtoSelecionado) return 0;

    return (
      Number(
        produtoSelecionado.preco ??
          produtoSelecionado.valor ??
          0
      ) * Number(formulario.quantidade || 0)
    );
  }, [produtoSelecionado, formulario.quantidade]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((estadoAtual) => {
      if (name === "tipoPagamento") {
        return {
          ...estadoAtual,
          tipoPagamento: value,
          produtoId: "",
          quantidade: 1,
          valor: "",
          descricao: "",
        };
      }

      return {
        ...estadoAtual,
        [name]: value,
      };
    });
  }

  async function enviarFormulario(event) {
    event.preventDefault();

    if (somenteLeitura || salvando) {
      return;
    }

    const matriculaId = Number(formulario.matriculaId);
    const pagamentoDeProduto =
      formulario.tipoPagamento === "produto";

    if (!Number.isInteger(matriculaId) || matriculaId <= 0) {
      setErro("Selecione uma matrícula.");
      return;
    }

    if (!formulario.metodoPagamento) {
      setErro("Selecione o método de pagamento.");
      return;
    }

    if (!formulario.dataPagamento) {
      setErro("Informe a data do pagamento.");
      return;
    }

    let produtoId = null;
    let quantidade = 0;
    let valor = Number(formulario.valor);

    if (pagamentoDeProduto) {
      produtoId = Number(formulario.produtoId);
      quantidade = Number(formulario.quantidade);

      if (!Number.isInteger(produtoId) || produtoId <= 0) {
        setErro("Selecione um produto.");
        return;
      }

      if (!produtoSelecionado) {
        setErro("O produto selecionado não foi encontrado.");
        return;
      }

      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        setErro("Informe uma quantidade maior que zero.");
        return;
      }

      const estoqueDisponivel = Number(
        produtoSelecionado.estoque ??
          produtoSelecionado.quantidade ??
          0
      );

      if (quantidade > estoqueDisponivel) {
        setErro(
          `Estoque insuficiente. Disponível: ${estoqueDisponivel}.`
        );
        return;
      }

      valor = valorProduto;

      if (!Number.isFinite(valor) || valor <= 0) {
        setErro("O produto selecionado possui um preço inválido.");
        return;
      }
    } else {
      if (!Number.isFinite(valor) || valor <= 0) {
        setErro("Informe um valor maior que zero.");
        return;
      }
    }

    const dados = {
      matriculaId,
      produtoId,
      quantidade,
      descricao:
        formulario.descricao.trim() ||
        gerarDescricaoPadrao(
          formulario.tipoPagamento,
          matriculaSelecionada,
          produtoSelecionado
        ),
      valor,
      metodoPagamento: formulario.metodoPagamento,
      dataPagamento: formulario.dataPagamento,
    };

    console.log("Pagamento enviado:", dados);

    try {
      setErro("");
      await salvar(dados);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível salvar o pagamento."
      );
    }
  }

  return (
    <div
      className="pagamento-modal-overlay"
      onMouseDown={fechar}
    >
      <div
        className="pagamento-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pagamento-modal-header">
          <div>
            <div className="pagamento-modal-heading-icon">
              {somenteLeitura ? (
                <Eye size={21} />
              ) : (
                <CreditCard size={21} />
              )}
            </div>

            <div>
              <h2>
                {somenteLeitura
                  ? "Detalhes do pagamento"
                  : editando
                  ? "Editar pagamento"
                  : "Novo pagamento"}
              </h2>

              <p>
                {somenteLeitura
                  ? "Consulte os dados registrados."
                  : "Registre o pagamento de um plano ou produto."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="pagamento-modal-close"
            onClick={fechar}
            disabled={salvando}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="pagamento-modal-body">
            {erro && (
              <p className="pagamento-modal-error">{erro}</p>
            )}

            <div className="pagamento-type-selector">
              <button
                type="button"
                className={
                  formulario.tipoPagamento === "plano"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  alterarCampo({
                    target: {
                      name: "tipoPagamento",
                      value: "plano",
                    },
                  })
                }
                disabled={somenteLeitura || salvando}
              >
                <WalletCards size={18} />
                Plano
              </button>

              <button
                type="button"
                className={
                  formulario.tipoPagamento === "produto"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  alterarCampo({
                    target: {
                      name: "tipoPagamento",
                      value: "produto",
                    },
                  })
                }
                disabled={somenteLeitura || salvando}
              >
                <ShoppingBag size={18} />
                Produto
              </button>
            </div>

            <label className="pagamento-modal-field">
              <span>Matrícula / aluno</span>

              <div>
                <UserRound size={18} />

                <select
                  name="matriculaId"
                  value={formulario.matriculaId}
                  onChange={alterarCampo}
                  disabled={somenteLeitura || salvando}
                >
                  <option value="" disabled>
                    Selecione a matrícula
                  </option>

                  {matriculas.map((matricula) => (
                    <option
                      key={matricula.id}
                      value={matricula.id}
                    >
                      #{String(matricula.id).padStart(6, "0")} —{" "}
                      {obterNomeAlunoMatricula(matricula)}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {formulario.tipoPagamento === "produto" ? (
              <>
                <label className="pagamento-modal-field">
                  <span>Produto</span>

                  <div>
                    <Package size={18} />

                    <select
                      name="produtoId"
                      value={formulario.produtoId}
                      onChange={alterarCampo}
                      disabled={somenteLeitura || salvando}
                    >
                      <option value="" disabled>
                        Selecione o produto
                      </option>

                      {produtos.map((produto) => (
                        <option
                          key={produto.id}
                          value={produto.id}
                          disabled={
                            Number(
                              produto.estoque ??
                                produto.quantidade ??
                                0
                            ) <= 0
                          }
                        >
                          {produto.nome} —{" "}
                          {formatarMoeda(
                            produto.preco ??
                              produto.valor
                          )}{" "}
                          — estoque:{" "}
                          {produto.estoque ??
                            produto.quantidade ??
                            0}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <div className="pagamento-modal-grid">
                  <label className="pagamento-modal-field">
                    <span>Quantidade</span>

                    <div>
                      <Boxes size={18} />

                      <input
                        type="number"
                        name="quantidade"
                        value={formulario.quantidade}
                        onChange={alterarCampo}
                        min="1"
                        step="1"
                        disabled={somenteLeitura || salvando}
                      />
                    </div>
                  </label>

                  <label className="pagamento-modal-field">
                    <span>Valor total</span>

                    <div>
                      <WalletCards size={18} />

                      <input
                        type="text"
                        value={formatarMoeda(valorProduto)}
                        disabled
                      />
                    </div>
                  </label>
                </div>

                {produtoSelecionado && (
                  <div className="pagamento-stock-summary">
                    <Package size={20} />

                    <div>
                      <strong>{produtoSelecionado.nome}</strong>
                      <span>
                        Estoque atual:{" "}
                        {produtoSelecionado.estoque ??
                          produtoSelecionado.quantidade ??
                          0}{" "}
                        unidade(s)
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <label className="pagamento-modal-field">
                <span>Valor do pagamento</span>

                <div>
                  <WalletCards size={18} />

                  <input
                    type="number"
                    name="valor"
                    value={formulario.valor}
                    onChange={alterarCampo}
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    disabled={somenteLeitura || salvando}
                  />
                </div>
              </label>
            )}

            <div className="pagamento-modal-grid">
              <label className="pagamento-modal-field">
                <span>Método</span>

                <div>
                  <CreditCard size={18} />

                  <select
                    name="metodoPagamento"
                    value={formulario.metodoPagamento}
                    onChange={alterarCampo}
                    disabled={somenteLeitura || salvando}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Débito">Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </label>

              <label className="pagamento-modal-field">
                <span>Data do pagamento</span>

                <div>
                  <CalendarDays size={18} />

                  <input
                    type="date"
                    name="dataPagamento"
                    value={formulario.dataPagamento}
                    onChange={alterarCampo}
                    disabled={somenteLeitura || salvando}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="pagamento-modal-footer">
            <button
              type="button"
              className="pagamento-modal-cancel"
              onClick={fechar}
              disabled={salvando}
            >
              {somenteLeitura ? "Fechar" : "Cancelar"}
            </button>

            {!somenteLeitura && (
              <button
                type="submit"
                className="pagamento-modal-save"
                disabled={salvando}
              >
                <Save size={17} />

                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar alterações"
                  : "Registrar pagamento"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function obterNomeAlunoMatricula(matricula) {
  if (typeof matricula.aluno === "string") {
    return matricula.aluno;
  }

  return (
    matricula.aluno?.nome ||
    matricula.alunoNome ||
    "Aluno não encontrado"
  );
}

function gerarDescricaoPadrao(tipo, matricula, produto) {
  if (tipo === "produto") {
    return produto
      ? `Venda de ${produto.nome}`
      : "Venda de produto";
  }

  const nomePlano =
    typeof matricula?.plano === "string"
      ? matricula.plano
      : matricula?.plano?.nome ||
        matricula?.planoNome;

  return nomePlano
    ? `Pagamento do ${nomePlano}`
    : "Pagamento de plano";
}

function obterDataAtual() {
  const agora = new Date();
  agora.setMinutes(
    agora.getMinutes() - agora.getTimezoneOffset()
  );

  return agora.toISOString().slice(0, 10);
}

function normalizarDataInput(valor) {
  if (!valor) return obterDataAtual();

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return obterDataAtual();
  }

  data.setMinutes(
    data.getMinutes() - data.getTimezoneOffset()
  );

  return data.toISOString().slice(0, 10);
}

function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default PagamentoModal;