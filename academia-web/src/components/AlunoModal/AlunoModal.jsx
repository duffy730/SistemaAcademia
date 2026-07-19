import api from "../../services/api";
import "./AlunoModal.css";
import { useEffect, useState } from "react";

function AlunoModal({ fechar, aoSalvar, aluno }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    peso: "",
    altura: "",
    dataNascimento: "",
  });

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {

        if(aluno){

            setForm({

                nome: aluno.nome,
                email: aluno.email,
                peso: aluno.peso,
                altura: aluno.altura,
                dataNascimento: aluno.dataNascimento

            });

        }

    }, [aluno]);

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setForm((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));
  }

  async function salvar(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      if(aluno){

        await api.put(`/alunos/atualizar-aluno/${aluno.id}`,{

            nome:form.nome,
            email:form.email,
            peso:Number(form.peso),
            altura:Number(form.altura),
            dataNascimento:form.dataNascimento

        });

        }
        else{

            await api.post("/alunos/criar-aluno",{

                nome:form.nome,
                email:form.email,
                peso:Number(form.peso),
                altura:Number(form.altura),
                dataNascimento:form.dataNascimento

            });

        }

      await aoSalvar();
      fechar();
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error.response?.data);

      setErro(
        error.response?.data?.message ??
          "Não foi possível cadastrar o aluno."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={fechar}>
      <div
        className="aluno-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="aluno-modal-header">
          <div>
            <h2>{aluno ? "Editar aluno" : "Novo aluno"}</h2>
            <p>Preencha os dados para realizar o cadastro.</p>
          </div>

          <button type="button" onClick={fechar}>
            ×
          </button>
        </div>

        <form onSubmit={salvar}>
          <div className="aluno-form-grid">
            <label>
              Nome
              <input
                name="nome"
                value={form.nome}
                onChange={atualizarCampo}
                required
              />
            </label>

            <label>
              E-mail
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={atualizarCampo}
                required
              />
            </label>

            <label className="aluno-form-bar">
              Peso
              <input
                type="number"
                step="0.01"
                min="1"
                name="peso"
                value={form.peso}
                onChange={atualizarCampo}
                required
              />
            </label>

            <label className="aluno-form-bar">
              Altura
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="3"
                name="altura"
                value={form.altura}
                onChange={atualizarCampo}
                required
              />
            </label>

            <label className="campo-largo">
              Data de nascimento
              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={atualizarCampo}
                required
              />
            </label>
          </div>

          {erro && <p className="aluno-modal-erro">{erro}</p>}

          <div className="aluno-modal-actions">
            <button
              type="button"
              className="botao-cancelar"
              onClick={fechar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="botao-salvar"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar aluno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AlunoModal;