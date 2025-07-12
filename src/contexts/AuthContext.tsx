// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
// Importe seu serviço de API que criaremos a seguir
// import api from '@/services/api';

// Tipos para o usuário e o contexto
interface User {
    _id: string;
    email: string;
    name: string; // Supondo que o nome venha do 'person' populado
    type: 'user' | 'admin';
    // Adicione outros campos do usuário que você precisar
}

interface Company {
    _id: string;
    name: string;
    email: string;
    phone: string;
    // Adicione outros campos da empresa
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: (User & { company?: Company | null }) | null;
    token: string | null;
    login: (token: string, userData: User & { company?: Company | null }) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthContextType['user']>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Ao carregar a aplicação, verifica se há um token no localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: AuthContextType['user']) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        // Redireciona para a página de login
        window.location.href = '/login';
    };

    const value = {
        isAuthenticated: !!token,
        user,
        token,
        login,
        logout,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
