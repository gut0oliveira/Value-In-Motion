import { useEffect, useMemo, useState } from "react";
import CartoesFormulario from "../components/cartoes/CartoesFormulario";
import CartoesLista from "../components/cartoes/CartoesLista";
import CartoesResumo from "../components/cartoes/CartoesResumo";
import { atualizarCartao, buscarCartoes, criarCartao, excluirCartao } from "../lib/api";

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    limit_amount: "",
    closing_day: "25",
    due_day: "5",
    is_active: true,
  });

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarCartoes();
        setCartoes(dados);
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

  const resumo = useMemo(() => {
    const ativos = cartoes.filter((item) => item.is_active).length;
    const limiteTotal = cartoes.reduce((soma, item) => soma + Number(item.limit_amount || 0), 0);
    const mediaLimite = cartoes.length > 0 ? limiteTotal / cartoes.length : 0;
    return { ativos, limiteTotal, mediaLimite };
  }, [cartoes]);

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
      setErro("Informe o nome do cartao.");
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
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerCartao(item) {
    const confirmar = window.confirm(`Remover o cartao "${item.name}"?`);
    if (!confirmar) return;
    setErro("");
    try {
      await excluirCartao(item.id);
      setCartoes((atual) => atual.filter((cartao) => cartao.id !== item.id));
      if (editandoId === item.id) iniciarCriacao();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <main className="mx-auto max-w-7xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Modulo</p>
        <h1 className="mt-2 text-2xl font-black text-ink">Cartoes de credito</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre seus cartoes com limite, dia de fechamento e dia de vencimento para preparar faturas e alertas.
        </p>

        <CartoesResumo resumo={resumo} />

        {erro ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <CartoesFormulario
            editandoId={editandoId}
            form={form}
            setForm={setForm}
            salvando={salvando}
            onSubmit={salvarCartao}
            onCancel={iniciarCriacao}
          />
          <CartoesLista
            carregando={carregando}
            cartoesFiltrados={cartoesFiltrados}
            busca={busca}
            setBusca={setBusca}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            onEdit={iniciarEdicao}
            onDelete={removerCartao}
          />
        </div>
      </section>
    </main>
  );
}
