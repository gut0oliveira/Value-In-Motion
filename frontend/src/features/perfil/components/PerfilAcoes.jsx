export default function PerfilAcoes() {
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-bold text-ink">Acoes de perfil</h2>
      <p className="mt-1 text-sm text-slate-600">Atualize suas informacoes pessoais e preferencia de exibicao.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Editar perfil</button>
        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Alterar foto
        </button>
      </div>
    </section>
  );
}
