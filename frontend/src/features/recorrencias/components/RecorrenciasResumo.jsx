const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function RecorrenciasResumo({ resumo }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <article className="rounded-xl bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Total</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.total}</p>
      </article>
      <article className="rounded-xl bg-emerald-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">Ativas</p>
        <p className="mt-1 text-xl font-black text-emerald-700">{resumo.ativas}</p>
      </article>
      <article className="rounded-xl bg-sky-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-sky-700">Receitas ativas</p>
        <p className="mt-1 text-xl font-black text-sky-700">{formatoMoeda.format(resumo.receitasAtivas)}</p>
      </article>
      <article className="rounded-xl bg-rose-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-rose-700">Despesas ativas</p>
        <p className="mt-1 text-xl font-black text-rose-700">{formatoMoeda.format(resumo.despesasAtivas)}</p>
      </article>
    </div>
  );
}
