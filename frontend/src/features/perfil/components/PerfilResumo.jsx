export default function PerfilResumo() {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-base font-bold text-ink">Dados do usuario</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Nome</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Nao informado</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">E-mail</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Nao informado</p>
        </div>
      </div>
    </section>
  );
}
