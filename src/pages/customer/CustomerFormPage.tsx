import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomer, fetchCustomerById, updateCustomer } from '@/services/person.service';
import { fetchAddressByZip } from '@/services/tools.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema de validação com Zod para o formulário de cliente
const customerFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Formato de email inválido."),
    phone: z.string().min(10, "Telefone inválido."),
    doc: z.string().min(11, "Documento inválido."),
    birth: z.string().min(8, "Data de nascimento inválida."),
    address: z.object({
        street: z.string().min(3, "Rua inválida."),
        number: z.string().min(1, "Número inválido."),
        complement: z.string().optional(),
        neighborhood: z.string().min(2, "Bairro inválido."),
        city: z.string().min(2, "Cidade inválida."),
        state: z.string().length(2, "Estado inválido (ex: SP)."),
        zip: z.string().length(8, "CEP inválido."),
    })
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
        defaultValues: { name: '', email: '', phone: '', doc: '', birth: '', address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' } },
    });

    const zipValue = form.watch('address.zip');

    useEffect(() => {
        if (zipValue && zipValue.length === 8) {
            fetchAddressByZip(zipValue).then(data => {
                form.setValue('address.street', data.street);
                form.setValue('address.neighborhood', data.neighborhood);
                form.setValue('address.city', data.city);
                form.setValue('address.state', data.state);
            });
        }
    }, [zipValue, form]);

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
                    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        </div>

                        <h3 className="text-lg font-semibold mt-6">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField control={form.control} name="address.zip" render={({ field }) => (
                                <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField control={form.control} name="address.street" render={({ field }) => (
                                <FormItem className="md:col-span-3"><FormLabel>Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="address.number" render={({ field }) => (
                                <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="address.complement" render={({ field }) => (
                                <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="address.neighborhood" render={({ field }) => (
                                <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="address.city" render={({ field }) => (
                                <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="address.state" render={({ field }) => (
                                <FormItem><FormLabel>Estado (UF)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

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