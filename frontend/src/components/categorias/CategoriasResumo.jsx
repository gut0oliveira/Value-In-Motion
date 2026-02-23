export default function CategoriasResumo({ resumo }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <article className="rounded-xl bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Total</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.total}</p>
      </article>

      <article className="rounded-xl bg-green-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-green-700">Receitas</p>
        <p className="mt-1 text-xl font-black text-green-700">{resumo.receitas}</p>
      </article>
      
      <article className="rounded-xl bg-rose-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-rose-700">Despesas</p>
        <p className="mt-1 text-xl font-black text-rose-700">{resumo.despesas}</p>
      </article>
    </div>
  );
}
