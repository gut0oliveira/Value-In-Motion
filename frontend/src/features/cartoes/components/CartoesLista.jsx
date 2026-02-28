const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function Dia({ valor }) {
  return String(valor).padStart(2, "0");
}

function ajustarDia(ano, mesBaseZero, dia) {
  const ultimoDia = new Date(ano, mesBaseZero + 1, 0).getDate();
  return Math.min(dia, ultimoDia);
}

function proximaDataDia(dia) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diaHoje = hoje.getDate();

  const diaAtualMes = ajustarDia(ano, mes, dia);
  if (diaHoje <= diaAtualMes) {
    return new Date(ano, mes, diaAtualMes);
  }
  const proximoMes = mes + 1;
  const anoProximo = ano + Math.floor(proximoMes / 12);
  const mesProximo = proximoMes % 12;
  const diaProximoMes = ajustarDia(anoProximo, mesProximo, dia);
  return new Date(anoProximo, mesProximo, diaProximoMes);
}

function proximaFatura(item) {
  const fechamento = Number(item.closing_day || 1);
  const vencimento = Number(item.due_day || 1);
  const proximoFechamento = proximaDataDia(fechamento);
  const anoBase = proximoFechamento.getFullYear();
  const mesBase = proximoFechamento.getMonth();
  const somaMes = vencimento > fechamento ? 0 : 1;
  const mesVencimento = mesBase + somaMes;
  const anoVencimento = anoBase + Math.floor(mesVencimento / 12);
  const mesVencimentoNormalizado = mesVencimento % 12;
  const diaVencimento = ajustarDia(anoVencimento, mesVencimentoNormalizado, vencimento);
  const proximoVencimento = new Date(anoVencimento, mesVencimentoNormalizado, diaVencimento);
  return { proximoFechamento, proximoVencimento };
}

export default function CartoesLista({
  carregando,
  cartoesFiltrados,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Cartões cadastrados</h2>
          <p className="mt-1 text-xs text-slate-500">Configure limite, fechamento e vencimento por cartão.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cartao"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="all">Todos</option>
            <option value="active">Somente ativos</option>
            <option value="inactive">Somente inativos</option>
          </select>
        </div>
      </div>

      {carregando ? (
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : cartoesFiltrados.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Nenhum cartão encontrado para esse filtro.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {cartoesFiltrados.map((item) => {
            const fatura = proximaFatura(item);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.brand || "Sem bandeira"} | Limite {formatoMoeda.format(Number(item.limit_amount || 0))}
                  </p>
                  <p className="text-xs text-slate-500">
                    Usado: {formatoMoeda.format(item.usado || 0)} | Disponível:{" "}
                    {formatoMoeda.format(item.disponivel || 0)}
                  </p>
                  <div className="mt-1 h-2.5 w-full max-w-md rounded-full bg-slate-200">
                    <div
                      className={`h-2.5 rounded-full ${item.percentualUso >= 90 ? "bg-rose-600" : item.percentualUso >= 70 ? "bg-amber-500" : "bg-emerald-600"}`}
                      style={{ width: `${item.percentualUso > 0 ? Math.max(2, item.percentualUso) : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{(item.percentualUso || 0).toFixed(1)}% do limite utilizado</p>
                  <p className="text-xs font-medium text-slate-600">
                    Próxima fatura: fecha em {formatoData.format(fatura.proximoFechamento)} e vence em{" "}
                    {formatoData.format(fatura.proximoVencimento)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.is_active ? "Ativo" : "Inativo"}
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
            );
          })}
        </ul>
      )}
    </article>
  );
}
