// src/pages/DashboardPage.tsx
import { useAuth } from "@/contexts/AuthContext";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesChart } from "@/components/dashboard/charts/SalesChart";
// Importe outros gráficos aqui, como o PropertyTypeChart

export function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-8">
            {/* Seção de Boas-vindas */}
            <div>
                <h1 className="text-3xl font-bold">Bem-vindo(a) de volta, {user?.name || 'Usuário'}!</h1>
                <p className="text-muted-foreground">Aqui está um resumo da sua empresa, {user?.company?.name}.</p>
            </div>

            {/* Seção de Atalhos */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
                <QuickActions />
            </div>

            {/* Seção de Gráficos */}
            <div className="grid gap-6 md:grid-cols-2">
                <SalesChart />
                {/* Adicione outros gráficos aqui */}
                {/* <PropertyTypeChart /> */}
            </div>
        </div>
    );
}