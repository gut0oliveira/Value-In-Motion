import { useEffect, useMemo, useState } from "react";
import {
  buscarCategorias,
  buscarContas,
  buscarTransacoes,
  buscarVisaoFinancas,
  criarTransacao,
} from "../lib/api";
import { getFirstUsername, getLastUsername } from "../lib/auth";
import DashboardCardsResumo from "../components/dashboard/DashboardCardsResumo";
import DashboardFiltros from "../components/dashboard/DashboardFiltros";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardModalLancamento from "../components/dashboard/DashboardModalLancamento";
import DashboardResumoKpis from "../components/dashboard/DashboardResumoKpis";
import DashboardTabelaStatus from "../components/dashboard/DashboardTabelaStatus";
import DashboardTendenciaCategoria from "../components/dashboard/DashboardTendenciaCategoria";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function paraData(dataTexto) {
  return new Date(`${dataTexto}T00:00:00`);
}

function inicioHoje() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

function dataIso(data) {
  return data.toISOString().slice(0, 10);
}

function inicioPorPeriodo(periodo) {
  const hoje = inicioHoje();
  if (periodo === "7d") return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6);
  if (periodo === "30d") return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 29);
  if (periodo === "90d") return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 89);
  if (periodo === "ano") return new Date(hoje.getFullYear(), 0, 1);
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function diasEntre(inicio, fim) {
  return Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)) + 1);
}

