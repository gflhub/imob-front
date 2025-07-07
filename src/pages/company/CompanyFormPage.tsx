// src/pages/CompanyFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCompany, fetchCompanyById, updateCompany } from '@/services/company.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema de validação com Zod
const companyFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    cnpj: z.string().length(14, "O CNPJ deve ter 14 dígitos."),
    email: z.string().email("Formato de email inválido."),
    phone: z.string().min(10, "Telefone inválido."),
    address: z.object({
        street: z.string().min(3, "Rua inválida."),
        number: z.string().min(1, "Número inválido."),
        city: z.string().min(2, "Cidade inválida."),
        state: z.string().length(2, "Estado inválido (ex: SP)."),
        zip: z.string().length(8, "CEP inválido."),
        country: z.string().min(2, "País inválido."),
        complement: z.string().optional(),
    })
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

export function CompanyFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { data: existingCompany, isLoading: isLoadingData } = useQuery({
        queryKey: ['company', id],
        queryFn: () => fetchCompanyById(id!),
        enabled: isEditMode,
    });

    const form = useForm<CompanyFormData>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: { name: '', cnpj: '', email: '', phone: '', address: { street: '', number: '', city: '', state: '', zip: '', country: '' } },
    });

    useEffect(() => {
        if (existingCompany) {
            form.reset(existingCompany);
        }
    }, [existingCompany, form]);

    const mutation = useMutation({
        mutationFn: (data: CompanyFormData) => {
            return isEditMode ? updateCompany(id!, data) : createCompany(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            navigate('/company');
        },
        onError: (error) => {
            console.error("Erro:", error);
            // Aqui você pode mostrar uma notificação de erro para o usuário
        }
    });

    const onSubmit = (data: CompanyFormData) => {
        mutation.mutate(data);
    };

    if (isLoadingData) return <div>Carregando...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</CardTitle>
                <CardDescription>Preencha os dados da empresa.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome da Empresa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="cnpj" render={({ field }) => (
                            <FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        {/* Adicione os outros campos (email, phone, address, etc) seguindo o mesmo padrão */}
                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}