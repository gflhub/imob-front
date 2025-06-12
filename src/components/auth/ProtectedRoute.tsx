// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Mostra um loader enquanto verifica a autenticação
        return <div>Carregando...</div>;
    }

    // Se estiver autenticado, renderiza a página filha. Caso contrário, redireciona para o login.
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}