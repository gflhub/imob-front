// src/pages/PropertyListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchProperties } from '@/services/property.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Link } from 'react-router-dom';


import React from 'react';

function PropertiesCard({ children }: { children: React.ReactNode }) {
    return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Imóveis</CardTitle>
                <CardDescription>Gerencie os imóveis cadastrados na sua empresa.</CardDescription>
            </div>
            <div>
                <Link to="/properties/new">
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Adicionar Imóvel
                        </span>
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead>
                            <span className="sr-only">Ações</span>
                        </TableHead>
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

export function PropertyListPage() {
    // O hook useQuery busca os dados e gerencia os estados de loading e erro para nós.
    const { data: properties, isLoading, isError, error } = useQuery({
        queryKey: ['properties'], // Uma chave única para esta query
        queryFn: fetchProperties, // A função que busca os dados
    });

    if (isLoading) {
        return <PropertiesCard>Carregando imóveis...</PropertiesCard>;
    }

    // if (isError) {
    //     return <div>Erro ao buscar imóveis: {error.message}</div>;
    // }

    return (
        <PropertiesCard>
            {properties?.map((property) => (
                <TableRow key={property._id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>
                        <Badge variant={property.status === 'active' ? 'default' : 'destructive'}>
                            {property.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Desativar</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </PropertiesCard>
    );
}