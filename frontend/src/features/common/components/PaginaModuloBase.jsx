export default function PaginaModuloBase({ titulo, descricao }) {
  return (
    <main className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Modulo</p>
      <h1 className="mt-2 text-2xl font-black text-ink">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{descricao}</p>

      <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <p className="text-sm text-slate-700">
          Esta pagina ja esta preparada no menu lateral. Na proxima etapa podemos implementar o CRUD completo
          deste modulo.
        </p>
      </section>
    </main>
  );
}
