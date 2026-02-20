import { useEffect, useMemo, useState } from "react";
import RecorrenciasFormulario from "../components/recorrencias/RecorrenciasFormulario";
import RecorrenciasLista from "../components/recorrencias/RecorrenciasLista";
import RecorrenciasResumo from "../components/recorrencias/RecorrenciasResumo";
import useConfirmDialog from "../hooks/useConfirmDialog";
import { buscarCartoes, buscarCategorias, buscarContas } from "../lib/api";

const STORAGE_KEY = "vimo_recorrencias";

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

function paraMensal(item) {
  const valor = Number(item.amount || 0);
  if (item.frequency === "weekly") return valor * 4.33;
  if (item.frequency === "yearly") return valor / 12;
  return valor;
}

export default function RecorrenciasPage() {
  const [contas, setContas] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [recorrencias, setRecorrencias] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [editandoId, setEditandoId] = useState(null);
  const { confirmar, dialogo } = useConfirmDialog();

  const [form, setForm] = useState({
    description: "",
    transaction_type: "expense",
    source: "account",
    account: "",
    credit_card: "",
    category: "",
    amount: "",
    frequency: "monthly",
    start_date: hojeIso(),
    end_date: "",
    active: true,
  });

  useEffect(() => {
    async function carregarBase() {
      try {
        const [contasApi, cartoesApi, categoriasApi] = await Promise.all([
          buscarContas(),
          buscarCartoes(),
          buscarCategorias(),
        ]);
        setContas(contasApi);
        setCartoes(cartoesApi.filter((item) => item.is_active));
        setCategorias(categoriasApi);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarBase();
  }, []);

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return;
    try {
      const dados = JSON.parse(salvo);
      if (Array.isArray(dados)) setRecorrencias(dados);
    } catch {
      // ignora dados invalidos do localStorage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recorrencias));
  }, [recorrencias]);

  const nomeContaPorId = useMemo(
    () => Object.fromEntries(contas.map((item) => [item.id, item.name])),
    [contas]
  );
  const nomeCartaoPorId = useMemo(
    () => Object.fromEntries(cartoes.map((item) => [item.id, item.name])),
    [cartoes]
  );
  const nomeCategoriaPorId = useMemo(
    () => Object.fromEntries(categorias.map((item) => [item.id, item.name])),
    [categorias]
  );

  const categoriasDoTipo = useMemo(
    () => categorias.filter((item) => item.transaction_type === form.transaction_type),
    [categorias, form.transaction_type]
  );

  const recorrenciasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return recorrencias.filter((item) => {
      const nomeOk = !termo || item.description.toLowerCase().includes(termo);
      const statusOk = filtroStatus === "all" || (filtroStatus === "active" ? item.active : !item.active);
      return nomeOk && statusOk;
    });
  }, [recorrencias, busca, filtroStatus]);

  const resumo = useMemo(() => {
    const ativas = recorrencias.filter((item) => item.active);
    const receitasAtivas = ativas
      .filter((item) => item.transaction_type === "income")
      .reduce((total, item) => total + paraMensal(item), 0);
    const despesasAtivas = ativas
      .filter((item) => item.transaction_type === "expense")
      .reduce((total, item) => total + paraMensal(item), 0);
    return {
      total: recorrencias.length,
      ativas: ativas.length,
      receitasAtivas,
      despesasAtivas,
    };
  }, [recorrencias]);

  function limparFormulario() {
    setEditandoId(null);
    setForm({
      description: "",
      transaction_type: "expense",
      source: "account",
      account: contas[0]?.id ? String(contas[0].id) : "",
      credit_card: cartoes[0]?.id ? String(cartoes[0].id) : "",
      category: "",
      amount: "",
      frequency: "monthly",
      start_date: hojeIso(),
      end_date: "",
      active: true,
    });
  }

  function editarRecorrencia(item) {
    setEditandoId(item.id);
    setForm({
      description: item.description || "",
      transaction_type: item.transaction_type || "expense",
      source: item.source || "account",
      account: item.account ? String(item.account) : "",
      credit_card: item.credit_card ? String(item.credit_card) : "",
      category: item.category ? String(item.category) : "",
      amount: String(item.amount || ""),
      frequency: item.frequency || "monthly",
      start_date: item.start_date || hojeIso(),
      end_date: item.end_date || "",
      active: Boolean(item.active),
    });
  }

  function salvarRecorrencia(evento) {
    evento.preventDefault();
    if (!form.description.trim()) {
      setErro("Informe a descricao da recorrencia.");
      return;
    }
    if (!form.category || !form.amount || Number(form.amount) <= 0) {
      setErro("Informe categoria e valor valido.");
      return;
    }
    if (form.transaction_type === "income" && !form.account) {
      setErro("Receita recorrente deve estar vinculada a uma conta.");
      return;
    }
    if (form.transaction_type === "expense" && form.source === "account" && !form.account) {
      setErro("Despesa recorrente por conta precisa de conta.");
      return;
    }
    if (form.transaction_type === "expense" && form.source === "credit_card" && !form.credit_card) {
      setErro("Despesa recorrente por cartao precisa de cartao.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      const payload = {
        id: editandoId || Date.now(),
        description: form.description.trim(),
        transaction_type: form.transaction_type,
        source: form.transaction_type === "income" ? "account" : form.source,
        account: form.account ? Number(form.account) : null,
        credit_card:
          form.transaction_type === "expense" && form.source === "credit_card" && form.credit_card
            ? Number(form.credit_card)
            : null,
        category: Number(form.category),
        amount: Number(form.amount),
        frequency: form.frequency,
        start_date: form.start_date,
        end_date: form.end_date || null,
        active: form.active,
      };

      if (editandoId) {
        setRecorrencias((atual) => atual.map((item) => (item.id === editandoId ? payload : item)));
      } else {
        setRecorrencias((atual) => [payload, ...atual]);
      }
      limparFormulario();
    } finally {
      setSalvando(false);
    }
  }

  async function excluirRecorrencia(item) {
    const confirmou = await confirmar({
      titulo: "Excluir recorrencia",
      mensagem: `Remover a recorrencia "${item.description}"?`,
      textoConfirmar: "Excluir",
    });
    if (!confirmou) return;
    setRecorrencias((atual) => atual.filter((r) => r.id !== item.id));
    if (editandoId === item.id) limparFormulario();
  }

  function alternarStatus(item) {
    setRecorrencias((atual) => atual.map((r) => (r.id === item.id ? { ...r, active: !r.active } : r)));
  }

  return (
    <main className="mx-auto max-w-7xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Modulo</p>
        <h1 className="mt-2 text-2xl font-black text-ink">Recorrencias</h1>
        <p className="mt-2 text-sm text-slate-600">
          Defina regras recorrentes para despesas e receitas fixas. Esta tela salva as regras localmente por enquanto.
        </p>

        <RecorrenciasResumo resumo={resumo} />
        {erro ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        {carregando ? (
          <div className="mt-6 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <RecorrenciasFormulario
              editandoId={editandoId}
              form={form}
              setForm={setForm}
              contas={contas}
              cartoes={cartoes}
              categoriasDoTipo={categoriasDoTipo}
              salvando={salvando}
              onSubmit={salvarRecorrencia}
              onCancel={limparFormulario}
            />
            <RecorrenciasLista
              recorrenciasFiltradas={recorrenciasFiltradas}
              busca={busca}
              setBusca={setBusca}
              filtroStatus={filtroStatus}
              setFiltroStatus={setFiltroStatus}
              nomeContaPorId={nomeContaPorId}
              nomeCartaoPorId={nomeCartaoPorId}
              nomeCategoriaPorId={nomeCategoriaPorId}
              onEdit={editarRecorrencia}
              onToggleAtivo={alternarStatus}
              onDelete={excluirRecorrencia}
            />
          </div>
        )}
      </section>
      {dialogo}
    </main>
  );
}
