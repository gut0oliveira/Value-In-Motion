export default function ConfiguracoesPreferencias() {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-base font-bold text-ink">Preferencias</h2>
      <p className="mt-1 text-sm text-slate-600">Idioma, formato de moeda, fuso e parametros gerais do sistema.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Idioma</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Portugues (Brasil)</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Moeda</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">BRL (R$)</p>
        </div>
      </div>
    </section>
  );
}
