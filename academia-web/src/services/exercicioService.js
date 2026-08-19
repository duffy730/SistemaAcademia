import api from "./api";

export async function listarExercicios() {
  const response = await api.get("/exercicios/listar");
  return response.data;
}

export async function buscarExercicio(id) {
  const response = await api.get(`/exercicios/buscar-id/${id}`);
  return response.data;
}

export async function criarExercicio(dados) {
  const response = await api.post(
    "/exercicios/criar-exercicio",
    dados
  );

  return response.data;
}

export async function atualizarExercicio(id, dados) {
  const response = await api.put(
    `/exercicios/atualizar-exercicio/${id}`,
    dados
  );

  return response.data;
}

export async function removerExercicio(id) {
  const response = await api.delete(
    `/exercicios/remover-exercicio/${id}`
  );

  return response.data;
}