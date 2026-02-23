const TIPOS_CONTA = [
  { value: "checking", label: "Conta corrente" },
  { value: "savings", label: "Poupanca" },
  { value: "cash", label: "Carteira / Dinheiro" },
  { value: "investment", label: "Investimento" },
];

export default function ContasFormulario({ editandoId, form, setForm, salvando, onSubmit, onCancel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
      <h2 className="text-base font-bold text-ink">{editandoId ? `Editar conta #${editandoId}` : "Nova conta"}</h2>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Nome</span>
          <input
            value={form.name}
            onChange={(e) => setForm((atual) => ({ ...atual, name: e.target.value }))}
            placeholder="Ex.: Nubank principal"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Tipo</span>
          <select
            value={form.account_type}
            onChange={(e) => setForm((atual) => ({ ...atual, account_type: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {TIPOS_CONTA.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Criar conta"}
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
