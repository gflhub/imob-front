// src/pages/cashier/CashierPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInstallments, fetchCashierSummary } from '@/services/payment.service';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InstallmentsTable } from '@/components/cashier/InstallmentsTable';
import { useDebounce } from '@/hooks/useDebounce'; // Criaremos este hook

// Crie o hook useDebounce em `src/hooks/useDebounce.ts` para evitar buscas na API a cada tecla digitada
// export const useDebounce = (value, delay) => { ... implementação padrão de debounce ... };

function SummaryCard({ title, value, count }: { title: string, value: number, count: number }) {
    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedValue}</div>
                <p className="text-xs text-muted-foreground">{count} títulos</p>
            </CardContent>
        </Card>
    );
}

export function CashierPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Atraso de 500ms

    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ['cashierSummary'],
        queryFn: fetchCashierSummary
    });

    const { data: installments, isLoading: loadingInstallments } = useQuery({
        queryKey: ['installments', debouncedSearchTerm],
        queryFn: () => fetchInstallments(debouncedSearchTerm),
    });

    const isLoading = loadingSummary || loadingInstallments;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Caixa e Recebimentos</h1>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard title="Vencendo Hoje" value={summary?.dueToday.total || 0} count={summary?.dueToday.count || 0} />
                <SummaryCard title="Títulos Vencidos" value={summary?.overdue.total || 0} count={summary?.overdue.count || 0} />
                <SummaryCard title="Recebido Hoje" value={summary?.paidToday.total || 0} count={summary?.paidToday.count || 0} />
            </div>

            {/* Filtro e Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Títulos a Receber</CardTitle>
                    <div className="mt-4">
                        <Input
                            placeholder="Buscar por nome do cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Carregando...</p> : <InstallmentsTable installments={installments || []} />}
                </CardContent>
            </Card>
        </div>
    );
}