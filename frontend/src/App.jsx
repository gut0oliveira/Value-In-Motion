import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSistemaPage from "./pages/AdminSistemaPage";
import CalendarioPage from "./pages/CalendarioPage";
import CartoesPage from "./pages/CartoesPage";
import CategoriasPage from "./pages/CategoriasPage";
import ContasPage from "./pages/ContasPage";
import DashboardPage from "./pages/DashboardPage";
import InvestimentosPage from "./pages/InvestimentosPage";
import LoginPage from "./pages/LoginPage";
import MetasPage from "./pages/MetasPage";
import OrcamentosPage from "./pages/OrcamentosPage";
import PerfilConfiguracoesPage from "./pages/PerfilConfiguracoesPage";
import RecorrenciasPage from "./pages/RecorrenciasPage";
import RegisterPage from "./pages/RegisterPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import TransacoesPage from "./pages/TransacoesPage";
import { isAuthenticated } from "./lib/auth";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated() ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transacoes" element={<TransacoesPage />} />
        <Route path="/contas" element={<ContasPage />} />
        <Route path="/cartoes" element={<CartoesPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/orcamentos" element={<OrcamentosPage />} />
        <Route path="/metas" element={<MetasPage />} />
        <Route path="/recorrencias" element={<RecorrenciasPage />} />
        <Route path="/faturas" element={<Navigate to="/cartoes" replace />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
        <Route path="/investimentos" element={<InvestimentosPage />} />
        <Route path="/perfil-configuracoes" element={<PerfilConfiguracoesPage />} />
        <Route path="/admin-sistema" element={<AdminSistemaPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />} />
    </Routes>
  );
}
