import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { sair } from "../lib/api";

function IconeMenu({ nome, className = "h-4 w-4" }) {
  const icones = {
    dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
    transacoes:
      "M4 7h13m0 0-3-3m3 3-3 3M20 17H7m0 0 3-3m-3 3 3 3",
    contas:
      "M3 7.5 12 3l9 4.5M4 10h16M6 10v8m4-8v8m4-8v8m4-8v8M3 21h18",
    cartoes: "M3 7h18v10H3V7Zm0 4h18M7 15h3",
    categorias:
      "m4 7 6-4 10 7-6 4L4 7Zm0 0v8l10 7v-8",
    orcamentos:
      "M7 3h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z",
    metas: "m9 9 6-6m0 0h-4m4 0v4M5 21l7-7",
    recorrencias: "M3 11a8 8 0 0 1 14-5m4-2v6h-6M21 13a8 8 0 0 1-14 5m-4 2v-6h6",
    faturas: "M3 6h18v12H3V6Zm0 4h18M7 14h3",
    calendario: "M8 2v4m8-4v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12H3V7a2 2 0 0 1 2-2Z",
    relatorios: "M4 19V5m5 14V9m5 10V12m5 7V7",
    investimentos: "M4 18 10 12l4 4 6-8M4 5h16",
    perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
    admin: "m12 3 8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={icones[nome] || icones.dashboard} />
    </svg>
  );
}

const itensMenu = [
  { to: "/", label: "Dashboard", icone: "dashboard" },
  { to: "/contas", label: "Contas", icone: "contas" },
  { to: "/cartoes", label: "Cartoes", icone: "cartoes" },
  { to: "/categorias", label: "Categorias", icone: "categorias" },
  { to: "/transacoes", label: "Transacoes", icone: "transacoes" },
  { to: "/recorrencias", label: "Recorrencias", icone: "recorrencias" },
  { to: "/faturas", label: "Faturas", icone: "faturas" },
  { to: "/orcamentos", label: "Orcamentos", icone: "orcamentos" },
  { to: "/calendario", label: "Calendario", icone: "calendario" },
  { to: "/metas", label: "Metas", icone: "metas" },
  { to: "/investimentos", label: "Investimentos", icone: "investimentos" },
  { to: "/relatorios", label: "Relatorios", icone: "relatorios" },
  { to: "/perfil-configuracoes", label: "Perfil e Configuracoes", icone: "perfil" },
  { to: "/admin-sistema", label: "Admin do Sistema", icone: "admin" },
];

export default function AppShell() {
  const navigate = useNavigate();
  const [menuMinimizado, setMenuMinimizado] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("vimo_menu_minimizado");
    setMenuMinimizado(salvo === "true");
  }, []);

  function alternarMenu() {
    setMenuMinimizado((atual) => {
      const proximo = !atual;
      localStorage.setItem("vimo_menu_minimizado", String(proximo));
      return proximo;
    });
  }

  function encerrarSessao() {
    sair();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1440px] gap-4 p-4 md:p-6">
        <aside
          className={`hidden shrink-0 rounded-2xl bg-ink p-4 text-white lg:block ${
            menuMinimizado ? "w-20" : "w-72"
          }`}
        >
          <button
            onClick={alternarMenu}
            className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 text-xs font-semibold hover:bg-white/10"
            title={menuMinimizado ? "Expandir menu" : "Minimizar menu"}
            aria-label={menuMinimizado ? "Expandir menu" : "Minimizar menu"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 transition-transform ${menuMinimizado ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Vimo</p>
          {!menuMinimizado ? (
            <>
              <h1 className="mt-2 text-2xl font-black leading-tight">Value in Motion</h1>
              <p className="mt-1 text-sm text-slate-300">Painel financeiro pessoal e profissional.</p>
            </>
          ) : null}

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
                title={item.label}
              >
                <span className="flex items-center gap-2">
                  <IconeMenu nome={item.icone} className="h-4 w-4" />
                  {!menuMinimizado ? <span>{item.label}</span> : null}
                </span>
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
                  <span className="mr-1 inline-flex align-middle">
                    <IconeMenu nome={item.icone} className="h-3.5 w-3.5" />
                  </span>
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
