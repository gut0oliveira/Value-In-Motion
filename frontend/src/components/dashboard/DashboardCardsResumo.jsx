export default function DashboardCardsResumo({ insights, resumoHoje, previsao30Dias, formatoMoeda }) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-ink">Insights</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {insights.map((item) => (
            <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-ink">Projecao 30 dias</h2>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-center justify-between">
            <span>Entradas previstas</span>
            <span className="font-semibold text-green-700">{formatoMoeda.format(previsao30Dias.entradas)}</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Saidas previstas</span>
            <span className="font-semibold text-rose-700">{formatoMoeda.format(previsao30Dias.saidas)}</span>
          </p>
          <p className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Saldo projetado</span>
            <span className="font-semibold text-ink">{formatoMoeda.format(previsao30Dias.saldo)}</span>
          </p>
        </div>
      </article>
    </section>
  );
}
