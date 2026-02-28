const TIPO_LABEL = {
  income: "Receita",
  expense: "Despesa",
};

export default function CategoriasLista({
  carregando,
  categoriasFiltradas,
  busca,
  setBusca,
  filtroTipo,
  setFiltroTipo,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Lista de categorias</h2>
          <p className="mt-1 text-xs text-slate-500">Filtre por tipo ou pesquise por nome.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar categoria"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="all">Todos os tipos</option>
            <option value="expense">Somente despesas</option>
            <option value="income">Somente receitas</option>
          </select>
        </div>
      </div>

      {carregando ? (
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Nenhuma categoria encontrada para esse filtro.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {categoriasFiltradas.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-xs text-slate-500">{TIPO_LABEL[item.transaction_type] || item.transaction_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    item.transaction_type === "income" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {TIPO_LABEL[item.transaction_type] || item.transaction_type}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
