import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../../../lib/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "", email: "", password: "", confirmPassword: "",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function atualizar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (form.password !== form.confirmPassword) {
      setErro("As senhas não conferem.");
      return;
    }
    setEnviando(true);
    try {
      await register({
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      await login(form.username, form.password, form.lastName);
      navigate("/", { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const campos = [
    { label: "Usuário", campo: "username", type: "text", placeholder: "seu_usuario" },
    { label: "Primeiro nome", campo: "firstName", type: "text", placeholder: "João" },
    { label: "Último nome", campo: "lastName", type: "text", placeholder: "Silva" },
    { label: "E-mail", campo: "email", type: "email", placeholder: "joao@email.com" },
    { label: "Senha", campo: "password", type: "password", placeholder: "••••••••" },
    { label: "Confirmar senha", campo: "confirmPassword", type: "password", placeholder: "••••••••" },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">VIMO</p>
            <h1 className="mt-1 text-3xl font-black text-ink">Criar conta</h1>
            <p className="mt-1 text-sm text-slate-500">Cadastre-se para iniciar seu painel financeiro.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {campos.map(({ label, campo, type, placeholder }) => (
              <div key={campo}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[campo]}
                  onChange={atualizar(campo)}
                  placeholder={placeholder}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            ))}

            {erro && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500 shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-red-700">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-mint py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviando ? "Cadastrando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Já tem conta?{" "}
            <Link to="/login" className="font-semibold text-green-700 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}