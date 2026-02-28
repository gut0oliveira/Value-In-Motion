const OPCOES_PERIODO = [
  { valor: "mes", label: "Mes" },
  { valor: "7d", label: "7 dias" },
  { valor: "30d", label: "30 dias" },
  { valor: "90d", label: "90 dias" },
  { valor: "ano", label: "Ano" },
];

function tipoContaLabel(tipo) {
  if (tipo === "checking") return "Conta corrente";
  if (tipo === "savings") return "Poupanca";
  if (tipo === "wallet") return "Carteira";
  if (tipo === "credit_card") return "Cartao";
  return tipo;
}

export default function DashboardFiltros({ periodo, setPeriodo, filtroConta, setFiltroConta, contas }) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {OPCOES_PERIODO.map((item) => (
            <button
              key={item.valor}
              onClick={() => setPeriodo(item.valor)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                periodo === item.valor ? "bg-ink text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          Conta
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
            value={filtroConta}
            onChange={(e) => setFiltroConta(e.target.value)}
          >
            <option value="all">Todas</option>
            {contas.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.name} ({tipoContaLabel(conta.account_type)})
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
