import { useEffect, useMemo, useState } from "react";
import CartoesFormulario from "../components/cartoes/CartoesFormulario";
import CartoesLista from "../components/cartoes/CartoesLista";
import CartoesResumo from "../components/cartoes/CartoesResumo";
import useConfirmDialog from "../hooks/useConfirmDialog";
import {
  atualizarCartao,
  atualizarParcelamentoCartao,
  buscarCartoes,
  buscarCategorias,
  buscarParcelamentosCartao,
  buscarTransacoes,
  criarCartao,
  criarParcelamentoCartao,
  excluirCartao,
  excluirParcelamentoCartao,
} from "../lib/api";

function dataIso(data) {
  return data.toISOString().slice(0, 10);
}

function ajustarDia(ano, mesBaseZero, dia) {
  const ultimoDia = new Date(ano, mesBaseZero + 1, 0).getDate();
  return Math.min(dia, ultimoDia);
}

function proximaDataDia(dia) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diaHoje = hoje.getDate();
  const diaAtualMes = ajustarDia(ano, mes, dia);
  if (diaHoje <= diaAtualMes) return new Date(ano, mes, diaAtualMes);
  const proximoMes = mes + 1;
  const anoProximo = ano + Math.floor(proximoMes / 12);
  const mesProximo = proximoMes % 12;
  const diaProximoMes = ajustarDia(anoProximo, mesProximo, dia);
  return new Date(anoProximo, mesProximo, diaProximoMes);
}

