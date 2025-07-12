// src/pages/settings/access-control/permissions/PermissionListPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPermissions, createPermission } from '@/services/user.service';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from 'react';

const services = [
    { path: 'property', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'person', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'company', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'order', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'payment', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'commission', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'user', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'roles', crud: ['create', 'read', 'update', 'delete'] },
    { path: 'permissions', crud: ['create', 'read', 'update', 'delete'] },
];

function PermissionsCard({ children, onSync }: { children: React.ReactNode, onSync: () => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Permissões</CardTitle>
                    <CardDescription>Permissões de acesso ao sistema.</CardDescription>
                </div>
                <Button size="sm" className="gap-1" onClick={onSync}>
                    Sincronizar Permissões
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Slug</TableHead>
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

export function PermissionListPage() {
    const queryClient = useQueryClient();
    const { data: permissions, isLoading, isError } = useQuery({
        queryKey: ['permissions'],
        queryFn: fetchPermissions,
    });

    const mutation = useMutation({
        mutationFn: (data: { name: string, slug: string }) => createPermission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
    });

    const handleSyncPermissions = () => {
        services.forEach(service => {
            service.crud.forEach(op => {
                const slug = `${service.path}_${op}`;
                const name = `${op.charAt(0).toUpperCase() + op.slice(1)} ${service.path.charAt(0).toUpperCase() + service.path.slice(1)}`;
                if (!permissions?.find(p => p.slug === slug)) {
                    mutation.mutate({ name, slug });
                }
            });
        });
    };

    if (isLoading) {
        return (
            <PermissionsCard onSync={handleSyncPermissions}>
                <TableRow>
                    <TableCell colSpan={2}>
                        Carregando permissões...
                    </TableCell>
                </TableRow>
            </PermissionsCard>
        );
    }

    if (isError) {
        return (
            <PermissionsCard onSync={handleSyncPermissions}>
                <TableRow>
                    <TableCell colSpan={2}>
                        Erro ao carregar os dados.
                    </TableCell>
                </TableRow>
            </PermissionsCard>
        );
    }

    return (
        <PermissionsCard onSync={handleSyncPermissions}>
            {permissions?.map((permission) => (
                <TableRow key={permission._id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell>{permission.slug}</TableCell>
                </TableRow>
            ))}
        </PermissionsCard>
    );
}
