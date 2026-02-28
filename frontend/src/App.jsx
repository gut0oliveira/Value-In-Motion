import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./features/common/components/AppShell";
import ProtectedRoute from "./features/common/components/ProtectedRoute";
import AdminSistemaPage from "./features/misc/pages/AdminSistemaPage";
import CalendarioPage from "./features/misc/pages/CalendarioPage";
import CartoesPage from "./features/cartoes/pages/CartoesPage";
import CategoriasPage from "./features/categorias/pages/CategoriasPage";
import ContasPage from "./features/contas/pages/ContasPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import InvestimentosPage from "./features/investimentos/pages/InvestimentosPage";
import LoginPage from "./features/auth/pages/LoginPage";
import MetasPage from "./features/metas/pages/MetasPage";
import OrcamentosPage from "./features/orcamentos/pages/OrcamentosPage";
import PerfilConfiguracoesPage from "./features/misc/pages/PerfilConfiguracoesPage";
import RecorrenciasPage from "./features/recorrencias/pages/RecorrenciasPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import RelatoriosPage from "./features/relatorios/pages/RelatoriosPage";
import TransacoesPage from "./features/transacoes/pages/TransacoesPage";
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
        <Route path="/perfil" element={<Navigate to="/perfil-configuracoes" replace />} />
        <Route path="/configuracoes" element={<Navigate to="/perfil-configuracoes" replace />} />
        <Route path="/admin-sistema" element={<AdminSistemaPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />} />
    </Routes>
  );
}


