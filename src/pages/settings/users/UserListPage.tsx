// src/pages/settings/users/UserListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchBrokers } from '@/services/person.service';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

export function UserListPage() {
    const { data: brokers, isLoading } = useQuery({
        queryKey: ['brokers'],
        queryFn: fetchBrokers,
    });

    if (isLoading) return <div>Carregando usuários...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Usuários e Corretores</CardTitle>
                    <CardDescription>Gerencie os usuários com acesso ao sistema.</CardDescription>
                </div>
                <Link to="/settings/users/new">
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Adicionar Usuário</span>
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brokers?.map((broker) => (
                            <TableRow key={broker._id}>
                                <TableCell className="font-medium">{broker.name}</TableCell>
                                <TableCell>{broker.email}</TableCell>
                                <TableCell>{broker.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={broker.active ? 'default' : 'destructive'}>
                                        {broker.active ? 'Ativo' : 'Inativo'}
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
                                            <Link to={`/brokers/edit/${broker._id}`}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
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