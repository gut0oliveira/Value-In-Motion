export default function TransacoesFormulario({
  editandoId,
  form,
  setForm,
  contas,
  cartoes,
  categoriasDoTipo,
  salvando,
  onSubmit,
  onCancel,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
      <h2 className="text-base font-bold text-ink">{editandoId ? `Editar transacao #${editandoId}` : "Nova transacao"}</h2>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Tipo</span>
          <select
            value={form.transaction_type}
            onChange={(e) =>
              setForm((atual) => ({
                ...atual,
                transaction_type: e.target.value,
                category: "",
                source: e.target.value === "income" ? "account" : atual.source || "account",
              }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>

        {form.transaction_type === "expense" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Origem da despesa</span>
            <select
              value={form.source || "account"}
              onChange={(e) => setForm((atual) => ({ ...atual, source: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="account">Saldo da conta</option>
              <option value="credit_card">Cartao de credito</option>
            </select>
          </label>
        ) : null}

        {form.transaction_type === "income" || form.source !== "credit_card" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Conta</span>
            <select
              value={form.account}
              onChange={(e) => setForm((atual) => ({ ...atual, account: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="">Selecione</option>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {form.transaction_type === "expense" && form.source === "credit_card" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Cartao de credito</span>
            <select
              value={form.credit_card || ""}
              onChange={(e) => setForm((atual) => ({ ...atual, credit_card: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="">Selecione</option>
              {cartoes.map((cartao) => (
                <option key={cartao.id} value={cartao.id}>
                  {cartao.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Categoria</span>
          <select
            value={form.category}
            onChange={(e) => setForm((atual) => ({ ...atual, category: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="">Selecione</option>
            {categoriasDoTipo.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Descricao</span>
          <input
            value={form.description}
            onChange={(e) => setForm((atual) => ({ ...atual, description: e.target.value }))}
            placeholder="Ex.: supermercado"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Valor</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((atual) => ({ ...atual, amount: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Data</span>
            <input
              type="date"
              value={form.occurred_on}
              onChange={(e) => setForm((atual) => ({ ...atual, occurred_on: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvando ? "Salvando..." : editandoId ? "Salvar alteracoes" : "Criar transacao"}
          </button>
          {editandoId ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
