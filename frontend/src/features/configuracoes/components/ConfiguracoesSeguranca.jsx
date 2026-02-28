export default function ConfiguracoesSeguranca() {
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-bold text-ink">Seguranca e notificacoes</h2>
      <p className="mt-1 text-sm text-slate-600">
        Controle senha, autenticacao e preferencias de envio de notificacoes.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Alterar senha</button>
        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Configurar notificacoes
        </button>
      </div>
    </section>
  );
}
