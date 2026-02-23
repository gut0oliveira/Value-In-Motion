const TIPO_LABEL = {
  income: "Receita",
  expense: "Despesa",
};

const FREQ_LABEL = {
  monthly: "Mensal",
  weekly: "Semanal",
  yearly: "Anual",
};

export default function RecorrenciasLista({
  recorrenciasFiltradas,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  nomeContaPorId,
  nomeCartaoPorId,
  nomeCategoriaPorId,
  onEdit,
  onToggleAtivo,
  onDelete,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Recorrências cadastradas</h2>
          <p className="mt-1 text-xs text-slate-500">Regras automáticas para receitas e despesas recorrentes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar recorrência"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {recorrenciasFiltradas.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Nenhuma recorrência encontrada para esse filtro.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {recorrenciasFiltradas.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{item.description}</p>
                <p className="text-xs text-slate-500">
                  {TIPO_LABEL[item.transaction_type]} | {FREQ_LABEL[item.frequency]} |{" "}
                  {item.source === "credit_card"
                    ? nomeCartaoPorId[item.credit_card] || `Cartao #${item.credit_card}`
                    : nomeContaPorId[item.account] || `Conta #${item.account}`}{" "}
                  | {nomeCategoriaPorId[item.category] || `Categoria #${item.category}`}
                </p>
                <p className="text-xs text-slate-500">
                  Início {item.start_date}
                  {item.end_date ? ` | Fim ${item.end_date}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.active ? "Ativa" : "Inativa"}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleAtivo(item)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  {item.active ? "Pausar" : "Ativar"}
                </button>
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
