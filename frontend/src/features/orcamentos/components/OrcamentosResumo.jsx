const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function OrcamentosResumo({ resumo }) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Ativos</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.ativos}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Alertas</p>
        <p className="mt-1 text-xl font-black text-amber-700">{resumo.alertas}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Estourados</p>
        <p className="mt-1 text-xl font-black text-rose-700">{resumo.estourados}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Limite total</p>
        <p className="mt-1 text-xl font-black text-ink">{formatoMoeda.format(resumo.limiteTotal)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Gasto total</p>
        <p className="mt-1 text-xl font-black text-ink">{formatoMoeda.format(resumo.gastoTotal)}</p>
      </div>
    </div>
  );
}
