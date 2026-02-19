import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccounts, fetchFinanceOverview, logout } from "../lib/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewData, accountsData] = await Promise.all([
          fetchFinanceOverview(),
          fetchAccounts(),
        ]);
        setOverview(overviewData);
        setAccounts(accountsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="flex flex-col gap-3 rounded-2xl bg-ink px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Painel</p>
          <h1 className="text-2xl font-black">Vimo Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          Sair
        </button>
      </header>

      {loading ? <p className="mt-6 text-sm text-slate-600">Carregando...</p> : null}
      {error ? <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {!loading && !error ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-ink">Finance Overview</h2>
            <pre className="mt-3 overflow-auto rounded-lg bg-clay p-3 text-xs text-slate-700">
              {JSON.stringify(overview, null, 2)}
            </pre>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-ink">Contas</h2>
            {accounts.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">Nenhuma conta cadastrada ainda.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {accounts.map((account) => (
                  <li key={account.id} className="rounded-lg bg-clay px-3 py-2">
                    <span className="font-semibold">{account.name}</span> ({account.account_type})
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      ) : null}
    </main>
  );
}
