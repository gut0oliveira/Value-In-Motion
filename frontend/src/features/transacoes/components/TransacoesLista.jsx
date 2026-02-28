const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const TIPO_LABEL = {
  income: "Receita",
  expense: "Despesa",
};

export default function TransacoesLista({
  carregando,
  transacoesFiltradas,
  busca,
  setBusca,
  filtroTipo,
  setFiltroTipo,
  filtroConta,
  setFiltroConta,
  filtroCategoria,
  setFiltroCategoria,
  contas,
  categorias,
  nomeContaPorId,
  nomeCartaoPorId,
  nomeCategoriaPorId,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Historico de transacoes</h2>
          <p className="mt-1 text-xs text-slate-500">Filtre por conta, categoria, tipo e descricao.</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar descricao"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
        >
          <option value="all">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select
          value={filtroConta}
          onChange={(e) => setFiltroConta(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
        >
          <option value="all">Todas as contas</option>
          {contas.map((conta) => (
            <option key={conta.id} value={String(conta.id)}>
              {conta.name}
            </option>
          ))}
        </select>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
        >
          <option value="all">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={String(categoria.id)}>
              {categoria.name}
            </option>
          ))}
        </select>
      </div>

      {carregando ? (
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : transacoesFiltradas.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Nenhuma transacao encontrada para esse filtro.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {transacoesFiltradas.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{item.description || "Sem descricao"}</p>
                <p className="text-xs text-slate-500">
                  {item.occurred_on} |{" "}
                  {item.credit_card
                    ? nomeCartaoPorId[item.credit_card] || `Cartao #${item.credit_card}`
                    : nomeContaPorId[item.account] || `Conta #${item.account}`}{" "}
                  |{" "}
                  {nomeCategoriaPorId[item.category] || `Categoria #${item.category}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    item.transaction_type === "income" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {TIPO_LABEL[item.transaction_type] || item.transaction_type}
                </span>
                <span
                  className={`text-sm font-bold ${
                    item.transaction_type === "income" ? "text-green-700" : "text-rose-700"
                  }`}
                >
                  {item.transaction_type === "income" ? "+" : "-"}
                  {formatoMoeda.format(Number(item.amount || 0))}
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
