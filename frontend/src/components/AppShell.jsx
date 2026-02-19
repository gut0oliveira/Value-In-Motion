import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { sair } from "../lib/api";

const itensMenu = [
  { to: "/", label: "Dashboard" },
  { to: "/transacoes", label: "Transacoes" },
  { to: "/contas", label: "Contas" },
  { to: "/categorias", label: "Categorias" },
  { to: "/orcamentos", label: "Orcamentos" },
  { to: "/metas", label: "Metas" },
  { to: "/recorrencias", label: "Recorrencias" },
  { to: "/faturas", label: "Faturas" },
  { to: "/calendario", label: "Calendario" },
  { to: "/relatorios", label: "Relatorios" },
  { to: "/investimentos", label: "Investimentos" },
  { to: "/perfil-configuracoes", label: "Perfil e Configuracoes" },
  { to: "/admin-sistema", label: "Admin do Sistema" },
];

export default function AppShell() {
  const navigate = useNavigate();

  function encerrarSessao() {
    sair();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1440px] gap-4 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl bg-ink p-4 text-white lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Vimo</p>
          <h1 className="mt-2 text-2xl font-black leading-tight">Value in Motion</h1>
          <p className="mt-1 text-sm text-slate-300">Painel financeiro pessoal e profissional.</p>

          <nav className="mt-6 space-y-1">
            {itensMenu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-white/20 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={encerrarSessao}
            className="mt-8 w-full rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Sair
          </button>
        </aside>

        <section className="min-w-0 flex-1 rounded-2xl">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:hidden">
            <p className="text-sm font-semibold text-ink">Menu rapido</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {itensMenu.slice(0, 6).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-xs font-medium ${
                      isActive ? "bg-ink text-white" : "bg-slate-100 text-slate-700"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={encerrarSessao}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Sair
              </button>
            </div>
          </div>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
