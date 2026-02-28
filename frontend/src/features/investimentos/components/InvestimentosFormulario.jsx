const TIPOS_ATIVO = [
  { value: "renda_fixa", label: "Renda fixa" },
  { value: "acao", label: "Acoes" },
  { value: "fii", label: "FII" },
  { value: "etf", label: "ETF" },
  { value: "cripto", label: "Cripto" },
  { value: "outro", label: "Outro" },
];

export default function InvestimentosFormulario({ editandoId, form, setForm, salvando, onSubmit, onCancel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
      <h2 className="text-base font-bold text-ink">
        {editandoId ? `Editar investimento #${editandoId}` : "Novo investimento"}
      </h2>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Nome do ativo</span>
          <input
            value={form.nome}
            onChange={(e) => setForm((atual) => ({ ...atual, nome: e.target.value }))}
            placeholder="Ex.: Tesouro Selic 2029"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Tipo</span>
          <select
            value={form.tipo}
            onChange={(e) => setForm((atual) => ({ ...atual, tipo: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {TIPOS_ATIVO.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Corretora / banco</span>
          <input
            value={form.instituicao}
            onChange={(e) => setForm((atual) => ({ ...atual, instituicao: e.target.value }))}
            placeholder="Ex.: NuInvest"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Valor investido</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.valorInvestido}
              onChange={(e) => setForm((atual) => ({ ...atual, valorInvestido: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Valor atual</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.valorAtual}
              onChange={(e) => setForm((atual) => ({ ...atual, valorAtual: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Data do aporte</span>
          <input
            type="date"
            value={form.dataAporte}
            onChange={(e) => setForm((atual) => ({ ...atual, dataAporte: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvando ? "Salvando..." : editandoId ? "Salvar alteracoes" : "Criar investimento"}
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
