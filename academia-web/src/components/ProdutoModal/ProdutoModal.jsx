import { useEffect, useState } from "react";
import {
  Boxes,
  Eye,
  Package,
  Save,
  Tag,
  WalletCards,
  X,
} from "lucide-react";

import "./ProdutoModal.css";

const FORMULARIO_INICIAL = {
  nome: "",
  tipo: "",
  preco: "",
  estoque: "",
};

const TIPOS_PADRAO = [
  "Suplemento",
  "Vestuário",
  "Acessório",
  "Objeto de treino",
];

function ProdutoModal({
  produto,
  modo,
  fechar,
  salvar,
  salvando,
}) {
  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL
  );
  const [erro, setErro] = useState("");

  const somenteLeitura = modo === "visualizar";
  const editando = modo === "editar";

  useEffect(() => {
    if (produto) {
      setFormulario({
        nome: produto.nome ?? "",
        tipo: produto.tipo ?? "",
        preco: produto.preco ?? produto.valor ?? "",
        estoque:
          produto.estoque ?? produto.quantidade ?? "",
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setErro("");
  }, [produto, modo]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();

    if (somenteLeitura) {
      fechar();
      return;
    }

    const nome = formulario.nome.trim();
    const tipo = formulario.tipo.trim();
    const preco = Number(formulario.preco);
    const estoque = Number(formulario.estoque);

    if (!nome) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (!tipo) {
      setErro("Selecione o tipo do produto.");
      return;
    }

    if (!Number.isFinite(preco) || preco < 0) {
      setErro("Informe um preço válido.");
      return;
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      setErro("Informe uma quantidade de estoque válida.");
      return;
    }

    try {
      setErro("");

      await salvar({
        nome,
        tipo,
        preco,
        estoque,
      });
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível salvar o produto."
      );
    }
  }

  return (
    <div
      className="produto-modal-overlay"
      onMouseDown={fechar}
    >
      <div
        className="produto-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="produto-modal-header">
          <div>
            <div className="produto-modal-heading-icon">
              {somenteLeitura ? (
                <Eye size={21} />
              ) : (
                <Package size={21} />
              )}
            </div>

            <div>
              <h2>
                {somenteLeitura
                  ? "Detalhes do produto"
                  : editando
                  ? "Editar produto"
                  : "Novo produto"}
              </h2>

              <p>
                {somenteLeitura
                  ? "Consulte as informações cadastradas."
                  : "Preencha os dados do produto da academia."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="produto-modal-close"
            onClick={fechar}
            disabled={salvando}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="produto-modal-body">
            {erro && (
              <p className="produto-modal-error">{erro}</p>
            )}

            <label className="produto-modal-field">
              <span>Nome do produto</span>

              <div>
                <Tag size={18} />

                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={alterarCampo}
                  placeholder="Ex.: Creatina Monohidratada"
                  disabled={somenteLeitura || salvando}
                  maxLength={120}
                />
              </div>
            </label>

            <label className="produto-modal-field">
              <span>Tipo</span>

              <div>
                <Package size={18} />

                <select
                  name="tipo"
                  value={formulario.tipo}
                  onChange={alterarCampo}
                  disabled={somenteLeitura || salvando}
                >
                  <option value="" disabled>
                    Selecione o tipo
                  </option>

                  {TIPOS_PADRAO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <div className="produto-modal-grid">
              <label className="produto-modal-field">
                <span>Preço</span>

                <div>
                  <WalletCards size={18} />

                  <input
                    type="number"
                    name="preco"
                    value={formulario.preco}
                    onChange={alterarCampo}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    disabled={somenteLeitura || salvando}
                  />
                </div>
              </label>

              <label className="produto-modal-field">
                <span>Estoque</span>

                <div>
                  <Boxes size={18} />

                  <input
                    type="number"
                    name="estoque"
                    value={formulario.estoque}
                    onChange={alterarCampo}
                    placeholder="0"
                    min="0"
                    step="1"
                    disabled={somenteLeitura || salvando}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="produto-modal-footer">
            <button
              type="button"
              className="produto-modal-cancel"
              onClick={fechar}
              disabled={salvando}
            >
              {somenteLeitura ? "Fechar" : "Cancelar"}
            </button>

            {!somenteLeitura && (
              <button
                type="submit"
                className="produto-modal-save"
                disabled={salvando}
              >
                <Save size={17} />

                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar alterações"
                  : "Cadastrar produto"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProdutoModal;
