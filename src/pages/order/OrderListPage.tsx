// src/pages/order/OrderListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/services/order.service';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

export function OrderListPage() {
    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    });

    if (isLoading) return <div>Carregando ordens...</div>;
    if (isError) return <div>Erro ao carregar os dados.</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ordens de Venda</CardTitle>
                    <CardDescription>Gerencie as ordens de venda da sua empresa.</CardDescription>
                </div>
                <Link to="/orders/new">
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Nova Ordem</span>
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Comprador Principal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor Total</TableHead>
                            <TableHead><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{order.buyers[0]?.name || 'N/A'}</TableCell>
                                <TableCell><Badge>{order.orderStatus}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link to={`/orders/view/${order._id}`}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    Ver Detalhes
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}