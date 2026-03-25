function KpiCard({ titulo, valor, detalhe = "", destaque = "text-ink", className = "" }) {
  return (
    <article className={`h-full min-h-[118px] rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{titulo}</p>
      <p className={`mt-1 text-xl font-black ${destaque}`}>{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-slate-500">{detalhe}</p> : null}
    </article>
  );
}

export default function DashboardResumoKpis({ totais, saldoContas, formatoMoeda }) {
  return (
    <section className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Resumo</p>
      </div>
      <div className="grid gap-3 grid-cols-6">
        <KpiCard
          className="col-span-6"
          titulo="Saldo em conta atual"
          valor={formatoMoeda.format(saldoContas)}
          destaque="text-ink"
        />
        <KpiCard
          className="col-span-2"
          titulo="Receitas"
          valor={formatoMoeda.format(totais.receitas)}
          destaque="text-green-700"
        />
        <KpiCard
          className="col-span-2"
          titulo="Despesas"
          valor={formatoMoeda.format(totais.despesas)}
          destaque="text-rose-700"
        />
        <KpiCard
          className="col-span-2"
          titulo="Taxa poupança (30 dias)"
          valor={totais.taxaPoupanca === null ? "-" : `${totais.taxaPoupanca.toFixed(1)}%`}
          destaque="text-sky-700"
        />
      </div>
    </section>
  );
}


