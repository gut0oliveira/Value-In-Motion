export default function DashboardTabelaStatus({
  atividadeRecente,
  buscaDescricao,
  setBuscaDescricao,
  nomeCategoriaPorId,
  formatoMoeda,
  visaoApi,
}) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-bold text-ink">Transações recentes</h2>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-72"
            placeholder="Buscar por descricao..."
            value={buscaDescricao}
            onChange={(e) => setBuscaDescricao(e.target.value)}
          />
        </div>

        {atividadeRecente.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Sem movimentações no período.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-2 py-2">Data</th>
                  <th className="px-2 py-2">Descrição</th>
                  <th className="px-2 py-2">Categoria</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {atividadeRecente.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-slate-600">{item.occurred_on}</td>
                    <td className="px-2 py-2 font-medium text-slate-800">{item.description || "Sem descricao"}</td>
                    <td className="px-2 py-2 text-slate-600">
                      {nomeCategoriaPorId[item.category] || `Categoria #${item.category}`}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.transaction_type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.transaction_type === "income" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td
                      className={`px-2 py-2 text-right font-semibold ${
                        item.transaction_type === "income" ? "text-green-700" : "text-rose-700"
                      }`}
                    >
                      {item.transaction_type === "income" ? "+" : "-"}
                      {formatoMoeda.format(Number(item.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-ink">Status técnico</h2>
        <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          {JSON.stringify(visaoApi, null, 2)}
        </pre>
      </article>
    </section>
  );
}
