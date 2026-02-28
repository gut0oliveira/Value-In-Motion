import PerfilAcoes from "../components/PerfilAcoes";
import PerfilResumo from "../components/PerfilResumo";

export default function PerfilPage() {
  return (
    <main className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Modulo</p>
      <h1 className="mt-2 text-2xl font-black text-ink">Perfil</h1>
      <p className="mt-2 text-sm text-slate-600">Gerencie seus dados pessoais e informacoes principais da conta.</p>

      <PerfilResumo />
      <PerfilAcoes />
    </main>
  );
}
