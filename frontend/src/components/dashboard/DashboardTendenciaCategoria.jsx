export default function DashboardTendenciaCategoria({ gastosCategoria, formatoMoeda }) {
  const totalGastos = gastosCategoria.reduce((soma, item) => soma + Number(item.valor || 0), 0);
  const maiorValor = Math.max(...gastosCategoria.map((item) => Number(item.valor || 0)), 1);
  const principal = gastosCategoria[0];

  return (
    <section className="mt-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Gastos por categoria</h2>
            <p className="mt-1 text-xs text-slate-500">Comparativo das categorias com maior impacto no periodo.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-700" />
              Valor da categoria
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              Escala relativa
            </span>
          </div>
        </div>

        {gastosCategoria.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Nenhuma despesa para exibir.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Total</p>
                <p className="mt-1 text-base font-bold text-ink">{formatoMoeda.format(totalGastos)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Categorias</p>
                <p className="mt-1 text-base font-bold text-ink">{gastosCategoria.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Maior gasto</p>
                <p className="mt-1 truncate text-base font-bold text-ink" title={principal?.nome || "-"}>
                  {principal?.nome || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>0%</span>
              <span>Escala da maior categoria</span>
              <span>100%</span>
            </div>

            <ul className="mt-2 space-y-3">
              {gastosCategoria.map((item) => {
                const largura = Math.max(4, Math.round((Number(item.valor || 0) / maiorValor) * 100));
                return (
                  <li key={item.nome} className="rounded-xl border border-slate-100 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-semibold text-slate-700" title={item.nome}>
                        {item.nome}
                      </span>
                      <span className="whitespace-nowrap text-slate-600">
                        {formatoMoeda.format(item.valor)} ({item.percentual.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-slate-700 transition-all duration-300"
                        style={{ width: `${largura}%` }}
                        title={`${item.nome}: ${item.percentual.toFixed(1)}% do total`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </article>
    </section>
  );
}
