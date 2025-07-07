// src/pages/order/OrderFormPage.tsx
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, type IOrderPayload } from '@/services/order.service';
import { fetchProperties } from '@/services/property.service';
import { fetchCustomers, fetchBrokers } from '@/services/person.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from '@/components/shared/MultiSelectCombobox';

// Zod schema para validação
const orderFormSchema = z.object({
    orderDate: z.string().min(1, "A data é obrigatória."),
    items: z.array(z.string()).min(1, "Selecione pelo menos um imóvel."),
    buyers: z.array(z.string()).min(1, "Selecione pelo menos um comprador."),
    sellers: z.array(z.string()).min(1, "Selecione pelo menos um vendedor."),
    brokers: z.array(z.string()).min(1, "Selecione pelo menos um corretor."),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export function OrderFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Busca todos os dados necessários para os seletores
    const { data: properties, isLoading: loadingProperties } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
    const { data: customers, isLoading: loadingCustomers } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
    const { data: brokers, isLoading: loadingBrokers } = useQuery({ queryKey: ['brokers'], queryFn: fetchBrokers });

    const form = useForm<OrderFormData>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: { orderDate: new Date().toISOString().split('T')[0], items: [], buyers: [], sellers: [], brokers: [] },
    });

    const mutation = useMutation({
        mutationFn: (data: IOrderPayload) => createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            navigate('/orders');
        },
    });

    function onSubmit(data: OrderFormData) {
        // Transforma os dados do formulário para o payload que a API espera
        const payload: IOrderPayload = {
            orderDate: data.orderDate,
            buyers: data.buyers,
            sellers: data.sellers,
            brokers: data.brokers,
            items: data.items.map(itemId => {
                const prop = properties?.find(p => p._id === itemId);
                return { _id: itemId, price: prop?.price || 0 }; // Pega o preço do imóvel selecionado
            })
        };
        mutation.mutate(payload);
    }

    const isLoading = loadingProperties || loadingCustomers || loadingBrokers;
    if (isLoading) return <div>Carregando dados...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Criar Nova Ordem de Venda</CardTitle>
                <CardDescription>Selecione os itens e participantes da venda.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="orderDate" render={({ field }) => (
                            <FormItem><FormLabel>Data da Ordem</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="items" render={({ field }) => (
                            <FormItem><FormLabel>Imóveis</FormLabel>
                                <MultiSelectCombobox
                                    options={properties?.map(p => ({ value: p._id, label: `${p.title} - ${p.address.city}` })) || []}
                                    selectedValues={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione os imóveis..."
                                /><FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="sellers" render={({ field }) => (
                            <FormItem><FormLabel>Vendedores</FormLabel>
                                <MultiSelectCombobox
                                    options={customers?.map(c => ({ value: c._id, label: c.name })) || []}
                                    selectedValues={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione os vendedores..."
                                /><FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="buyers" render={({ field }) => (
                            <FormItem><FormLabel>Compradores</FormLabel>
                                <MultiSelectCombobox
                                    options={customers?.map(c => ({ value: c._id, label: c.name })) || []}
                                    selectedValues={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione os compradores..."
                                /><FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="brokers" render={({ field }) => (
                            <FormItem><FormLabel>Corretores</FormLabel>
                                <MultiSelectCombobox
                                    options={brokers?.map(b => ({ value: b._id, label: b.name })) || []}
                                    selectedValues={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione os corretores..."
                                /><FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Criando Ordem...' : 'Criar Ordem'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}