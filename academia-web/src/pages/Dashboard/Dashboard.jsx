import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  DollarSign,
  Eye,
  PackagePlus,
  Receipt,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./Dashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ?? "https://localhost:5000/api";

const ENDPOINTS = {
  alunos: "/alunos/listar",
  matriculas: "/matriculas/listar",
  pagamentos: "/pagamentos/listar",
  produtos: "/produtos/listar",
  planos: "/planos/listar",
};

const CLASSES = ["verde", "roxo", "azul", "laranja"];

const CORES_PLANOS = [
  "#35ce82",
  "#8d42d5",
  "#1674d5",
  "#f5a11d",
];

const ACOES = [
  {
    texto: "Novo Aluno",
    icone: UserPlus,
    classe: "verde",
    link: "/alunos?acao=novo",
  },
  {
    texto: "Nova Matrícula",
    icone: CreditCard,
    classe: "roxo",
    link: "/matriculas?acao=novo",
  },
  {
    texto: "Novo Pagamento",
    icone: Receipt,
    classe: "azul",
    link: "/pagamentos?acao=novo",
  },
  {
    texto: "Novo Produto",
    icone: PackagePlus,
    classe: "laranja",
    link: "/produtos?acao=novo",
  },
];

function authConfig() {
  const token = localStorage.getItem("token");

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
}

function normalizarLista(resposta) {
  const dados = resposta?.data;

  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.dados)) return dados.dados;
  if (Array.isArray(dados?.items)) return dados.items;
  if (Array.isArray(dados?.resultado)) return dados.resultado;

  return [];
}

function texto(valor, fallback = "") {
  if (typeof valor === "string") return valor;
  if (valor && typeof valor === "object") {
    return (
      valor.nome ??
      valor.name ??
      valor.descricao ??
      valor.titulo ??
      fallback
    );
  }

  return fallback;
}

function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

function obterData(item, campos) {
  for (const campo of campos) {
    if (item?.[campo]) {
      const data = new Date(item[campo]);

      if (!Number.isNaN(data.getTime())) {
        return data;
      }
    }
  }

  return null;
}

function formatarData(valor) {
  if (!valor) return "-";

  const data = valor instanceof Date ? valor : new Date(valor);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return numero(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarMoedaCompacta(valor) {
  const total = numero(valor);

  if (total === 0) return "R$ 0";

  return total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

function chaveMes(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function mesmoMes(data, referencia) {
  return (
    data &&
    data.getMonth() === referencia.getMonth() &&
    data.getFullYear() === referencia.getFullYear()
  );
}

function mesAnterior(data) {
  return new Date(data.getFullYear(), data.getMonth() - 1, 1);
}

function variacaoPercentual(atual, anterior) {
  if (anterior === 0) {
    if (atual === 0) return "0% este mês";
    return "100% este mês";
  }

  const variacao = ((atual - anterior) / anterior) * 100;
  const valor = Math.abs(variacao).toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });

  return `${variacao >= 0 ? "↑" : "↓"} ${valor}% este mês`;
}

function iniciais(nome) {
  const partes = String(nome || "Aluno")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return partes.map((parte) => parte[0]?.toUpperCase()).join("") || "AL";
}

function obterNomeUsuario() {
  const chaves = ["usuario", "user", "usuarioLogado"];

  for (const chave of chaves) {
    try {
      const valor = localStorage.getItem(chave);

      if (!valor) continue;

      const usuario = JSON.parse(valor);
      const nome =
        usuario?.nome ??
        usuario?.name ??
        usuario?.usuario ??
        usuario?.email;

      if (nome) return String(nome).split(" ")[0];
    } catch {
      // Ignora dados antigos inválidos do localStorage.
    }
  }

  try {
    const token = localStorage.getItem("token");

    if (token) {
      const parte = token.split(".")[1];
      const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split("")
            .map(
              (caractere) =>
                `%${caractere.charCodeAt(0).toString(16).padStart(2, "0")}`
            )
            .join("")
        )
      );

      const nome =
        payload?.nome ??
        payload?.name ??
        payload?.unique_name ??
        payload?.sub;

      if (nome) return String(nome).split(" ")[0];
    }
  } catch {
    // Usa o nome padrão abaixo.
  }

  return "Administrador";
}

