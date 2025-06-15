// src/pages/customer/CustomerFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomer, fetchCustomerById, updateCustomer } from '@/services/person.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema de validação com Zod para o formulário de cliente
const customerFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Formato de email inválido."),
    phone: z.string().min(10, "Telefone inválido."),
    doc: z.string().min(11, "Documento inválido."),
    birth: z.string().min(8, "Data de nascimento inválida."),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export function CustomerFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { data: existingCustomer, isLoading: isLoadingData } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => fetchCustomerById(id!),
        enabled: isEditMode,
    });

    const form = useForm<CustomerFormData>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: { name: '', email: '', phone: '', doc: '', birth: '' },
    });

    useEffect(() => {
        if (existingCustomer) {
            form.reset(existingCustomer);
        }
    }, [existingCustomer, form]);

    const mutation = useMutation({
        mutationFn: (data: CustomerFormData) => {
            return isEditMode ? updateCustomer(id!, data) : createCustomer(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            navigate('/customers');
        },
    });

    if (isLoadingData) return <div>Carregando cliente...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="doc" render={({ field }) => (
                            <FormItem><FormLabel>Documento (CPF/CNPJ)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="birth" render={({ field }) => (
                            <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <div className="flex justify-end pt-4">
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