function periodoFaturaAtual(cartao) {
  const fechamento = Number(cartao.closing_day || 25);
  const proximoFechamento = proximaDataDia(fechamento);
  const inicio = new Date(proximoFechamento.getFullYear(), proximoFechamento.getMonth() - 1, proximoFechamento.getDate() + 1);
  return { inicio: dataIso(inicio), fim: dataIso(proximoFechamento), proximoFechamento };
}

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [parcelamentos, setParcelamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvandoParcelamento, setSalvandoParcelamento] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarParcelamento, setMostrarParcelamento] = useState(false);
  const [editandoParcelamentoId, setEditandoParcelamentoId] = useState(null);
  const { confirmar, dialogo } = useConfirmDialog();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    limit_amount: "",
    closing_day: "25",
    due_day: "5",
    is_active: true,
  });
  const [formParcelamento, setFormParcelamento] = useState({
    credit_card: "",
    category: "",
    description: "",
    total_amount: "",
    installments_count: "2",
    purchase_date: dataIso(new Date()),
  });

  useEffect(() => {
    async function carregar() {
      try {
        const [cartoesApi, categoriasApi, transacoesApi, parcelamentosApi] = await Promise.all([
          buscarCartoes(),
          buscarCategorias(),
          buscarTransacoes(),
          buscarParcelamentosCartao(),
        ]);
        setCartoes(cartoesApi);
        setCategorias(categoriasApi);
        setTransacoes(transacoesApi);
        setParcelamentos(parcelamentosApi);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const cartoesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return cartoes.filter((item) => {
      const nomeOk = !termo || item.name.toLowerCase().includes(termo) || (item.brand || "").toLowerCase().includes(termo);
      const statusOk =
        filtroStatus === "all" ||
        (filtroStatus === "active" && item.is_active) ||
        (filtroStatus === "inactive" && !item.is_active);
      return nomeOk && statusOk;
    });
  }, [cartoes, busca, filtroStatus]);

  const cartoesComMetricas = useMemo(() => {
    return cartoesFiltrados.map((cartao) => {
      const limite = Number(cartao.limit_amount || 0);
      const periodo = periodoFaturaAtual(cartao);
      const comprasAvulsasNaFatura = transacoes
        .filter(
          (item) =>
            Number(item.credit_card) === Number(cartao.id) &&
            item.transaction_type === "expense" &&
            !item.installment_id &&
            item.occurred_on >= periodo.inicio &&
            item.occurred_on <= periodo.fim
        )
        .reduce((soma, item) => soma + Number(item.amount || 0), 0);
      const parcelasAbertas = parcelamentos
        .filter((purchase) => Number(purchase.credit_card) === Number(cartao.id))
        .flatMap((purchase) => purchase.installments || [])
        .filter((installment) => installment.status === "open")
        .reduce((soma, installment) => soma + Number(installment.amount || 0), 0);
      const usado = comprasAvulsasNaFatura + parcelasAbertas;
      const disponivel = Math.max(0, limite - usado);
      const percentualUso = limite > 0 ? Math.min(100, (usado / limite) * 100) : 0;
      return {
        ...cartao,
        limite,
        usado,
        disponivel,
        percentualUso,
      };
    });
  }, [cartoesFiltrados, transacoes, parcelamentos]);

  const categoriasDespesa = useMemo(
    () => categorias.filter((item) => item.transaction_type === "expense"),
    [categorias]
  );

  const resumo = useMemo(() => {
    const ativos = cartoesComMetricas.filter((item) => item.is_active).length;
    const limiteTotal = cartoesComMetricas.reduce((soma, item) => soma + item.limite, 0);
    const usadoTotal = cartoesComMetricas.reduce((soma, item) => soma + item.usado, 0);
    const disponivelTotal = Math.max(0, limiteTotal - usadoTotal);
    const mediaLimite = cartoesComMetricas.length > 0 ? limiteTotal / cartoesComMetricas.length : 0;
    return { ativos, limiteTotal, usadoTotal, disponivelTotal, mediaLimite };
  }, [cartoesComMetricas]);

  function iniciarCriacao() {
    setEditandoId(null);
    setForm({
      name: "",
      brand: "",
      limit_amount: "",
      closing_day: "25",
      due_day: "5",
      is_active: true,
    });
    setErro("");
  }

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setMostrarFormulario(true);
    setForm({
      name: item.name || "",
      brand: item.brand || "",
      limit_amount: String(item.limit_amount ?? ""),
      closing_day: String(item.closing_day ?? "25"),
      due_day: String(item.due_day ?? "5"),
      is_active: Boolean(item.is_active),
    });
    setErro("");
  }

  async function salvarCartao(evento) {
    evento.preventDefault();
    if (!form.name.trim()) {
      setErro("Informe o nome do cartão.");
      return;
    }
    const fechamento = Number(form.closing_day);
    const vencimento = Number(form.due_day);
    if (fechamento < 1 || fechamento > 31 || vencimento < 1 || vencimento > 31) {
      setErro("Fechamento e vencimento devem estar entre 1 e 31.");
      return;
    }

    setSalvando(true);
    setErro("");
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      limit_amount: Number(form.limit_amount || 0),
      closing_day: fechamento,
      due_day: vencimento,
      is_active: form.is_active,
    };
    try {
      if (editandoId) {
        const atualizado = await atualizarCartao(editandoId, payload);
        setCartoes((atual) => atual.map((item) => (item.id === editandoId ? atualizado : item)));
      } else {
        const criado = await criarCartao(payload);
        setCartoes((atual) => [criado, ...atual]);
      }
      iniciarCriacao();
      setMostrarFormulario(false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerCartao(item) {
    const confirmou = await confirmar({
      titulo: "Excluir cartão",
      mensagem: `Remover o cartão "${item.name}"?`,
      textoConfirmar: "Excluir",
    });
    if (!confirmou) return;
    setErro("");
    try {
      await excluirCartao(item.id);
      setCartoes((atual) => atual.filter((cartao) => cartao.id !== item.id));
      if (editandoId === item.id) {
        iniciarCriacao();
        setMostrarFormulario(false);
      }
    } catch (e) {
      setErro(e.message);
    }
  }

  async function salvarParcelamento(evento) {
    evento.preventDefault();
    if (!formParcelamento.credit_card || !formParcelamento.category || !formParcelamento.description.trim()) {
      setErro("Preencha cartão, categoria e descrição do parcelamento.");
      return;
    }
    if (Number(formParcelamento.total_amount) <= 0 || Number(formParcelamento.installments_count) < 1) {
      setErro("Informe valor total e quantidade de parcelas válidos.");
      return;
    }
    setSalvandoParcelamento(true);
    setErro("");
    try {
      const payload = {
        credit_card: Number(formParcelamento.credit_card),
        category: Number(formParcelamento.category),
        description: formParcelamento.description.trim(),
        total_amount: formParcelamento.total_amount,
        installments_count: Number(formParcelamento.installments_count),
        purchase_date: formParcelamento.purchase_date,
      };
      if (editandoParcelamentoId) {
        await atualizarParcelamentoCartao(editandoParcelamentoId, payload);
      } else {
        await criarParcelamentoCartao(payload);
      }
      const parcelamentosAtualizados = await buscarParcelamentosCartao();
      setParcelamentos(parcelamentosAtualizados);
      const transacoesAtualizadas = await buscarTransacoes();
      setTransacoes(transacoesAtualizadas);
      setFormParcelamento({
        credit_card: "",
        category: "",
        description: "",
        total_amount: "",
        installments_count: "2",
        purchase_date: dataIso(new Date()),
      });
      setEditandoParcelamentoId(null);
      setMostrarParcelamento(false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvandoParcelamento(false);
    }
  }

  async function removerParcelamento(item) {
    const confirmou = await confirmar({
      titulo: "Excluir parcelamento",
      mensagem: `Remover parcelamento "${item.description}"?`,
      textoConfirmar: "Excluir",
    });
    if (!confirmou) return;
    setErro("");
    try {
      await excluirParcelamentoCartao(item.id);
      setParcelamentos((atual) => atual.filter((p) => p.id !== item.id));
      const transacoesAtualizadas = await buscarTransacoes();
      setTransacoes(transacoesAtualizadas);
    } catch (e) {
      setErro(e.message);
    }
  }

  function iniciarEdicaoParcelamento(item) {
    setEditandoParcelamentoId(item.id);
    setFormParcelamento({
      credit_card: String(item.credit_card || ""),
      category: String(item.category || ""),
      description: item.description || "",
      total_amount: String(item.total_amount || ""),
      installments_count: String(item.installments_count || "1"),
      purchase_date: item.purchase_date || dataIso(new Date()),
    });
    setMostrarParcelamento(true);
    setErro("");
  }

  return (
    <main className="mx-auto max-w-7xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Módulo</p>
        <h1 className="mt-2 text-2xl font-black text-ink">Cartões de crédito</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre seus cartões com limite, dia de fechamento e dia de vencimento para preparar faturas e alertas.
        </p>

        <CartoesResumo resumo={resumo} />

        {erro ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">Parcelamentos no cartão</h2>
              <p className="mt-1 text-xs text-slate-500">
                Cada parcela gera automaticamente uma despesa futura no cartão correspondente.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setMostrarParcelamento((v) => {
                  const proximo = !v;
                  if (!proximo) {
                    setEditandoParcelamentoId(null);
                  }
                  return proximo;
                })
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {mostrarParcelamento ? "Fechar parcelamento" : "Nova compra parcelada"}
            </button>
          </div>

          {mostrarParcelamento ? (
            <form className="mt-4 grid gap-2 md:grid-cols-3" onSubmit={salvarParcelamento}>
              <select
                value={formParcelamento.credit_card}
                onChange={(e) => setFormParcelamento((atual) => ({ ...atual, credit_card: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione o cartão</option>
                {cartoes.filter((item) => item.is_active).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                value={formParcelamento.category}
                onChange={(e) => setFormParcelamento((atual) => ({ ...atual, category: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione a categoria</option>
                {categoriasDespesa.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <input
                value={formParcelamento.description}
                onChange={(e) => setFormParcelamento((atual) => ({ ...atual, description: e.target.value }))}
                placeholder="Descricao da compra"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formParcelamento.total_amount}
                onChange={(e) => setFormParcelamento((atual) => ({ ...atual, total_amount: e.target.value }))}
                placeholder="Valor total"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="1"
                max="48"
                value={formParcelamento.installments_count}
                onChange={(e) => setFormParcelamento((atual) => ({ ...atual, installments_count: e.target.value }))}
                placeholder="Parcelas"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={formParcelamento.purchase_date}
                onChange={(e) => setFormParcelamento((atual) => ({ ...atual, purchase_date: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={salvandoParcelamento}
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {salvandoParcelamento
                    ? "Salvando..."
                    : editandoParcelamentoId
                      ? "Salvar alterações do parcelamento"
                      : "Salvar parcelamento"}
                </button>
              </div>
            </form>
          ) : null}

          <ul className="mt-4 space-y-2">
            {parcelamentos.slice(0, 6).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.description}</p>
                  <p className="text-xs text-slate-500">
                    {item.installments_count}x | Total R$ {Number(item.total_amount || 0).toFixed(2)} | Compra em{" "}
                    {item.purchase_date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => iniciarEdicaoParcelamento(item)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => removerParcelamento(item)}
                  className="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (mostrarFormulario) {
                setMostrarFormulario(false);
                iniciarCriacao();
              } else {
                iniciarCriacao();
                setMostrarFormulario(true);
              }
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {mostrarFormulario ? "Fechar painel" : "Novo cartão"}
          </button>
        </div>

        <div className={`mt-4 ${mostrarFormulario ? "grid gap-4 lg:grid-cols-3" : ""}`}>
          {mostrarFormulario ? (
            <CartoesFormulario
              editandoId={editandoId}
              form={form}
              setForm={setForm}
              salvando={salvando}
              onSubmit={salvarCartao}
              onCancel={() => {
                iniciarCriacao();
                setMostrarFormulario(false);
              }}
            />
          ) : null}
          <CartoesLista
            carregando={carregando}
            cartoesFiltrados={cartoesComMetricas}
            busca={busca}
            setBusca={setBusca}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            onEdit={iniciarEdicao}
            onDelete={removerCartao}
          />
        </div>
      </section>
      {dialogo}
    </main>
  );
}
