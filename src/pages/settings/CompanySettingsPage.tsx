// src/pages/settings/CompanySettingsPage.tsx
import { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompany } from '@/services/company.service';
import { useAuth } from '@/contexts/AuthContext'; // Para pegar os dados da empresa logada

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema de validação (pode ser o mesmo ou uma variação do DTO de empresa)
const companySettingsSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Formato de email inválido."),
    phone: z.string().min(10, "Telefone inválido."),
    // CNPJ e Owner não são editáveis aqui
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

export function CompanySettingsPage() {
    
    const queryClient = useQueryClient();
    const { user, login } = useAuth(); // Usamos o `login` para atualizar os dados no contexto
    const company = user?.company;

    const form = useForm<CompanySettingsFormData>({
        resolver: zodResolver(companySettingsSchema),
    });

    // Preenche o formulário com os dados da empresa do contexto
    useEffect(() => {
        if (company) {
            form.reset({
                name: company.name,
                email: company.email,
                phone: company.phone,
            });
        }
    }, [company, form]);

    const mutation = useMutation({
        mutationFn: (data: CompanySettingsFormData) => updateCompany(company!._id, data),
        onSuccess: (updatedCompany) => {
            // Atualiza os dados do usuário no contexto para refletir o novo nome da empresa no Header
            const updatedUser = { ...user!, company: { ...user!.company!, name: updatedCompany.name } };
            login(localStorage.getItem('authToken')!, updatedUser);

            queryClient.invalidateQueries({ queryKey: ['companies'] });
            // Adicionar notificação de sucesso
            alert("Empresa atualizada com sucesso!");
        },
    });

    if (!company) {
        return <div>Carregando dados da empresa...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>Edite as informações principais da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome da Empresa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email de Contato</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}