export default function ContasResumo({ resumo }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <article className="rounded-xl bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Total de contas</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.total}</p>
      </article>
      <article className="rounded-xl bg-sky-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-sky-700">Conta corrente</p>
        <p className="mt-1 text-xl font-black text-sky-700">{resumo.checking}</p>
      </article>
      <article className="rounded-xl bg-emerald-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">Outros tipos</p>
        <p className="mt-1 text-xl font-black text-emerald-700">{resumo.others}</p>
      </article>
    </div>
  );
}
