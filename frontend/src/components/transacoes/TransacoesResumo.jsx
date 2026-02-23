const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function TransacoesResumo({ resumo }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <article className="rounded-xl bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Lançamentos</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.quantidade}</p>
      </article>
      <article className="rounded-xl bg-green-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-green-700">Receitas</p>
        <p className="mt-1 text-xl font-black text-green-700">{formatoMoeda.format(resumo.receitas)}</p>
      </article>
      <article className="rounded-xl bg-rose-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-rose-700">Despesas</p>
        <p className="mt-1 text-xl font-black text-rose-700">{formatoMoeda.format(resumo.despesas)}</p>
      </article>
      <article className="rounded-xl bg-sky-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-sky-700">Saldo</p>
        <p className="mt-1 text-xl font-black text-sky-700">{formatoMoeda.format(resumo.saldo)}</p>
      </article>
    </div>
  );
}
