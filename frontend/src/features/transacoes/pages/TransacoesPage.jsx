import { useEffect, useMemo, useState } from "react";
import TransacoesFormulario from "../components/TransacoesFormulario";
import TransacoesLista from "../components/TransacoesLista";
import TransacoesResumo from "../components/TransacoesResumo";
import useConfirmDialog from "../../../hooks/useConfirmDialog";
import {
  atualizarTransacao,
  buscarCartoes,
  buscarCategorias,
  buscarContas,
  buscarTransacoes,
  excluirTransacao,
} from "../../../lib/api";

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransacoesPage() {
  const [contas, setContas] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [filtroConta, setFiltroConta] = useState("all");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarPainelEdicao, setMostrarPainelEdicao] = useState(false);
  const { confirmar, dialogo } = useConfirmDialog();
  const [form, setForm] = useState({
    transaction_type: "expense",
    source: "account",
    account: "",
    credit_card: "",
    category: "",
    description: "",
    amount: "",
    occurred_on: hojeIso(),
  });

  useEffect(() => {
    async function carregar() {
      try {
        const [contasApi, cartoesApi, categoriasApi, transacoesApi] = await Promise.all([
          buscarContas(),
          buscarCartoes(),
          buscarCategorias(),
          buscarTransacoes(),
        ]);
        setContas(contasApi);
        setCartoes(cartoesApi);
        setCategorias(categoriasApi);
        setTransacoes(transacoesApi);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

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

  const transacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return transacoes.filter((item) => {
      const tipoOk = filtroTipo === "all" || item.transaction_type === filtroTipo;
      const contaOk = filtroConta === "all" || String(item.account) === String(filtroConta);
      const categoriaOk = filtroCategoria === "all" || String(item.category) === String(filtroCategoria);
      const descricaoOk = !termo || (item.description || "").toLowerCase().includes(termo);
      return tipoOk && contaOk && categoriaOk && descricaoOk;
    });
  }, [transacoes, busca, filtroTipo, filtroConta, filtroCategoria]);

  const resumo = useMemo(() => {
    const receitas = transacoesFiltradas
      .filter((item) => item.transaction_type === "income")
      .reduce((total, item) => total + Number(item.amount), 0);
    const despesas = transacoesFiltradas
      .filter((item) => item.transaction_type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0);
    return {
      quantidade: transacoesFiltradas.length,
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  }, [transacoesFiltradas]);

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setMostrarPainelEdicao(true);
    setForm({
      transaction_type: item.transaction_type,
      source: item.credit_card ? "credit_card" : "account",
      account: item.account ? String(item.account) : "",
      credit_card: item.credit_card ? String(item.credit_card) : "",
      category: String(item.category),
      description: item.description || "",
      amount: String(item.amount),
      occurred_on: item.occurred_on,
    });
    setErro("");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setMostrarPainelEdicao(false);
    setForm({
      transaction_type: "expense",
      source: "account",
      account: "",
      credit_card: "",
      category: "",
      description: "",
      amount: "",
      occurred_on: hojeIso(),
    });
  }

  async function salvarEdicao(evento) {
    evento.preventDefault();
    if (!editandoId) return;
    if (!form.category || !form.amount || !form.occurred_on) {
      setErro("Preencha categoria, valor e data.");
      return;
    }
    if (form.transaction_type === "income" && !form.account) {
      setErro("Selecione uma conta para receita.");
      return;
    }
    if (form.transaction_type === "expense" && form.source === "credit_card" && !form.credit_card) {
      setErro("Selecione um cartão para despesa.");
      return;
    }
    if (form.transaction_type === "expense" && form.source !== "credit_card" && !form.account) {
      setErro("Selecione uma conta para despesa.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setErro("Valor deve ser maior que zero.");
      return;
    }

    const payload = {
      transaction_type: form.transaction_type,
      category: Number(form.category),
      description: form.description,
      amount: form.amount,
      occurred_on: form.occurred_on,
    };
    if (form.transaction_type === "income") {
      payload.account = Number(form.account);
      payload.credit_card = null;
    } else if (form.source === "credit_card") {
      payload.account = null;
      payload.credit_card = Number(form.credit_card);
    } else {
      payload.account = Number(form.account);
      payload.credit_card = null;
    }

    setSalvando(true);
    setErro("");
    try {
      const atualizada = await atualizarTransacao(editandoId, payload);
      setTransacoes((atual) => atual.map((item) => (item.id === editandoId ? atualizada : item)));
      cancelarEdicao();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerTransacao(item) {
    const confirmou = await confirmar({
      titulo: "Excluir transação",
      mensagem: "Remover esta transação?",
      textoConfirmar: "Excluir",
    });
    if (!confirmou) return;
    setErro("");
    try {
      await excluirTransacao(item.id);
      setTransacoes((atual) => atual.filter((transacao) => transacao.id !== item.id));
      if (editandoId === item.id) cancelarEdicao();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <main className="mx-auto max-w-7xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Modulo</p>
        <h1 className="mt-2 text-2xl font-black text-ink">Transações</h1>
        <p className="mt-2 text-sm text-slate-600">
          Consulte e filtre suas movimentações em um único lugar, com separacao por conta, categoria e tipo.
        </p>
        <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
          Novas transações devem ser lançadas no Dashboard pelos botoes "Nova receita" e "Nova despesa".
        </p>

        <TransacoesResumo resumo={resumo} />

        {erro ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (mostrarPainelEdicao) {
                cancelarEdicao();
              } else {
                setMostrarPainelEdicao(true);
              }
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {mostrarPainelEdicao ? "Fechar painel de edição" : "Abrir painel de edição"}
          </button>
        </div>

        <div className={`mt-4 ${mostrarPainelEdicao ? "grid gap-4 lg:grid-cols-3" : ""}`}>
          {mostrarPainelEdicao && editandoId ? (
            <TransacoesFormulario
              editandoId={editandoId}
              form={form}
              setForm={setForm}
              contas={contas}
              cartoes={cartoes.filter((item) => item.is_active)}
              categoriasDoTipo={categoriasDoTipo}
              salvando={salvando}
              onSubmit={salvarEdicao}
              onCancel={cancelarEdicao}
            />
          ) : mostrarPainelEdicao ? (
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
              <h2 className="text-base font-bold text-ink">Edição de transação</h2>
              <p className="mt-2 text-sm text-slate-600">
                Clique em "Editar" em uma transação da lista para carregar os dados neste painel.
              </p>
            </article>
          ) : (
            null
          )}
          <TransacoesLista
            carregando={carregando}
            transacoesFiltradas={transacoesFiltradas}
            busca={busca}
            setBusca={setBusca}
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            filtroConta={filtroConta}
            setFiltroConta={setFiltroConta}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            contas={contas}
            categorias={categorias}
            nomeContaPorId={nomeContaPorId}
            nomeCartaoPorId={nomeCartaoPorId}
            nomeCategoriaPorId={nomeCategoriaPorId}
            onEdit={iniciarEdicao}
            onDelete={removerTransacao}
          />
        </div>
      </section>
      {dialogo}
    </main>
  );
}
