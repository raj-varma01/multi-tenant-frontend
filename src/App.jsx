import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api/client.js";
import { useAuthStore } from "./store/authStore.js";
import { Layout } from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { UserManagementPage } from "./pages/UserManagementPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { ForbiddenPage } from "./pages/ForbiddenPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { FileManagerPage } from "./pages/FileManagerPage.jsx";


function App() {

  const setSession = useAuthStore((s) => s.setSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const tenantId = useAuthStore((s) => s.tenantId);
  useEffect(() => {
    if (!tenantId) {
      setHydrated(true);
      return;
    }
    api
      .post("/auth/refresh")
      .then((res) => {
        setSession({ accessToken: res.data.data.accessToken, user: res.data.data.user });
      })
      .catch(() => { })
      .finally(() => setHydrated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/files" element={<FileManagerPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["owner", "admin"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
