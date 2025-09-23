// src/pages/order/OrderFormPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, type IOrderPayload, type IPaymentDefinition } from '@/services/order.service';
import { fetchProperties } from '@/services/property.service';
import { fetchCustomers, fetchBrokers } from '@/services/person.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from '@/components/shared/MultiSelectCombobox';
import { PaymentStep } from '@/components/forms/order/PaymentStep';

// Zod schema for step 1
const orderInfoSchema = z.object({
    orderDate: z.string().min(1, "A data é obrigatória."),
    items: z.array(z.string()).min(1, "Selecione pelo menos um imóvel."),
    buyers: z.array(z.string()).min(1, "Selecione pelo menos um comprador."),
    sellers: z.array(z.string()).min(1, "Selecione pelo menos um vendedor."),
    brokers: z.array(z.string()).min(1, "Selecione pelo menos um corretor."),
});

type OrderInfoData = z.infer<typeof orderInfoSchema>;

export function OrderFormPage() {
    const [step, setStep] = useState(1);
    const [orderData, setOrderData] = useState<Partial<IOrderPayload>>({});
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: properties, isLoading: loadingProperties } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
    const { data: customers, isLoading: loadingCustomers } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
    const { data: brokers, isLoading: loadingBrokers } = useQuery({ queryKey: ['brokers'], queryFn: fetchBrokers });

    const form = useForm<OrderInfoData>({
        resolver: zodResolver(orderInfoSchema),
        defaultValues: { orderDate: new Date().toISOString().split('T')[0], items: [], buyers: [], sellers: [], brokers: [] },
    });

    const mutation = useMutation({
        mutationFn: (data: IOrderPayload) => createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            navigate('/orders');
        },
    });

    function onInfoSubmit(data: OrderInfoData) {
        const itemsWithPrices = data.items.map(itemId => {
            const prop = properties?.find(p => p._id === itemId);
            return { _id: itemId, price: prop?.price || 0 };
        });

        setOrderData({
            orderDate: data.orderDate,
            buyers: data.buyers,
            sellers: data.sellers,
            brokers: data.brokers,
            items: itemsWithPrices,
        });
        setStep(2);
    }

    function onPaymentSubmit(payments: IPaymentDefinition[]) {
        const finalPayload = { ...orderData, payments } as IOrderPayload;
        mutation.mutate(finalPayload);
    }

    const isLoading = loadingProperties || loadingCustomers || loadingBrokers;
    if (isLoading) return <div>Carregando dados...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Criar Nova Ordem de Venda</CardTitle>
                <CardDescription>
                    {step === 1 ? 'Passo 1 de 2: Informações da Venda' : 'Passo 2 de 2: Detalhes do Pagamento'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-6">
                            <FormField control={form.control} name="orderDate" render={({ field }) => (
                                <FormItem><FormLabel>Data da Ordem</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <FormField control={form.control} name="items" render={({ field }) => (
                                <FormItem><FormLabel>Imóveis</FormLabel>
                                    <MultiSelectCombobox
                                        options={properties?.map(p => ({ value: p._id, label: `${p.title} - R$${p.price.toLocaleString('pt-BR')}` })) || []}
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
                                <Button type="submit">
                                    Próximo
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {step === 2 && (
                    <PaymentStep
                        buyers={customers?.filter(c => orderData.buyers?.includes(c._id)) || []}
                        totalAmount={orderData.items?.reduce((acc, item) => acc + item.price, 0) || 0}
                        onBack={() => setStep(1)}
                        onSubmit={onPaymentSubmit}
                        isLoading={mutation.isPending}
                    />
                )}
            </CardContent>
        </Card>
    );
}