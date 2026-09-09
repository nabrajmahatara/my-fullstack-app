import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspaceListPage from "./pages/WorkspaceListPage";
import WorkspaceDetailPage from "./pages/WorkspaceDeatilPage";
import BoardPage from "./pages/BoardPage";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/workspaces" element={<WorkspaceListPage />} />
          <Route
            path="/workspaces/:id"
            element={<WorkspaceDetailPage />}
          />
          <Route path="/boards/:id" element={<BoardPage />} />
        </Route>

        <Route
          path="/"
          element={<Navigate to="/workspaces" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/workspaces" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}