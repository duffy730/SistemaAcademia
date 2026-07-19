import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Save,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import "./MatriculaModal.css";

const FORMULARIO_INICIAL = {
  alunoId: "",
  planoId: "",
  ativa: true,
};

function MatriculaModal({
  matricula,
  matriculas,
  alunos,
  planos,
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
    if (matricula) {
      setFormulario({
        alunoId: String(matricula.alunoId ?? matricula.aluno?.id ?? ""),
        planoId: String(matricula.planoId ?? matricula.plano?.id ?? ""),
        ativa: matricula.ativa ?? matricula.ativo ?? true,
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setErro("");
  }, [matricula, modo]);

  const planoSelecionado = useMemo(
    () =>
      planos.find(
        (plano) => String(plano.id) === formulario.planoId
      ),
    [planos, formulario.planoId]
  );

  function alterarCampo(event) {
    const { name, value, type, checked } = event.target;

    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();

    if (somenteLeitura) {
      fechar();
      return;
    }

    const alunoId = Number(formulario.alunoId);
    const planoId = Number(formulario.planoId);

    if (!Number.isInteger(alunoId) || alunoId <= 0) {
      setErro("Selecione um aluno.");
      return;
    }

    if (!Number.isInteger(planoId) || planoId <= 0) {
      setErro("Selecione um plano.");
      return;
    }

    try {
      setErro("");

      await salvar({
        alunoId,
        planoId,
        ativa: formulario.ativa,
      });
    } catch (error) {
      setErro(error.message || "Não foi possível salvar a matrícula.");
    }
  }

  function abrirAtivacao(matricula) {
    setMatriculaParaAtivar(matricula);
    setPlanoAtivacaoId("");
    setMenuAberto(null);
  }

  function fecharAtivacao() {
    if (ativando) {
      return;
    }

    setMatriculaParaAtivar(null);
    setPlanoAtivacaoId("");
  }

  async function confirmarAtivacao() {
    if (!matriculaParaAtivar) {
      return;
    }

    if (!planoAtivacaoId) {
      setErro("Selecione um plano para ativar a matrícula.");
      return;
    }

    try {
      setAtivando(true);
      setErro("");

      await api.patch(
        ROTAS.ativarMatricula(matriculaParaAtivar.id),
        {
          planoId: Number(planoAtivacaoId),
        }
      );

      setMatriculaParaAtivar(null);
      setPlanoAtivacaoId("");

      await carregarDados();
    } catch (error) {
      console.error(
        "Erro ao ativar matrícula:",
        error.response?.data ?? error.message
      );

      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível ativar a matrícula."
      );
    } finally {
      setAtivando(false);
    }
  }

  function abrirExclusao(matricula) {
    setMatriculaParaExcluir(matricula);
    setMenuAberto(null);
  }

  function fecharExclusao() {
    if (excluindo) {
      return;
    }

    setMatriculaParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!matriculaParaExcluir) {
      return;
    }

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
        error.response?.data?.mensagem ||
          "Não foi possível excluir a matrícula."
      );
    } finally {
      setExcluindo(false);
    }
  }

  const alunosDisponiveis = useMemo(() => {
  const alunosComMatricula = new Set(
    matriculas
      .filter((item) => {
        // Durante a edição, ignora a própria matrícula atual.
        if (
          matricula &&
          Number(item.id) === Number(matricula.id)
        ) {
          return false;
        }

        return true;
      })
      .map((item) =>
        Number(
          item.alunoId ??
          item.aluno?.id
        )
      )
      .filter((id) => Number.isInteger(id) && id > 0)
  );

  return alunos.filter(
    (aluno) =>
      !alunosComMatricula.has(Number(aluno.id))
  );
}, [alunos, matriculas, matricula]);

  return (
    <div className="matricula-modal-overlay" onMouseDown={fechar}>
      <div
        className="matricula-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="matricula-modal-header">
          <div>
            <div className="matricula-modal-heading-icon">
              {somenteLeitura ? <Eye size={21} /> : <ShieldCheck size={21} />}
            </div>

            <div>
              <h2>
                {somenteLeitura
                  ? "Detalhes da matrícula"
                  : editando
                  ? "Editar matrícula"
                  : "Nova matrícula"}
              </h2>

              <p>
                {somenteLeitura
                  ? "Consulte os dados cadastrados."
                  : "Vincule um aluno a um plano da academia."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="matricula-modal-close"
            onClick={fechar}
            disabled={salvando}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="matricula-modal-body">
            {erro && <p className="matricula-modal-error">{erro}</p>}

            <label className="matricula-modal-field">
              <span>Aluno</span>
              <div>
                <UserRound size={18} />

                <select
                  name="alunoId"
                  value={formulario.alunoId}
                  onChange={alterarCampo}
                  disabled={somenteLeitura || salvando}
                >
                  <option value="" disabled>Selecione o aluno</option>
                  
                  {alunosDisponiveis.length === 0 && (
                    <option value="" disabled>
                      Todos os alunos já possuem matrícula
                    </option>
                  )}

                  {alunosDisponiveis.map((aluno) => (
                    <option
                      key={aluno.id}
                      value={aluno.id}
                    >
                      {aluno.nome} — {aluno.email}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="matricula-modal-field">
              <span>Plano</span>
              <div>
                <WalletCards size={18} />

                <select
                  name="planoId"
                  value={formulario.planoId}
                  onChange={alterarCampo}
                  disabled={somenteLeitura || salvando}
                >
                  <option value="">Selecione o plano</option>

                  {planos.map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome} — {formatarMoeda(plano.valor)}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {planoSelecionado && (
              <div className="matricula-modal-plan-summary">
                <CalendarDays size={20} />
                <div>
                  <strong>{planoSelecionado.nome}</strong>
                  <span>
                    {planoSelecionado.duracaoDias} dias ·{" "}
                    {formatarMoeda(planoSelecionado.valor)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="matricula-modal-footer">
            <button
              type="button"
              className="matricula-modal-cancel"
              onClick={fechar}
              disabled={salvando}
            >
              {somenteLeitura ? "Fechar" : "Cancelar"}
            </button>

            {!somenteLeitura && (
              <button
                type="submit"
                className="matricula-modal-save"
                disabled={salvando}
              >
                <Save size={17} />
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar alterações"
                  : "Cadastrar matrícula"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default MatriculaModal;
