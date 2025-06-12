// src/layouts/AdminLayout.tsx
import { Outlet } from 'react-router-dom';
// Vamos criar os componentes Header e Sidebar a seguir
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export function AdminLayout() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* As páginas (Dashboard, etc.) serão renderizadas aqui */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}