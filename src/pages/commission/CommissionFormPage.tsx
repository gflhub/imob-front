// src/pages/commission/CommissionFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCommission, fetchCommissionById, updateCommission } from '@/services/commission.service';
import { fetchBrokers } from '@/services/person.service';
import { fetchOrders } from '@/services/order.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema de validação com Zod para o formulário de comissão
const commissionFormSchema = z.object({
    brokerId: z.string().min(1, "Selecione um corretor."),
    orderId: z.string().min(1, "Selecione uma ordem."),
    amount: z.coerce.number().positive("O valor deve ser positivo."),
    commissionDate: z.string().min(1, "A data é obrigatória."),
    status: z.enum(['pending', 'paid'], { required_error: "Selecione um status." }),
});

type CommissionFormData = z.infer<typeof commissionFormSchema>;

export function CommissionFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { brokerId, id } = useParams<{ brokerId: string, id: string }>();
    const isEditMode = !!id;

    const { data: existingCommission, isLoading: isLoadingData } = useQuery({
        queryKey: ['commission', id],
        queryFn: () => fetchCommissionById(id!),
        enabled: isEditMode,
    });

    const { data: brokers, isLoading: loadingBrokers } = useQuery({
        queryKey: ['brokers'],
        queryFn: fetchBrokers,
    });

    const { data: orders, isLoading: loadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    });

    const form = useForm<CommissionFormData>({
        resolver: zodResolver(commissionFormSchema),
        defaultValues: { brokerId: brokerId || '', orderId: '', amount: 0, commissionDate: new Date().toISOString().split('T')[0], status: 'pending' },
    });

    useEffect(() => {
        if (existingCommission) {
            form.reset(existingCommission);
        }
    }, [existingCommission, form]);

    const mutation = useMutation({
        mutationFn: (data: CommissionFormData) => {
            return isEditMode ? updateCommission(id!, data) : createCommission(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['commissions', brokerId] });
            navigate(`/brokers/${brokerId}/commissions`);
        },
    });

    if (isLoadingData || loadingBrokers || loadingOrders) return <div>Carregando formulário de comissão...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Comissão' : 'Adicionar Nova Comissão'}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-4">
                        <FormField control={form.control} name="brokerId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Corretor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!brokerId}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um corretor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {brokers?.map(broker => (
                                            <SelectItem key={broker._id} value={broker._id}>{broker.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="orderId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ordem de Venda</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma ordem" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {orders?.map(order => (
                                            <SelectItem key={order._id} value={order._id}>{`#${order._id.substring(0, 8)} - ${order.buyers[0]?.name || 'N/A'}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Valor da Comissão</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="commissionDate" render={({ field }) => (
                            <FormItem><FormLabel>Data da Comissão</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

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
