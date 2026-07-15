import { useEffect, useState } from "react";
import {
  CalendarDays,
  Eye,
  Save,
  Tag,
  Text,
  WalletCards,
  X,
} from "lucide-react";

import "./PlanoModal.css";

const FORMULARIO_INICIAL = {
  nome: "",
  valor: "",
  duracaoDias: "",
  descricao: "",
};

function PlanoModal({ plano, modo, fechar, salvar, salvando }) {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [erro, setErro] = useState("");

  const somenteLeitura = modo === "visualizar";
  const editando = modo === "editar";

  useEffect(() => {
    if (plano) {
      setFormulario({
        nome: plano.nome ?? "",
        valor: plano.valor ?? "",
        duracaoDias: plano.duracaoDias ?? "",
        descricao: plano.descricao ?? "",
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setErro("");
  }, [plano, modo]);

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
    const descricao = formulario.descricao.trim();
    const valor = Number(formulario.valor);
    const duracaoDias = Number(formulario.duracaoDias);

    if (!nome) {
      setErro("Informe o nome do plano.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    if (!Number.isInteger(duracaoDias) || duracaoDias <= 0) {
      setErro("Informe uma duração válida em dias.");
      return;
    }

    try {
      setErro("");

      await salvar({
        nome,
        valor,
        duracaoDias,
        descricao,
      });
    } catch (error) {
      setErro(error.message || "Não foi possível salvar o plano.");
    }
  }

  return (
    <div className="plano-modal-overlay" onMouseDown={fechar}>
      <div
        className="plano-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-plano-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="plano-modal-header">
          <div>
            <div className="plano-modal-heading-icon">
              {somenteLeitura ? <Eye size={21} /> : <Tag size={21} />}
            </div>

            <div>
              <h2 id="titulo-plano-modal">
                {somenteLeitura
                  ? "Detalhes do plano"
                  : editando
                  ? "Editar plano"
                  : "Novo plano"}
              </h2>

              <p>
                {somenteLeitura
                  ? "Consulte as informações cadastradas."
                  : "Preencha os dados do plano da academia."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="plano-modal-close"
            onClick={fechar}
            disabled={salvando}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="plano-modal-body">
            {erro && <p className="plano-modal-error">{erro}</p>}

            <label className="plano-modal-field">
              <span>Nome do plano</span>

              <div>
                <Tag size={18} />

                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={alterarCampo}
                  placeholder="Ex.: Plano Black"
                  disabled={somenteLeitura || salvando}
                  maxLength={100}
                />
              </div>
            </label>

            <div className="plano-modal-grid">
              <label className="plano-modal-field">
                <span>Valor</span>

                <div>
                  <WalletCards size={18} />

                  <input
                    type="number"
                    name="valor"
                    value={formulario.valor}
                    onChange={alterarCampo}
                    placeholder="0,00"
                    min="0.01"
                    step="0.01"
                    disabled={somenteLeitura || salvando}
                  />
                </div>
              </label>

              <label className="plano-modal-field">
                <span>Duração em dias</span>

                <div>
                  <CalendarDays size={18} />

                  <input
                    type="number"
                    name="duracaoDias"
                    value={formulario.duracaoDias}
                    onChange={alterarCampo}
                    placeholder="30"
                    min="1"
                    step="1"
                    disabled={somenteLeitura || salvando}
                  />
                </div>
              </label>
            </div>

            <label className="plano-modal-field">
              <span>Descrição</span>

              <div className="textarea">
                <Text size={18} />

                <textarea
                  name="descricao"
                  value={formulario.descricao}
                  onChange={alterarCampo}
                  placeholder="Descreva os benefícios e características do plano."
                  disabled={somenteLeitura || salvando}
                  maxLength={400}
                  rows={5}
                />
              </div>

              <small>{formulario.descricao.length}/400 caracteres</small>
            </label>
          </div>

          <div className="plano-modal-footer">
            <button
              type="button"
              className="plano-modal-cancel"
              onClick={fechar}
              disabled={salvando}
            >
              {somenteLeitura ? "Fechar" : "Cancelar"}
            </button>

            {!somenteLeitura && (
              <button
                type="submit"
                className="plano-modal-save"
                disabled={salvando}
              >
                <Save size={17} />
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar alterações"
                  : "Cadastrar plano"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlanoModal;
