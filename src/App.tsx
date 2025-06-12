// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyListPage } from './pages/PropertyListPage';
import { PropertyFormPage } from './pages/PropertyFormPage';

const queryClient = new QueryClient();

// Componente para lidar com a rota raiz "/"
function Root() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Carregando aplicação...</div>;
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* ADICIONA A NOVA ROTA AQUI */}
            <Route path="/properties" element={<PropertyListPage />} />
            <Route path="/properties/new" element={<PropertyFormPage />} />
            <Route path="/properties/edit/:id" element={<PropertyFormPage />} />

          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    // Envolva o AuthProvider com o QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}