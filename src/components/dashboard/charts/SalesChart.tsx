// src/components/dashboard/charts/SalesChart.tsx
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Dados fictícios
const data = [
    { month: "Jan", total: Math.floor(Math.random() * 50000) + 10000 },
    { month: "Fev", total: Math.floor(Math.random() * 50000) + 10000 },
    { month: "Mar", total: Math.floor(Math.random() * 50000) + 10000 },
    { month: "Abr", total: Math.floor(Math.random() * 70000) + 20000 },
    { month: "Mai", total: Math.floor(Math.random() * 50000) + 10000 },
    { month: "Jun", total: Math.floor(Math.random() * 90000) + 30000 },
];

export function SalesChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vendas por Mês</CardTitle>
                <CardDescription>Total de vendas nos últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="month"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${value / 1000}k`}
                        />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}