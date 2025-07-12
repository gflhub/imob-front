// src/pages/settings/access-control/roles/RoleListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '@/services/user.service';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import React from 'react';

function RolesCard({ children }: { children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Papéis</CardTitle>
                    <CardDescription>Gerencie os papéis de usuário do sistema.</CardDescription>
                </div>
                <Link to="/settings/access-control/roles/new">
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Adicionar Papel</span>
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Permissões</TableHead>
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

export function RoleListPage() {
    const { data: roles, isLoading, isError } = useQuery({
        queryKey: ['roles'],
        queryFn: fetchRoles,
    });

    if (isLoading) {
        return (
            <RolesCard>
                <TableRow>
                    <TableCell colSpan={3}>
                        Carregando papéis...
                    </TableCell>
                </TableRow>
            </RolesCard>
        );
    }

    if (isError) {
        return (
            <RolesCard>
                <TableRow>
                    <TableCell colSpan={3}>
                        Erro ao carregar os dados.
                    </TableCell>
                </TableRow>
            </RolesCard>
        );
    }

    return (
        <RolesCard>
            {roles?.map((role) => (
                <TableRow key={role._id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.permissions.length}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <Link to={`/settings/access-control/roles/edit/${role._id}`}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </RolesCard>
    );
}
