import { useEffect, useState } from "react";
import {
  Droplets,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import "./PlanoNutricaoModal.css";

const REFEICAO_VAZIA = {
  nome: "",
  horario: "",
  alimentos: "",
  quantidades: "",
  calorias: "",
  ordem: 0,
};

function formularioInicial(alunoId) {
  return {
    alunoId: Number(alunoId),
    dataInicio: new Date().toISOString().slice(0, 10),
    caloriasMeta: "2100",
    proteinasMeta: "150",
    carboidratosMeta: "220",
    gordurasMeta: "60",
    aguaMetaLitros: "3",
    observacoes: "",
    refeicoes: [
      {
        ...REFEICAO_VAZIA,
        nome: "Café da manhã",
        horario: "07:30",
        ordem: 1,
      },
      {
        ...REFEICAO_VAZIA,
        nome: "Almoço",
        horario: "12:30",
        ordem: 2,
      },
      {
        ...REFEICAO_VAZIA,
        nome: "Jantar",
        horario: "20:00",
        ordem: 3,
      },
    ],
    suplementos: [],
  };
}

export default function PlanoNutricaoModal({
  aluno,
  plano,
  salvar,
  fechar,
  salvando,
}) {
  const [formulario, setFormulario] = useState(() =>
    formularioInicial(aluno.id)
  );
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!plano) {
      setFormulario(formularioInicial(aluno.id));
      return;
    }

    setFormulario({
      alunoId: Number(aluno.id),
      dataInicio: plano.dataInicio
        ? new Date(plano.dataInicio).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      caloriasMeta: String(plano.caloriasMeta ?? ""),
      proteinasMeta: String(plano.proteinasMeta ?? ""),
      carboidratosMeta: String(plano.carboidratosMeta ?? ""),
      gordurasMeta: String(plano.gordurasMeta ?? ""),
      aguaMetaLitros: String(plano.aguaMetaLitros ?? ""),
      observacoes: plano.observacoes ?? "",
      refeicoes: (plano.refeicoes ?? []).map((refeicao, indice) => ({
        nome: refeicao.nome ?? "",
        horario: refeicao.horario ?? "",
        alimentos: refeicao.alimentos ?? "",
        quantidades: refeicao.quantidades ?? "",
        calorias: String(refeicao.calorias ?? ""),
        ordem: refeicao.ordem ?? indice + 1,
      })),
      suplementos: (plano.suplementos ?? []).map((suplemento) => ({
        nome: suplemento.nome ?? "",
        dosagem: suplemento.dosagem ?? "",
      })),
    });
  }, [plano, aluno.id]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  function alterarRefeicao(indice, campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      refeicoes: atual.refeicoes.map((refeicao, i) =>
        i === indice ? { ...refeicao, [campo]: valor } : refeicao
      ),
    }));
  }

  function adicionarRefeicao() {
    setFormulario((atual) => ({
      ...atual,
      refeicoes: [
        ...atual.refeicoes,
        {
          ...REFEICAO_VAZIA,
          ordem: atual.refeicoes.length + 1,
        },
      ],
    }));
  }

  function removerRefeicao(indice) {
    setFormulario((atual) => ({
      ...atual,
      refeicoes: atual.refeicoes
        .filter((_, i) => i !== indice)
        .map((refeicao, i) => ({
          ...refeicao,
          ordem: i + 1,
        })),
    }));
  }

  function alterarSuplemento(indice, campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      suplementos: atual.suplementos.map((suplemento, i) =>
        i === indice ? { ...suplemento, [campo]: valor } : suplemento
      ),
    }));
  }

  function adicionarSuplemento() {
    setFormulario((atual) => ({
      ...atual,
      suplementos: [
        ...atual.suplementos,
        {
          nome: "",
          dosagem: "",
        },
      ],
    }));
  }

  function removerSuplemento(indice) {
    setFormulario((atual) => ({
      ...atual,
      suplementos: atual.suplementos.filter((_, i) => i !== indice),
    }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErro("");

    const dados = {
      alunoId: Number(formulario.alunoId),
      dataInicio: formulario.dataInicio,
      caloriasMeta: Number(formulario.caloriasMeta),
      proteinasMeta: Number(formulario.proteinasMeta),
      carboidratosMeta: Number(formulario.carboidratosMeta),
      gordurasMeta: Number(formulario.gordurasMeta),
      aguaMetaLitros: Number(formulario.aguaMetaLitros),
      observacoes: formulario.observacoes.trim(),
      refeicoes: formulario.refeicoes
        .filter((refeicao) => refeicao.nome.trim())
        .map((refeicao, indice) => ({
          nome: refeicao.nome.trim(),
          horario: refeicao.horario,
          alimentos: refeicao.alimentos.trim(),
          quantidades: refeicao.quantidades.trim(),
          calorias: Number(refeicao.calorias || 0),
          ordem: indice + 1,
        })),
      suplementos: formulario.suplementos
        .filter((suplemento) => suplemento.nome.trim())
        .map((suplemento) => ({
          nome: suplemento.nome.trim(),
          dosagem: suplemento.dosagem.trim(),
        })),
    };

    if (!dados.dataInicio) {
      setErro("Informe a data de início.");
      return;
    }

    if (dados.caloriasMeta <= 0) {
      setErro("Informe uma meta válida de calorias.");
      return;
    }

    if (
      dados.proteinasMeta < 0 ||
      dados.carboidratosMeta < 0 ||
      dados.gordurasMeta < 0 ||
      dados.aguaMetaLitros <= 0
    ) {
      setErro("Revise as metas nutricionais.");
      return;
    }

    try {
      await salvar(dados);
    } catch (error) {
      setErro(error.message || "Não foi possível salvar o plano.");
    }
  }

  return (
    <div className="plano-nutricao-overlay" onMouseDown={fechar}>
      <div
        className="plano-nutricao-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="plano-nutricao-modal-header">
          <div>
            <span className="plano-nutricao-modal-icon">
              <Utensils size={21} />
            </span>

            <div>
              <h2>
                {plano
                  ? "Editar plano nutricional"
                  : "Novo plano nutricional"}
              </h2>
              <p>{aluno.nome ?? aluno.name}</p>
            </div>
          </div>

          <button type="button" onClick={fechar} disabled={salvando}>
            <X size={20} />
          </button>
        </header>

        <form onSubmit={enviar}>
          <div className="plano-nutricao-modal-body">
            {erro && <div className="plano-nutricao-erro">{erro}</div>}

            <section className="plano-nutricao-secao">
              <header>
                <h3>Metas nutricionais</h3>
              </header>

              <div className="plano-nutricao-grid metas">
                <Campo label="Data de início">
                  <input
                    type="date"
                    name="dataInicio"
                    value={formulario.dataInicio}
                    onChange={alterarCampo}
                  />
                </Campo>

                <Campo label="Calorias (kcal)">
                  <input
                    type="number"
                    min="1"
                    name="caloriasMeta"
                    value={formulario.caloriasMeta}
                    onChange={alterarCampo}
                  />
                </Campo>

                <Campo label="Proteínas (g)">
                  <input
                    type="number"
                    min="0"
                    name="proteinasMeta"
                    value={formulario.proteinasMeta}
                    onChange={alterarCampo}
                  />
                </Campo>

                <Campo label="Carboidratos (g)">
                  <input
                    type="number"
                    min="0"
                    name="carboidratosMeta"
                    value={formulario.carboidratosMeta}
                    onChange={alterarCampo}
                  />
                </Campo>

                <Campo label="Gorduras (g)">
                  <input
                    type="number"
                    min="0"
                    name="gordurasMeta"
                    value={formulario.gordurasMeta}
                    onChange={alterarCampo}
                  />
                </Campo>

                <Campo label="Água (litros)">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="aguaMetaLitros"
                    value={formulario.aguaMetaLitros}
                    onChange={alterarCampo}
                  />
                </Campo>
              </div>
            </section>

            <section className="plano-nutricao-secao">
              <header>
                <div>
                  <h3>Refeições</h3>
                  <p>Separe alimentos e quantidades por linha.</p>
                </div>

                <button
                  type="button"
                  className="plano-nutricao-add"
                  onClick={adicionarRefeicao}
                >
                  <Plus size={16} />
                  Adicionar refeição
                </button>
              </header>

              <div className="plano-nutricao-itens">
                {formulario.refeicoes.map((refeicao, indice) => (
                  <article
                    className="plano-nutricao-item"
                    key={`refeicao-${indice}`}
                  >
                    <div className="plano-nutricao-item-header">
                      <strong>Refeição {indice + 1}</strong>

                      <button
                        type="button"
                        onClick={() => removerRefeicao(indice)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="plano-nutricao-grid refeicao">
                      <Campo label="Nome">
                        <input
                          value={refeicao.nome}
                          onChange={(event) =>
                            alterarRefeicao(indice, "nome", event.target.value)
                          }
                          placeholder="Ex.: Café da manhã"
                        />
                      </Campo>

                      <Campo label="Horário">
                        <input
                          type="time"
                          value={refeicao.horario}
                          onChange={(event) =>
                            alterarRefeicao(
                              indice,
                              "horario",
                              event.target.value
                            )
                          }
                        />
                      </Campo>

                      <Campo label="Calorias">
                        <input
                          type="number"
                          min="0"
                          value={refeicao.calorias}
                          onChange={(event) =>
                            alterarRefeicao(
                              indice,
                              "calorias",
                              event.target.value
                            )
                          }
                        />
                      </Campo>

                      <Campo label="Alimentos">
                        <textarea
                          value={refeicao.alimentos}
                          onChange={(event) =>
                            alterarRefeicao(
                              indice,
                              "alimentos",
                              event.target.value
                            )
                          }
                          placeholder={"Aveia\nBanana\nPasta de amendoim"}
                        />
                      </Campo>

                      <Campo label="Quantidades">
                        <textarea
                          value={refeicao.quantidades}
                          onChange={(event) =>
                            alterarRefeicao(
                              indice,
                              "quantidades",
                              event.target.value
                            )
                          }
                          placeholder={"60g\n1 unidade\n15g"}
                        />
                      </Campo>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="plano-nutricao-secao">
              <header>
                <div>
                  <h3>Suplementos</h3>
                  <p>Cadastre somente suplementos realmente recomendados.</p>
                </div>

                <button
                  type="button"
                  className="plano-nutricao-add"
                  onClick={adicionarSuplemento}
                >
                  <Plus size={16} />
                  Adicionar suplemento
                </button>
              </header>

              <div className="plano-nutricao-suplementos">
                {formulario.suplementos.length === 0 ? (
                  <div className="plano-nutricao-vazio">
                    <Sparkles size={22} />
                    Nenhum suplemento cadastrado.
                  </div>
                ) : (
                  formulario.suplementos.map((suplemento, indice) => (
                    <div
                      className="plano-nutricao-suplemento"
                      key={`suplemento-${indice}`}
                    >
                      <input
                        value={suplemento.nome}
                        onChange={(event) =>
                          alterarSuplemento(
                            indice,
                            "nome",
                            event.target.value
                          )
                        }
                        placeholder="Nome do suplemento"
                      />

                      <input
                        value={suplemento.dosagem}
                        onChange={(event) =>
                          alterarSuplemento(
                            indice,
                            "dosagem",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: 5g/dia"
                      />

                      <button
                        type="button"
                        onClick={() => removerSuplemento(indice)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="plano-nutricao-secao">
              <header>
                <div>
                  <h3>Observações</h3>
                  <p>Use uma orientação por linha.</p>
                </div>
              </header>

              <label className="plano-nutricao-observacoes">
                <Droplets size={18} />
                <textarea
                  name="observacoes"
                  value={formulario.observacoes}
                  onChange={alterarCampo}
                  placeholder={
                    "Manter hidratação acima de 3L/dia.\nEvitar bebidas açucaradas."
                  }
                />
              </label>
            </section>
          </div>

          <footer className="plano-nutricao-modal-footer">
            <button
              type="button"
              className="plano-nutricao-cancelar"
              onClick={fechar}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="plano-nutricao-salvar"
              disabled={salvando}
            >
              <Save size={17} />
              {salvando ? "Salvando..." : "Salvar plano"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <label className="plano-nutricao-campo">
      <span>{label}</span>
      {children}
    </label>
  );
}
