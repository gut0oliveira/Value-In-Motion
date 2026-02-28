export default function ConfirmDialog({
  aberto,
  titulo = "Confirmar acao",
  mensagem = "Deseja continuar?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-black text-ink">{titulo}</h2>
        <p className="mt-2 text-sm text-slate-600">{mensagem}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            {textoConfirmar}
          </button>
        </div>
      </section>
    </div>
  );
}
