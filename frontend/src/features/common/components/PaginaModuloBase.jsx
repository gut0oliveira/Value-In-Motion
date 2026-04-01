export default function PaginaModuloBase({ titulo, descricao }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">Módulo</p>
      <h1 className="mt-1 text-2xl font-black text-ink">{titulo}</h1>
      <p className="mt-1 text-sm text-slate-500">{descricao}</p>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-400 text-center">
          Este módulo está disponível no menu. Em breve o CRUD completo será implementado aqui.
        </p>
      </div>
    </div>
  );
}