function matriculaAtiva(matricula) {
  const status = String(matricula?.status ?? "").toLowerCase();

  if (
    matricula?.ativa === false ||
    status.includes("inativ") ||
    status.includes("cancel")
  ) {
    return false;
  }

  return true;
}

function pagamentoConfirmado(pagamento) {
  const status = String(pagamento?.status ?? "").toLowerCase();

  if (
    status.includes("pendent") ||
    status.includes("cancel") ||
    status.includes("estorn")
  ) {
    return false;
  }

  return true;
}

function nomeAlunoMatricula(matricula, alunos) {
  const nomeDireto =
    texto(matricula?.aluno) ||
    matricula?.alunoNome ||
    matricula?.nomeAluno;

  if (nomeDireto) return nomeDireto;

  const alunoId =
    matricula?.alunoId ??
    matricula?.aluno?.id;

  const aluno = alunos.find(
    (item) => String(item.id) === String(alunoId)
  );

  return texto(aluno, "Aluno não encontrado");
}

function nomePlanoMatricula(matricula, planos) {
  const nomeDireto =
    texto(matricula?.plano) ||
    matricula?.planoNome ||
    matricula?.nomePlano;

  if (nomeDireto) return nomeDireto;

  const planoId =
    matricula?.planoId ??
    matricula?.plano?.id;

  const plano = planos.find(
    (item) => String(item.id) === String(planoId)
  );

  return texto(plano, "Sem plano");
}

function valorPlano(nomePlano, planoId, planos, matricula) {
  const plano = planos.find((item) => {
    if (planoId != null && String(item.id) === String(planoId)) {
      return true;
    }

    return (
      texto(item).toLocaleLowerCase("pt-BR") ===
      String(nomePlano).toLocaleLowerCase("pt-BR")
    );
  });

  return (
    numero(plano?.valor) ||
    numero(matricula?.planoValor) ||
    numero(matricula?.valorPlano)
  );
}

function identificarAlunoMatricula(matricula, alunos) {
  const id =
    matricula?.alunoId ??
    matricula?.aluno?.id;

  if (id != null) return `id:${id}`;

  return `nome:${nomeAlunoMatricula(matricula, alunos).toLocaleLowerCase(
    "pt-BR"
  )}`;
}

function statusMatricula(matricula) {
  const status = String(matricula?.status ?? "").toLowerCase();

  if (
    matricula?.temPagamentoPendente === true ||
    status.includes("pendent")
  ) {
    return "Pendente";
  }

  if (!matriculaAtiva(matricula)) {
    return "Inativa";
  }

  return "Ativa";
}

function dadosPagamento(
  pagamento,
  matriculas,
  alunos,
  planos,
  produtos
) {
  const matriculaId =
    pagamento?.matriculaId ??
    pagamento?.matricula?.id;

  const matricula = matriculas.find(
    (item) => String(item.id) === String(matriculaId)
  );

  const aluno =
    texto(pagamento?.aluno) ||
    pagamento?.alunoNome ||
    pagamento?.nomeAluno ||
    (matricula
      ? nomeAlunoMatricula(matricula, alunos)
      : "Aluno não informado");

  const produtoId =
    pagamento?.produtoId ??
    pagamento?.produto?.id;

  const produto = produtos.find(
    (item) => String(item.id) === String(produtoId)
  );

  const origemProduto =
    texto(pagamento?.produto) ||
    pagamento?.produtoNome ||
    texto(produto);

  const origemPlano =
    texto(pagamento?.plano) ||
    pagamento?.planoNome ||
    (matricula ? nomePlanoMatricula(matricula, planos) : "");

  return {
    id: pagamento?.id,
    nome: aluno,
    origem:
      origemProduto ||
      origemPlano ||
      pagamento?.descricao ||
      "Pagamento",
    data: obterData(pagamento, [
      "dataPagamento",
      "data",
      "criadoEm",
      "createdAt",
    ]),
    valor: numero(
      pagamento?.valor ??
        pagamento?.preco ??
        pagamento?.total
    ),
  };
}

