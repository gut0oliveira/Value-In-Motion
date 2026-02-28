const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CartoesResumo({ resumo }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <article className="rounded-xl bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Cartões ativos</p>
        <p className="mt-1 text-xl font-black text-ink">{resumo.ativos}</p>
      </article>
      <article className="rounded-xl bg-sky-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-sky-700">Limite total</p>
        <p className="mt-1 text-xl font-black text-sky-700">{formatoMoeda.format(resumo.limiteTotal)}</p>
      </article>
      <article className="rounded-xl bg-amber-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-amber-700">Limite usado</p>
        <p className="mt-1 text-xl font-black text-amber-700">{formatoMoeda.format(resumo.usadoTotal)}</p>
      </article>
      <article className="rounded-xl bg-emerald-50 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">Disponível</p>
        <p className="mt-1 text-xl font-black text-emerald-700">{formatoMoeda.format(resumo.disponivelTotal)}</p>
      </article>
    </div>
  );
}
