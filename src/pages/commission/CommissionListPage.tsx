// src/pages/commission/CommissionListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchCommissionsByBroker, type ICommission } from '@/services/commission.service';
import { Link, useParams } from 'react-router-dom';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

import React from 'react';

function CommissionsCard({ children, brokerName }: { children: React.ReactNode, brokerName: string }) {
    const { brokerId } = useParams<{ brokerId: string }>();
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Comissões de {brokerName}</CardTitle>
                    <CardDescription>Gerencie as comissões do corretor.</CardDescription>
                </div>
                <Link to={`/brokers/${brokerId}/commissions/new`}>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Adicionar Comissão</span>
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ordem</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {children}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function CommissionListPage() {
    const { brokerId } = useParams<{ brokerId: string }>();
    // TODO: Fetch broker name to display in the card title
    const brokerName = "Corretor"; // Placeholder

    const { data: commissions, isLoading, isError } = useQuery<ICommission[]> ({
        queryKey: ['commissions', brokerId],
        queryFn: () => fetchCommissionsByBroker(brokerId!),
        enabled: !!brokerId,
    });

    if (isLoading) {
        return (
            <CommissionsCard brokerName={brokerName}>
                <TableRow>
                    <TableCell colSpan={5}>
                        Carregando comissões...
                    </TableCell>
                </TableRow>
            </CommissionsCard>
        );
    }

    if (isError) {
        return (
            <CommissionsCard brokerName={brokerName}>
                <TableRow>
                    <TableCell colSpan={5}>
                        Erro ao carregar os dados.
                    </TableCell>
                </TableRow>
            </CommissionsCard>
        );
    }

    return (
        <CommissionsCard brokerName={brokerName}>
            {commissions?.map((commission) => (
                <TableRow key={commission._id}>
                    <TableCell className="font-medium">{commission.orderId.substring(0, 8)}</TableCell>
                    <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commission.amount)}</TableCell>
                    <TableCell>{new Date(commission.commissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Badge variant={commission.status === 'paid' ? 'default' : 'destructive'}>
                            {commission.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <Link to={`/brokers/${brokerId}/commissions/edit/${commission._id}`}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </CommissionsCard>
    );
}