function quantidadeProdutoPagamento(pagamento) {
  const produtoId =
    pagamento?.produtoId ??
    pagamento?.produto?.id;

  const tipo = String(
    pagamento?.tipoPagamento ??
      pagamento?.tipo ??
      pagamento?.descricao ??
      ""
  ).toLowerCase();

  const ehProduto =
    produtoId != null ||
    tipo.includes("produto");

  if (!ehProduto) return 0;

  return Math.max(
    1,
    numero(
      pagamento?.quantidade ??
        pagamento?.qtd ??
        pagamento?.produtoQuantidade
    )
  );
}

function periodoSemana() {
  const hoje = new Date();
  const dia = hoje.getDay();
  const deslocamentoSegunda = dia === 0 ? -6 : 1 - dia;

  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() + deslocamentoSegunda);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);

  const inicioTexto = inicio.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  const fimTexto = fim.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${inicioTexto} – ${fimTexto}`;
}

function criarDadosGrafico(pagamentos) {
  const hoje = new Date();
  const meses = Array.from({ length: 6 }, (_, indice) => {
    const diferenca = 5 - indice;

    return new Date(
      hoje.getFullYear(),
      hoje.getMonth() - diferenca,
      1
    );
  });

  const totais = meses.map((mes) => {
    const total = pagamentos.reduce((soma, pagamento) => {
      const data = obterData(pagamento, [
        "dataPagamento",
        "data",
        "criadoEm",
        "createdAt",
      ]);

      if (!data || chaveMes(data) !== chaveMes(mes)) {
        return soma;
      }

      return soma + numero(
        pagamento?.valor ??
          pagamento?.preco ??
          pagamento?.total
      );
    }, 0);

    return {
      mes,
      nome: mes
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      total,
    };
  });

  const largura = 720;
  const topo = 22;
  const base = 220;
  const margemX = 20;
  const maximo = Math.max(...totais.map((item) => item.total), 1);

  const pontos = totais.map((item, indice) => {
    const x =
      totais.length === 1
        ? largura / 2
        : margemX +
          (indice * (largura - margemX * 2)) /
            (totais.length - 1);

    const y =
      base -
      (item.total / maximo) * (base - topo);

    return { ...item, x, y };
  });

  return {
    pontos,
    linha: pontos.map((item) => `${item.x},${item.y}`).join(" "),
    area: `${margemX},${base} ${pontos
      .map((item) => `${item.x},${item.y}`)
      .join(" ")} ${largura - margemX},${base}`,
    maximo,
  };
}

function gradientePlanos(planos) {
  if (planos.length === 0) {
    return "conic-gradient(#223344 0 100%)";
  }

  let acumulado = 0;

  const partes = planos.map((plano, indice) => {
    const inicio = acumulado;
    acumulado += plano.percentual;

    return `${CORES_PLANOS[indice]} ${inicio}% ${acumulado}%`;
  });

  if (acumulado < 100) {
    partes.push(`#223344 ${acumulado}% 100%`);
  }

  return `conic-gradient(${partes.join(", ")})`;
}

function Avatar({ nome, classe = "verde" }) {
  return (
    <span className={`dashboard-avatar ${classe}`}>
      {iniciais(nome)}
    </span>
  );
}

