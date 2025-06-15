// src/pages/DashboardPage.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Bem-vindo(a) de volta, {user?.name || 'Usuário'}!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Você está logado na empresa: <strong>{user?.company?.name}</strong>.</p>
                    <p>Use o menu lateral para navegar pelas funcionalidades do sistema.</p>
                </CardContent>
            </Card>
        </div>
    );
}