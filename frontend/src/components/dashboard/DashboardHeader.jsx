export default function DashboardHeader({ nomeUsuario, onNovaReceita, onNovaDespesa }) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-ink px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Painel financeiro</p>
        <h1 className="mt-1 text-2xl font-black uppercase">{nomeUsuario || "Usuario"}</h1>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onNovaReceita}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400"
        >
          Nova receita
        </button>
        <button
          onClick={onNovaDespesa}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold hover:bg-amber-400"
        >
          Nova despesa
        </button>
      </div>
    </header>
  );
}