export default function Dashboard() {
  const [pontoGraficoAtivo, setPontoGraficoAtivo] = useState(null);

  const [dados, setDados] = useState({
    alunos: [],
    matriculas: [],
    pagamentos: [],
    produtos: [],
    planos: [],
  });
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  const nomeUsuario = useMemo(() => obterNomeUsuario(), []);

  const carregarDashboard = useCallback(async (atualizacaoManual = false) => {
    try {
      if (atualizacaoManual) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }

      setErro("");

      const nomes = Object.keys(ENDPOINTS);
      const requisicoes = nomes.map((nome) =>
        axios.get(
          `${API_URL}${ENDPOINTS[nome]}`,
          authConfig()
        )
      );

      const resultados = await Promise.allSettled(requisicoes);
      const novosDados = {};
      const falhas = [];

      resultados.forEach((resultado, indice) => {
        const nome = nomes[indice];

        if (resultado.status === "fulfilled") {
          novosDados[nome] = normalizarLista(resultado.value);
        } else {
          novosDados[nome] = [];
          falhas.push(nome);

          console.error(
            `Erro ao carregar ${nome}:`,
            resultado.reason?.response?.data ??
              resultado.reason
          );
        }
      });

      setDados(novosDados);

      if (falhas.length > 0) {
        setErro(
          `Algumas informações não foram carregadas: ${falhas.join(
            ", "
          )}. Confira os endpoints no início do Dashboard.jsx.`
        );
      }
    } catch (error) {
      console.error(
        "Erro ao carregar o dashboard:",
        error?.response?.data ?? error
      );

      setErro("Não foi possível carregar as informações do dashboard.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  const informacoes = useMemo(() => {
    const agora = new Date();
    const anterior = mesAnterior(agora);

    const matriculasAtivas = dados.matriculas.filter(matriculaAtiva);

    const alunosAtivos = new Set(
      matriculasAtivas.map((matricula) =>
        identificarAlunoMatricula(matricula, dados.alunos)
      )
    ).size;

    const pagamentosConfirmados =
      dados.pagamentos.filter(pagamentoConfirmado);

    const pagamentosMesAtual = pagamentosConfirmados.filter(
      (pagamento) =>
        mesmoMes(
          obterData(pagamento, [
            "dataPagamento",
            "data",
            "criadoEm",
            "createdAt",
          ]),
          agora
        )
    );

    const pagamentosMesAnterior = pagamentosConfirmados.filter(
      (pagamento) =>
        mesmoMes(
          obterData(pagamento, [
            "dataPagamento",
            "data",
            "criadoEm",
            "createdAt",
          ]),
          anterior
        )
    );

    const faturamentoAtual = pagamentosMesAtual.reduce(
      (soma, pagamento) =>
        soma +
        numero(
          pagamento?.valor ??
            pagamento?.preco ??
            pagamento?.total
        ),
      0
    );

    const faturamentoAnterior = pagamentosMesAnterior.reduce(
      (soma, pagamento) =>
        soma +
        numero(
          pagamento?.valor ??
            pagamento?.preco ??
            pagamento?.total
        ),
      0
    );

    const produtosAtual = pagamentosMesAtual.reduce(
      (soma, pagamento) =>
        soma + quantidadeProdutoPagamento(pagamento),
      0
    );

    const produtosAnterior = pagamentosMesAnterior.reduce(
      (soma, pagamento) =>
        soma + quantidadeProdutoPagamento(pagamento),
      0
    );

    const matriculasMesAtual = dados.matriculas.filter((matricula) =>
      mesmoMes(
        obterData(matricula, [
          "dataInicio",
          "dataCadastro",
          "criadoEm",
          "createdAt",
        ]),
        agora
      )
    ).length;

    const matriculasMesAnterior = dados.matriculas.filter(
      (matricula) =>
        mesmoMes(
          obterData(matricula, [
            "dataInicio",
            "dataCadastro",
            "criadoEm",
            "createdAt",
          ]),
          anterior
        )
    ).length;

    const alunosNovosAtual = new Set(
      dados.matriculas
        .filter((matricula) =>
          mesmoMes(
            obterData(matricula, [
              "dataInicio",
              "dataCadastro",
              "criadoEm",
              "createdAt",
            ]),
            agora
          )
        )
        .map((matricula) =>
          identificarAlunoMatricula(matricula, dados.alunos)
        )
    ).size;

    const alunosNovosAnterior = new Set(
      dados.matriculas
        .filter((matricula) =>
          mesmoMes(
            obterData(matricula, [
              "dataInicio",
              "dataCadastro",
              "criadoEm",
              "createdAt",
            ]),
            anterior
          )
        )
        .map((matricula) =>
          identificarAlunoMatricula(matricula, dados.alunos)
        )
    ).size;

    const resumo = [
      {
        titulo: "Alunos Ativos",
        valor: String(alunosAtivos),
        variacao: variacaoPercentual(
          alunosNovosAtual,
          alunosNovosAnterior
        ),
        icone: Users,
        classe: "verde",
        link: "/alunos",
      },
      {
        titulo: "Matrículas",
        valor: String(dados.matriculas.length),
        variacao: variacaoPercentual(
          matriculasMesAtual,
          matriculasMesAnterior
        ),
        icone: CreditCard,
        classe: "roxo",
        link: "/matriculas",
      },
      {
        titulo: "Faturamento",
        valor: formatarMoeda(faturamentoAtual),
        variacao: variacaoPercentual(
          faturamentoAtual,
          faturamentoAnterior
        ),
        icone: DollarSign,
        classe: "azul",
        link: "/pagamentos",
      },
      {
        titulo: "Produtos Vendidos",
        valor: String(produtosAtual),
        variacao: variacaoPercentual(
          produtosAtual,
          produtosAnterior
        ),
        icone: ShoppingBag,
        classe: "laranja",
        link: "/produtos",
      },
    ];

    const matriculasRecentes = [...dados.matriculas]
      .sort((a, b) => {
        const dataA =
          obterData(a, [
            "dataInicio",
            "dataCadastro",
            "criadoEm",
            "createdAt",
          ])?.getTime() ?? 0;

        const dataB =
          obterData(b, [
            "dataInicio",
            "dataCadastro",
            "criadoEm",
            "createdAt",
          ])?.getTime() ?? 0;

        return dataB - dataA;
      })
      .slice(0, 5)
      .map((matricula, indice) => ({
        id: matricula?.id,
        nome: nomeAlunoMatricula(matricula, dados.alunos),
        plano: nomePlanoMatricula(matricula, dados.planos),
        data: obterData(matricula, [
          "dataInicio",
          "dataCadastro",
          "criadoEm",
          "createdAt",
        ]),
        status: statusMatricula(matricula),
        classe: CLASSES[indice % CLASSES.length],
      }));

    const pagamentosRecentes = pagamentosConfirmados
      .map((pagamento) =>
        dadosPagamento(
          pagamento,
          dados.matriculas,
          dados.alunos,
          dados.planos,
          dados.produtos
        )
      )
      .sort(
        (a, b) =>
          (b.data?.getTime() ?? 0) -
          (a.data?.getTime() ?? 0)
      )
      .slice(0, 5)
      .map((pagamento, indice) => ({
        ...pagamento,
        classe: CLASSES[indice % CLASSES.length],
      }));

    const contagemPlanos = new Map();

    dados.matriculas.forEach((matricula) => {
      const nome = nomePlanoMatricula(
        matricula,
        dados.planos
      );

      if (!nome || nome === "Sem plano") return;

      const atual = contagemPlanos.get(nome) ?? {
        nome,
        contratos: 0,
        valor: 0,
        planoId:
          matricula?.planoId ??
          matricula?.plano?.id,
        matricula,
      };

      atual.contratos += 1;
      atual.valor =
        atual.valor ||
        valorPlano(
          nome,
          atual.planoId,
          dados.planos,
          matricula
        );

      contagemPlanos.set(nome, atual);
    });

    const planosMaisContratados = [...contagemPlanos.values()]
      .sort((a, b) => b.contratos - a.contratos)
      .slice(0, 4)
      .map((plano, indice) => ({
        ...plano,
        posicao: indice + 1,
        classe: CLASSES[indice % CLASSES.length],
      }));

    const contagemAtivos = new Map();

    matriculasAtivas.forEach((matricula) => {
      const nome = nomePlanoMatricula(
        matricula,
        dados.planos
      );

      if (!nome || nome === "Sem plano") return;

      contagemAtivos.set(
        nome,
        (contagemAtivos.get(nome) ?? 0) + 1
      );
    });

    const totalDistribuicao = [...contagemAtivos.values()].reduce(
      (soma, valor) => soma + valor,
      0
    );

    const distribuicaoPlanos = [...contagemAtivos.entries()]
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
        percentual:
          totalDistribuicao > 0
            ? (quantidade / totalDistribuicao) * 100
            : 0,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 4)
      .map((plano, indice) => ({
        ...plano,
        classe: CLASSES[indice % CLASSES.length],
      }));

    return {
      resumo,
      alunosAtivos,
      faturamentoAtual,
      matriculasRecentes,
      pagamentosRecentes,
      planosMaisContratados,
      distribuicaoPlanos,
      grafico: criarDadosGrafico(pagamentosConfirmados),
    };
  }, [dados]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-page-header">
        <div>
          <h1>Bem-vindo 👋</h1>
          <p>Aqui está o resumo geral da academia.</p>
        </div>

        <button
          type="button"
          className="dashboard-date-button"
          onClick={() => carregarDashboard(true)}
          disabled={atualizando}
          title="Atualizar informações do dashboard"
        >
          <CalendarDays size={18} />
          <span>{periodoSemana()}</span>

          <RefreshCw
            size={15}
            className={atualizando ? "dashboard-spinning" : ""}
          />
        </button>
      </header>

      {erro && (
        <div className="dashboard-feedback erro">
          {erro}
        </div>
      )}

      {carregando && (
        <div className="dashboard-feedback">
          <RefreshCw size={17} className="dashboard-spinning" />
          Carregando informações reais da academia...
        </div>
      )}

      <section className="dashboard-layout">
        <div className="dashboard-main-column">
          <section className="dashboard-summary-grid">
            {informacoes.resumo.map(
              ({
                titulo,
                valor,
                variacao,
                icone: Icone,
                classe,
                link,
              }) => (
                <Link
                  to={link}
                  className="dashboard-summary-card"
                  key={titulo}
                >
                  <span
                    className={`dashboard-summary-icon ${classe}`}
                  >
                    <Icone size={25} />
                  </span>

                  <div>
                    <span>{titulo}</span>
                    <strong title={valor}>{valor}</strong>
                    <small>
                      <TrendingUp size={13} />
                      {variacao}
                    </small>
                  </div>
                </Link>
              )
            )}
          </section>

          <section className="dashboard-analytics-grid">
            <article className="dashboard-card dashboard-revenue-card">
              <header className="dashboard-card-header">
                <h2>Faturamento</h2>
              </header>

              <div className="dashboard-chart-area">
                <div className="dashboard-chart-y">
                  <span>
                    {formatarMoedaCompacta(
                      informacoes.grafico.maximo
                    )}
                  </span>
                  <span>
                    {formatarMoedaCompacta(
                      informacoes.grafico.maximo * 0.66
                    )}
                  </span>
                  <span>
                    {formatarMoedaCompacta(
                      informacoes.grafico.maximo * 0.33
                    )}
                  </span>
                  <span>R$ 0</span>
                </div>

                <div className="dashboard-chart">
                  <svg
                    viewBox="0 0 720 250"
                    preserveAspectRatio="none"
                    aria-label="Gráfico de faturamento dos últimos seis meses"
                    onMouseLeave={() => setPontoGraficoAtivo(null)}
                  >
                    <defs>
                      <linearGradient
                        id="dashboardArea"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#32d487"
                          stopOpacity="0.36"
                        />
                        <stop
                          offset="100%"
                          stopColor="#32d487"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {[35, 95, 155, 215].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="720"
                        y1={y}
                        y2={y}
                        className="dashboard-chart-line"
                      />
                    ))}

                    {informacoes.grafico.pontos.map((ponto) => (
                      <g
                        key={`${ponto.x}-${ponto.y}`}
                        className="dashboard-chart-marker"
                        onMouseEnter={() => setPontoGraficoAtivo(ponto)}
                        onMouseLeave={() => setPontoGraficoAtivo(null)}
                      >
                        <circle
                          cx={ponto.x}
                          cy={ponto.y}
                          r="15"
                          className="dashboard-chart-hit-area"
                        />

                        <circle
                          cx={ponto.x}
                          cy={ponto.y}
                          r="5"
                          className="dashboard-chart-point"
                        />
                      </g>
                    ))}

                    {informacoes.grafico.pontos.map((ponto, indice, pontos) => {
                      const pontoAnterior = pontos[indice - 1];
                      const proximoPonto = pontos[indice + 1];

                      const inicioArea =
                        indice === 0
                          ? 0
                          : (pontoAnterior.x + ponto.x) / 2;

                      const fimArea =
                        indice === pontos.length - 1
                          ? 720
                          : (ponto.x + proximoPonto.x) / 2;

                      return (
                        <rect
                          key={`area-${chaveMes(ponto.mes)}`}
                          x={inicioArea}
                          y="0"
                          width={fimArea - inicioArea}
                          height="250"
                          className="dashboard-chart-hover-area"
                          onMouseEnter={() => setPontoGraficoAtivo(ponto)}
                        />
                      );
                    })}

                    <polygon
                      points={informacoes.grafico.area}
                      fill="url(#dashboardArea)"
                    />

                    <polyline
                      points={informacoes.grafico.linha}
                      className="dashboard-chart-curve"
                    />

                    {informacoes.grafico.pontos.map(
                      (ponto) => (
                        <circle
                          key={`${ponto.x}-${ponto.y}`}
                          cx={ponto.x}
                          cy={ponto.y}
                          r="5"
                          className="dashboard-chart-point"
                        />
                      )
                    )}
                  </svg>

                  <div className="dashboard-chart-labels">
                    {informacoes.grafico.pontos.map((ponto) => (
                      <span key={chaveMes(ponto.mes)}>
                        {ponto.nome}
                      </span>
                    ))}
                  </div>

                  {pontoGraficoAtivo && (
                    <div
                      className="dashboard-chart-tooltip dashboard-chart-tooltip-dynamic"
                      style={{
                        left: `${(pontoGraficoAtivo.x / 720) * 100}%`,
                        top: `${(pontoGraficoAtivo.y / 250) * 100}%`,
                      }}
                    >
                      <strong>
                        {formatarMoeda(pontoGraficoAtivo.total)}
                      </strong>

                      <span>
                        {pontoGraficoAtivo.mes.toLocaleDateString(
                          "pt-BR",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <article className="dashboard-card dashboard-plans-chart">
              <header className="dashboard-card-header">
                <h2>Alunos por Plano</h2>
              </header>

              <div className="dashboard-donut-content">
                <div
                  className="dashboard-donut"
                  style={{
                    background: gradientePlanos(
                      informacoes.distribuicaoPlanos
                    ),
                  }}
                >
                  <div>
                    <strong>{informacoes.alunosAtivos}</strong>
                    <span>Total</span>
                  </div>
                </div>

                <div className="dashboard-donut-legend">
                  {informacoes.distribuicaoPlanos.length === 0 ? (
                    <div className="dashboard-empty-list">
                      Nenhuma matrícula ativa.
                    </div>
                  ) : (
                    informacoes.distribuicaoPlanos.map(
                      (plano, indice) => (
                        <span key={plano.nome}>
                          <i
                            style={{
                              background:
                                CORES_PLANOS[indice],
                            }}
                          />
                          {plano.nome}
                          <b>
                            {plano.quantidade} (
                            {plano.percentual.toLocaleString(
                              "pt-BR",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                            %)
                          </b>
                        </span>
                      )
                    )
                  )}
                </div>
              </div>
            </article>
          </section>

          <article className="dashboard-card dashboard-enrollments-card">
            <header className="dashboard-card-header">
              <h2>Matrículas Recentes</h2>

              <Link
                to="/matriculas"
                className="dashboard-link-button"
              >
                Ver todas
              </Link>
            </header>

            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Plano</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {informacoes.matriculasRecentes.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="dashboard-empty-row"
                      >
                        Nenhuma matrícula cadastrada.
                      </td>
                    </tr>
                  ) : (
                    informacoes.matriculasRecentes.map(
                      (matricula) => (
                        <tr
                          key={
                            matricula.id ??
                            `${matricula.nome}-${matricula.data}`
                          }
                        >
                          <td>
                            <div className="dashboard-person">
                              <Avatar
                                nome={matricula.nome}
                                classe={matricula.classe}
                              />
                              <strong>{matricula.nome}</strong>
                            </div>
                          </td>

                          <td>{matricula.plano}</td>

                          <td>
                            <span
                              className={`dashboard-status ${matricula.status.toLowerCase()}`}
                            >
                              {matricula.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="dashboard-side-column">
          <article className="dashboard-card dashboard-list-card">
            <header className="dashboard-card-header">
              <h2>Pagamentos Recentes</h2>

              <Link
                to="/pagamentos"
                className="dashboard-link-button"
              >
                Ver todos
              </Link>
            </header>

            <div className="dashboard-payment-list">
              {informacoes.pagamentosRecentes.length === 0 ? (
                <div className="dashboard-empty-list">
                  Nenhum pagamento confirmado.
                </div>
              ) : (
                informacoes.pagamentosRecentes.map((pagamento) => (
                  <div
                    className="dashboard-payment-item"
                    key={pagamento.id ?? `${pagamento.nome}-${pagamento.data}`}
                  >
                    <Avatar
                      nome={pagamento.nome}
                      classe={pagamento.classe}
                    />

                    <div>
                      <strong>{pagamento.nome}</strong>
                      <div className="dashboard-payment-meta">
                        <span>{pagamento.origem}</span>
                        <time>{formatarData(pagamento.data)}</time>
                      </div>
                    </div>  
                    
                    <b>{formatarMoeda(pagamento.valor)}</b>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="dashboard-card dashboard-list-card">
            <header className="dashboard-card-header">
              <h2>Planos Mais Contratados</h2>

              <Link
                to="/planos"
                className="dashboard-link-button"
              >
                Ver todos
              </Link>
            </header>

            <div className="dashboard-ranking">
              {informacoes.planosMaisContratados.length === 0 ? (
                <div className="dashboard-empty-list">
                  Nenhum plano contratado.
                </div>
              ) : (
                informacoes.planosMaisContratados.map(
                  (plano) => (
                    <div
                      className="dashboard-ranking-item"
                      key={plano.nome}
                    >
                      <span className="dashboard-ranking-position">
                        {plano.posicao}
                      </span>

                      <span
                        className={`dashboard-ranking-icon ${plano.classe}`}
                      >
                        <CreditCard size={17} />
                      </span>

                      <div>
                        <strong>{plano.nome}</strong>
                        <small>
                          {plano.contratos} contratos
                        </small>
                      </div>

                      <b>{formatarMoeda(plano.valor)}</b>
                    </div>
                  )
                )
              )}
            </div>
          </article>

          <article className="dashboard-card dashboard-quick-card">
            <header className="dashboard-card-header">
              <h2>Ações Rápidas</h2>
            </header>

            <div className="dashboard-quick-actions">
              {ACOES.map(
                ({
                  texto: nomeAcao,
                  icone: Icone,
                  classe,
                  link,
                }) => (
                  <Link
                    to={link}
                    className="dashboard-quick-action"
                    key={nomeAcao}
                  >
                    <span className={classe}>
                      <Icone size={20} />
                    </span>
                    {nomeAcao}
                  </Link>
                )
              )}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}