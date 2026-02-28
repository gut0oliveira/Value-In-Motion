const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function percentual(retorno, base) {
  if (!base) return "0.00%";
  return `${((retorno / base) * 100).toFixed(2)}%`;
}

export default function InvestimentosResumo({ resumo }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <article className="rounded-xl bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Ativos</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.ativos}</p>
      </article>
      <article className="rounded-xl bg-sky-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-sky-700">Total investido</p>
        <p className="mt-1 text-xl font-black text-sky-700">{moeda.format(resumo.totalInvestido)}</p>
      </article>
      <article className="rounded-xl bg-emerald-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">Valor atual</p>
        <p className="mt-1 text-xl font-black text-emerald-700">{moeda.format(resumo.totalAtual)}</p>
      </article>
      <article className={`rounded-xl p-4 ${resumo.retorno >= 0 ? "bg-amber-50" : "bg-rose-50"}`}>
        <p className={`text-[11px] uppercase tracking-[0.12em] ${resumo.retorno >= 0 ? "text-amber-700" : "text-rose-700"}`}>
          Retorno total
        </p>
        <p className={`mt-1 text-xl font-black ${resumo.retorno >= 0 ? "text-amber-700" : "text-rose-700"}`}>
          {moeda.format(resumo.retorno)} ({percentual(resumo.retorno, resumo.totalInvestido)})
        </p>
      </article>
    </div>
  );
}
