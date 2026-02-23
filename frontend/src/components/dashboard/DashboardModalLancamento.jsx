export default function DashboardModalLancamento({
  aberto,
  tipoLancamento,
  erroModal,
  salvandoModal,
  formTransacao,
  contas,
  cartoes,
  categoriasDoTipo,
  onFechar,
  onSalvar,
  setFormTransacao,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-black text-ink">{tipoLancamento === "income" ? "Nova receita" : "Nova despesa"}</h2>
        <p className="mt-1 text-sm text-slate-500">Preencha os campos para registrar a transação.</p>

        <form className="mt-5 space-y-3" onSubmit={onSalvar}>
          {tipoLancamento === "expense" ? (
            <fieldset className="block text-sm font-medium text-slate-700">
              <legend>Origem da despesa</legend>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    (formTransacao.source || "account") === "account"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  } ${!contas.length ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={(formTransacao.source || "account") === "account"}
                    disabled={!contas.length}
                    onChange={(e) => {
                      if (!e.target.checked) return;
                      setFormTransacao((atual) => ({ ...atual, source: "account" }));
                    }}
                  />
                  <span className="text-sm font-semibold">Conta Corrente</span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    formTransacao.source === "credit_card"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  } ${!cartoes.length ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={formTransacao.source === "credit_card"}
                    disabled={!cartoes.length}
                    onChange={(e) => {
                      if (!e.target.checked) return;
                      setFormTransacao((atual) => ({ ...atual, source: "credit_card" }));
                    }}
                  />
                  <span className="text-sm font-semibold">Cartão de Crédito</span>
                </label>
              </div>
            </fieldset>
          ) : null}

          {tipoLancamento === "income" || formTransacao.source !== "credit_card" ? (
            <label className="block text-sm font-medium text-slate-700">
              Conta
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={formTransacao.account}
                onChange={(e) => setFormTransacao((atual) => ({ ...atual, account: e.target.value }))}
                required={tipoLancamento === "income" || formTransacao.source !== "credit_card"}
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

          {tipoLancamento === "expense" && formTransacao.source === "credit_card" ? (
            <label className="block text-sm font-medium text-slate-700">
              Cartão de Crédito
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={formTransacao.credit_card || ""}
                onChange={(e) => setFormTransacao((atual) => ({ ...atual, credit_card: e.target.value }))}
                required
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

          <label className="block text-sm font-medium text-slate-700">
            Categoria
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={formTransacao.category}
              onChange={(e) => setFormTransacao((atual) => ({ ...atual, category: e.target.value }))}
              required
            >
              <option value="">Selecione</option>
              {categoriasDoTipo.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Descricao
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={formTransacao.description}
              onChange={(e) => setFormTransacao((atual) => ({ ...atual, description: e.target.value }))}
              placeholder="Ex: salário, mercado, aluguel..."
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Valor
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={formTransacao.amount}
                onChange={(e) => setFormTransacao((atual) => ({ ...atual, amount: e.target.value }))}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Data
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={formTransacao.occurred_on}
                onChange={(e) => setFormTransacao((atual) => ({ ...atual, occurred_on: e.target.value }))}
                required
              />
            </label>
          </div>

          {erroModal ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroModal}</p> : null}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvandoModal}
              className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {salvandoModal ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
