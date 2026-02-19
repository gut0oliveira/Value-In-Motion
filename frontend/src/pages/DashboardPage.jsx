import { useEffect, useMemo, useState } from "react";
import {
  buscarVisaoFinancas,
  buscarContas,
  buscarCategorias,
  buscarTransacoes,
  criarTransacao,
} from "../lib/api";
import { getFirstUsername, getLastUsername } from "../lib/auth";

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

function inicioPorPeriodo(periodo) {
  const hoje = inicioHoje();
  if (periodo === "mes") return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  if (periodo === "30d") return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30);
  if (periodo === "90d") return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 90);
  return new Date(hoje.getFullYear(), 0, 1);
}

function formatarPercentual(valor) {
  if (valor === null || Number.isNaN(valor)) return "-";
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${valor.toFixed(1)}%`;
}

function tipoContaLabel(tipo) {
  if (tipo === "checking") return "Conta corrente";
  if (tipo === "savings") return "Poupanca";
  if (tipo === "wallet") return "Carteira";
  if (tipo === "credit_card") return "Cartao";
  return tipo;
}

export default function DashboardPage() {
  const PrimeiroNomeUsuario = getFirstUsername();
  const UltimoNomeUsuario = getLastUsername();
  const NomeExibicaoUsuario = [PrimeiroNomeUsuario, UltimoNomeUsuario].filter(Boolean).join(" ");
  const [visaoApi, setVisaoApi] = useState(null);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [filtroConta, setFiltroConta] = useState("all");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState("expense");
  const [erroModal, setErroModal] = useState("");
  const [salvandoModal, setSalvandoModal] = useState(false);
  const [formTransacao, setFormTransacao] = useState({
    account: "",
    category: "",
    description: "",
    amount: "",
    occurred_on: new Date().toISOString().slice(0, 10),
  });

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

  const transacoesFiltradas = useMemo(() => {
    const inicio = inicioPorPeriodo(periodo);
    return transacoes.filter((item) => {
      const validaPeriodo = paraData(item.occurred_on) >= inicio;
      const validaConta = filtroConta === "all" || String(item.account) === String(filtroConta);
      return validaPeriodo && validaConta;
    });
  }, [transacoes, periodo, filtroConta]);

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

  const comparativoSaldo = useMemo(() => {
    const fim = inicioHoje();
    const inicio = inicioPorPeriodo(periodo);
    const dias = Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)));
    const inicioAnterior = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() - dias);
    const fimAnterior = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate() - dias);

    const transacoesAnterior = transacoes.filter((item) => {
      if (filtroConta !== "all" && String(item.account) !== String(filtroConta)) return false;
      const data = paraData(item.occurred_on);
      return data >= inicioAnterior && data <= fimAnterior;
    });

    const receitasAnterior = transacoesAnterior
      .filter((item) => item.transaction_type === "income")
      .reduce((total, item) => total + Number(item.amount), 0);

    const despesasAnterior = transacoesAnterior
      .filter((item) => item.transaction_type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0);

    const saldoAnterior = receitasAnterior - despesasAnterior;

    if (saldoAnterior === 0) return null;
    return ((totais.saldo - saldoAnterior) / Math.abs(saldoAnterior)) * 100;
  }, [transacoes, periodo, filtroConta, totais.saldo]);

  const tendenciaDiaria = useMemo(() => {
    const mapa = {};
    transacoesFiltradas.forEach((item) => {
      if (!mapa[item.occurred_on]) mapa[item.occurred_on] = { income: 0, expense: 0 };
      mapa[item.occurred_on][item.transaction_type] += Number(item.amount);
    });

    return Object.entries(mapa)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([data, valores]) => ({
        data,
        receita: valores.income,
        despesa: valores.expense,
      }));
  }, [transacoesFiltradas]);

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

  const proximasDespesas = useMemo(() => {
    const hoje = inicioHoje();
    const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 30);
    return transacoes
      .filter((item) => {
        if (item.transaction_type !== "expense") return false;
        if (filtroConta !== "all" && String(item.account) !== String(filtroConta)) return false;
        const data = paraData(item.occurred_on);
        return data >= hoje && data <= limite;
      })
      .sort((a, b) => a.occurred_on.localeCompare(b.occurred_on))
      .slice(0, 5);
  }, [transacoes, filtroConta]);

  const atividadeRecente = useMemo(
    () => [...transacoesFiltradas].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on)).slice(0, 5),
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
      occurred_on: new Date().toISOString().slice(0, 10),
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
    <main className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-3 rounded-2xl bg-ink px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Bem-vindo</p>
          <h1 className="text-2xl font-black uppercase">
            {NomeExibicaoUsuario || "Usuario"}
          </h1>
          <p className="mt-1 text-sm text-slate-300">Financas pessoais com foco em fluxo e clareza.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => abrirModalLancamento("income")}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400"
          >
            Nova receita
          </button>
          <button
            onClick={() => abrirModalLancamento("expense")}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold hover:bg-amber-400"
          >
            Nova despesa
          </button>
        </div>
      </header>

      <section className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Periodo
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="mes">Mes atual</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="90d">Ultimos 90 dias</option>
            <option value="ano">Ano atual</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Conta
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={filtroConta}
            onChange={(e) => setFiltroConta(e.target.value)}
          >
            <option value="all">Todas as contas</option>
            {contas.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.name} ({tipoContaLabel(conta.account_type)})
              </option>
            ))}
          </select>
        </label>
      </section>

      {carregando ? (
        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {["a", "b", "c", "d"].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </section>
      ) : null}

      {erro ? <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

      {!carregando && !erro ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Saldo no periodo</p>
              <p className="mt-2 text-2xl font-black text-ink">{formatoMoeda.format(totais.saldo)}</p>
              <p className="mt-1 text-xs text-slate-500">
                vs periodo anterior: {formatarPercentual(comparativoSaldo)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Receitas</p>
              <p className="mt-2 text-2xl font-black text-green-700">{formatoMoeda.format(totais.receitas)}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Despesas</p>
              <p className="mt-2 text-2xl font-black text-rose-700">{formatoMoeda.format(totais.despesas)}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Taxa de poupanca</p>
              <p className="mt-2 text-2xl font-black text-sky-700">
                {formatarPercentual(totais.taxaPoupanca)}
              </p>
            </article>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <h2 className="text-lg font-bold text-ink">Tendencia diaria (14 dias)</h2>
              {tendenciaDiaria.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">Sem transacoes suficientes para exibir.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {tendenciaDiaria.map((item) => {
                    const max = Math.max(item.receita, item.despesa, 1);
                    return (
                      <li key={item.data}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                          <span>{item.data}</span>
                          <span>
                            +{formatoMoeda.format(item.receita)} / -{formatoMoeda.format(item.despesa)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 rounded bg-green-100">
                            <div
                              className="h-2 rounded bg-green-500"
                              style={{ width: `${(item.receita / max) * 100}%` }}
                            />
                          </div>
                          <div className="h-2 rounded bg-rose-100">
                            <div
                              className="h-2 rounded bg-rose-500"
                              style={{ width: `${(item.despesa / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-ink">Gastos por categoria</h2>
              {gastosCategoria.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Nenhuma despesa no periodo.</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm">
                  {gastosCategoria.map((item) => (
                    <li key={item.nome}>
                      <div className="mb-1 flex justify-between">
                        <span className="font-medium text-slate-700">{item.nome}</span>
                        <span className="text-slate-600">{formatoMoeda.format(item.valor)}</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200">
                        <div
                          className="h-2 rounded bg-sky-600"
                          style={{ width: `${item.percentual}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-ink">Proximas despesas (30 dias)</h2>
              {proximasDespesas.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Sem despesas futuras cadastradas.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {proximasDespesas.map((item) => (
                    <li key={item.id} className="rounded-lg bg-clay px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.description || "Despesa programada"}</span>
                        <span className="font-semibold text-rose-700">
                          {formatoMoeda.format(Number(item.amount))}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {item.occurred_on} �{" "}
                        {nomeCategoriaPorId[item.category] || `Categoria #${item.category}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-ink">Atividade recente</h2>
              {atividadeRecente.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Sem movimentacoes no periodo.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {atividadeRecente.map((item) => (
                    <li key={item.id} className="rounded-lg bg-clay px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.description || "Sem descricao"}</span>
                        <span
                          className={
                            item.transaction_type === "income"
                              ? "font-semibold text-green-700"
                              : "font-semibold text-rose-700"
                          }
                        >
                          {item.transaction_type === "income" ? "+" : "-"}
                          {formatoMoeda.format(Number(item.amount))}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {item.occurred_on} �{" "}
                        {nomeCategoriaPorId[item.category] || `Categoria #${item.category}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-ink">Status tecnico da API</h2>
            <pre className="mt-3 overflow-auto rounded-lg bg-clay p-3 text-xs text-slate-700">
              {JSON.stringify(visaoApi, null, 2)}
            </pre>
          </section>
        </>
      ) : null}

      {modalAberto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-black text-ink">
              {tipoLancamento === "income" ? "Nova receita" : "Nova despesa"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Preencha os campos para registrar a transacao.</p>

            <form className="mt-5 space-y-3" onSubmit={salvarTransacao}>
              <label className="block text-sm font-medium text-slate-700">
                Conta
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formTransacao.account}
                  onChange={(e) =>
                    setFormTransacao((atual) => ({ ...atual, account: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione</option>
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Categoria
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formTransacao.category}
                  onChange={(e) =>
                    setFormTransacao((atual) => ({ ...atual, category: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione</option>
                  {categoriasDoTipo.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Descricao
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formTransacao.description}
                  onChange={(e) =>
                    setFormTransacao((atual) => ({ ...atual, description: e.target.value }))
                  }
                  placeholder="Ex: salario, mercado, aluguel..."
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Valor
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={formTransacao.amount}
                    onChange={(e) =>
                      setFormTransacao((atual) => ({ ...atual, amount: e.target.value }))
                    }
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Data
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={formTransacao.occurred_on}
                    onChange={(e) =>
                      setFormTransacao((atual) => ({ ...atual, occurred_on: e.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              {erroModal ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroModal}</p>
              ) : null}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoModal}
                  className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {salvandoModal ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
