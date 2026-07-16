import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import Alunos from "../pages/Alunos/Alunos";
import Planos from "../pages/Planos/Planos";
import Matriculas from "../pages/Matriculas/Matriculas";
import Produtos from "../pages/Produtos/Produtos";
import Pagamentos from "../pages/Pagamentos/Pagamentos";

function PaginaTemporaria({ titulo }) {
  return <h1>{titulo}</h1>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/alunos" element={<Alunos />} />

          <Route path="/planos" element={<Planos />} />

          <Route path="/produtos" element={<Produtos />} />

          <Route path="/matriculas" element={<Matriculas />} />

          <Route path="/pagamentos" element={<Pagamentos />} />

          <Route
            path="/nutri"
            element={<PaginaTemporaria titulo="Nutricionista Virtual" />}
          />

          <Route
            path="/usuarios"
            element={<PaginaTemporaria titulo="Usuários" />}
          />

          <Route
            path="/config"
            element={<PaginaTemporaria titulo="Configurações" />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;