export default function DashboardPage() {
  // Cabecalho
  const nomeUsuario = [getFirstUsername(), getLastUsername()].filter(Boolean).join(" ");

  // Estado principal
  const [visaoApi, setVisaoApi] = useState(null);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  // Estado de filtros
  const [periodo, setPeriodo] = useState("mes");
  const [filtroConta, setFiltroConta] = useState("all");
  const [buscaDescricao, setBuscaDescricao] = useState("");

  // Estado de tela
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Estado do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState("expense");
  const [erroModal, setErroModal] = useState("");
  const [salvandoModal, setSalvandoModal] = useState(false);
  const [formTransacao, setFormTransacao] = useState({
    account: "",
    category: "",
    description: "",
    amount: "",
    occurred_on: dataIso(new Date()),
  });

  // Carga inicial
  useEffect(() => {
    async function carregarDados() {
      try {
        const [visao, contasApi, categoriasApi, transacoesApi] = await Promise.all([
          buscarVisaoFinancas(),
          buscarContas(),
          buscarCategorias(),
          buscarTransacoes(),
        ]);
        setVisaoApi(visao);
        setContas(contasApi);
        setCategorias(categoriasApi);
        setTransacoes(transacoesApi);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const nomeCategoriaPorId = useMemo(
    () => Object.fromEntries(categorias.map((categoria) => [categoria.id, categoria.name])),
    [categorias]
  );

  const hoje = inicioHoje();
  const hojeIso = dataIso(hoje);
  const inicioPeriodo = inicioPorPeriodo(periodo);

  const transacoesPeriodo = useMemo(() => {
    return transacoes.filter((item) => {
      const data = paraData(item.occurred_on);
      const validaConta = filtroConta === "all" || String(item.account) === String(filtroConta);
      return validaConta && data >= inicioPeriodo && data <= hoje;
    });
  }, [transacoes, filtroConta, inicioPeriodo, hoje]);

  const transacoesFiltradas = useMemo(() => {
    const termo = buscaDescricao.trim().toLowerCase();
    if (!termo) return transacoesPeriodo;
    return transacoesPeriodo.filter((item) => (item.description || "").toLowerCase().includes(termo));
  }, [transacoesPeriodo, buscaDescricao]);

  const totais = useMemo(() => {
    const receitas = transacoesFiltradas
      .filter((item) => item.transaction_type === "income")
      .reduce((total, item) => total + Number(item.amount), 0);
    const despesas = transacoesFiltradas
      .filter((item) => item.transaction_type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0);
    const saldo = receitas - despesas;
    const taxaPoupanca = receitas > 0 ? (saldo / receitas) * 100 : null;
    return { receitas, despesas, saldo, taxaPoupanca };
  }, [transacoesFiltradas]);

  const saldoContas = useMemo(
    () => contas.reduce((total, conta) => total + Number(conta.current_balance || 0), 0),
    [contas]
  );

  const transacoesHoje = useMemo(
    () => transacoes.filter((item) => item.occurred_on === hojeIso),
    [transacoes, hojeIso]
  );

  const resumoHoje = useMemo(() => {
    const receitas = transacoesHoje
      .filter((item) => item.transaction_type === "income")
      .reduce((total, item) => total + Number(item.amount), 0);
    const despesas = transacoesHoje
      .filter((item) => item.transaction_type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoesHoje]);

  const previsao30Dias = useMemo(() => {
    const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 30);
    let entradas = 0;
    let saidas = 0;

    transacoes.forEach((item) => {
      if (filtroConta !== "all" && String(item.account) !== String(filtroConta)) return;
      const data = paraData(item.occurred_on);
      if (data <= hoje || data > limite) return;
      if (item.transaction_type === "income") entradas += Number(item.amount);
      if (item.transaction_type === "expense") saidas += Number(item.amount);
    });

    return { entradas, saidas, saldo: entradas - saidas };
  }, [transacoes, filtroConta, hoje]);

  const gastosCategoria = useMemo(() => {
    const acumulado = {};

    transacoesFiltradas
      .filter((item) => item.transaction_type === "expense")
      .forEach((item) => {
        const nome = nomeCategoriaPorId[item.category] || `Categoria #${item.category}`;
        acumulado[nome] = (acumulado[nome] || 0) + Number(item.amount);
      });

    const total = Object.values(acumulado).reduce((soma, valor) => soma + valor, 0);
    return Object.entries(acumulado)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: total > 0 ? (valor / total) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [transacoesFiltradas, nomeCategoriaPorId]);

  const variacaoSaldo = useMemo(() => {
    const quantidadeDias = diasEntre(inicioPeriodo, hoje);
    const inicioAnterior = new Date(
      inicioPeriodo.getFullYear(),
      inicioPeriodo.getMonth(),
      inicioPeriodo.getDate() - quantidadeDias
    );
    const fimAnterior = new Date(
      inicioPeriodo.getFullYear(),
      inicioPeriodo.getMonth(),
      inicioPeriodo.getDate() - 1
    );

    const saldoAnterior = transacoes.reduce((total, item) => {
      if (filtroConta !== "all" && String(item.account) !== String(filtroConta)) return total;
      const data = paraData(item.occurred_on);
      if (data < inicioAnterior || data > fimAnterior) return total;
      const valor = Number(item.amount);
      return total + (item.transaction_type === "income" ? valor : -valor);
    }, 0);

    if (saldoAnterior === 0) return null;
    return ((totais.saldo - saldoAnterior) / Math.abs(saldoAnterior)) * 100;
  }, [transacoes, filtroConta, inicioPeriodo, hoje, totais.saldo]);

  const insights = useMemo(() => {
    const lista = [];

    if (totais.despesas > totais.receitas) {
      lista.push("Suas despesas estao acima das receitas no periodo atual.");
    } else {
      lista.push("Voce esta mantendo saldo positivo no periodo atual.");
    }

    if (gastosCategoria[0]?.percentual >= 35) {
      lista.push(`A categoria ${gastosCategoria[0].nome} concentra boa parte dos gastos.`);
    }

    if (previsao30Dias.saldo < 0) {
      lista.push("A previsao dos proximos 30 dias esta negativa. Ajuste despesas planejadas.");
    } else {
      lista.push("A previsao dos proximos 30 dias esta positiva.");
    }

    return lista.slice(0, 3);
  }, [totais, gastosCategoria, previsao30Dias]);

  const atividadeRecente = useMemo(
    () => [...transacoesFiltradas].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on)).slice(0, 8),
    [transacoesFiltradas]
  );

  const categoriasDoTipo = useMemo(
    () => categorias.filter((categoria) => categoria.transaction_type === tipoLancamento),
    [categorias, tipoLancamento]
  );

  function abrirModalLancamento(tipo) {
    setErroModal("");
    setTipoLancamento(tipo);
    const primeiraCategoria = categorias.find((categoria) => categoria.transaction_type === tipo);
    setFormTransacao({
      account: contas[0]?.id ? String(contas[0].id) : "",
      category: primeiraCategoria?.id ? String(primeiraCategoria.id) : "",
      description: "",
      amount: "",
      occurred_on: dataIso(new Date()),
    });
    setModalAberto(true);
  }

  async function salvarTransacao(evento) {
    evento.preventDefault();
    setErroModal("");
    setSalvandoModal(true);
    try {
      const transacaoCriada = await criarTransacao({
        account: Number(formTransacao.account),
        category: Number(formTransacao.category),
        transaction_type: tipoLancamento,
        description: formTransacao.description,
        amount: formTransacao.amount,
        occurred_on: formTransacao.occurred_on,
      });
      setTransacoes((atual) => [transacaoCriada, ...atual]);
      setModalAberto(false);
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvandoModal(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl">
      <DashboardHeader
        nomeUsuario={nomeUsuario}
        onNovaReceita={() => abrirModalLancamento("income")}
        onNovaDespesa={() => abrirModalLancamento("expense")}
      />

      <DashboardFiltros
        periodo={periodo}
        setPeriodo={setPeriodo}
        filtroConta={filtroConta}
        setFiltroConta={setFiltroConta}
        contas={contas}
      />

      {carregando ? (
        <section className="mt-6 grid gap-4 md:grid-cols-5">
          {["a", "b", "c", "d", "e"].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </section>
      ) : null}

      {erro ? <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

      {!carregando && !erro ? (
        <>
          <DashboardResumoKpis
            totais={totais}
            saldoContas={saldoContas}
            variacaoSaldo={variacaoSaldo}
            formatoMoeda={formatoMoeda}
          />

          <DashboardCardsResumo
            insights={insights}
            resumoHoje={resumoHoje}
            previsao30Dias={previsao30Dias}
            formatoMoeda={formatoMoeda}
          />

          <DashboardTendenciaCategoria
            gastosCategoria={gastosCategoria}
            formatoMoeda={formatoMoeda}
          />

          <DashboardTabelaStatus
            atividadeRecente={atividadeRecente}
            buscaDescricao={buscaDescricao}
            setBuscaDescricao={setBuscaDescricao}
            nomeCategoriaPorId={nomeCategoriaPorId}
            formatoMoeda={formatoMoeda}
            visaoApi={visaoApi}
          />
        </>
      ) : null}

      <DashboardModalLancamento
        aberto={modalAberto}
        tipoLancamento={tipoLancamento}
        erroModal={erroModal}
        salvandoModal={salvandoModal}
        formTransacao={formTransacao}
        contas={contas}
        categoriasDoTipo={categoriasDoTipo}
        onFechar={() => setModalAberto(false)}
        onSalvar={salvarTransacao}
        setFormTransacao={setFormTransacao}
      />
    </main>
  );
}
