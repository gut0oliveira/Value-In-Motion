export default function ConfirmDialog({
  aberto,
  titulo = "Confirmar ação",
  mensagem = "Deseja continuar?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{mensagem}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}