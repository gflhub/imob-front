// src/pages/CompanyListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies } from '@/services/company.service';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function CompanyListCard({ children }: { children: React.ReactNode }) {
    return (<Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Empresas</CardTitle>
                <CardDescription>Gerencie as empresas cadastradas.</CardDescription>
            </div>
            <Link to="/company/new">
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Adicionar Empresa</span>
                </Button>
            </Link>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead><span className="sr-only">Ações</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {children}
                </TableBody>
            </Table>
        </CardContent>
    </Card>)
}


export function CompanyListPage() {
    const { data: companies, isLoading, isError } = useQuery({
        queryKey: ['companies'],
        queryFn: fetchCompanies,
    });

    if (isLoading) {
        return (<CompanyListCard>
            <TableRow>
                <TableCell colSpan={4} className="text-center">
                    Carregando empresas...
                </TableCell>
            </TableRow>
        </CompanyListCard>);
    }
    if (isError) {
        return (<CompanyListCard>
            <TableRow>
                <TableCell colSpan={4} className="text-center">
                    Sem dados para exibir
                </TableCell>
            </TableRow>
        </CompanyListCard>);
    }
    return (
        <CompanyListCard>
            {companies?.map((company) => (
                <TableRow key={company._id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.cnpj}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <Link to={`/company/edit/${company._id}`}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        Editar
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </CompanyListCard>
    );
}