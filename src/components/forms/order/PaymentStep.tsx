// src/components/forms/order/PaymentStep.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import type { IPaymentDefinition } from '@/services/order.service';
import { fetchSettings } from '@/services/settings.service';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentStepProps {
    buyers: { _id: string; name: string }[];
    totalAmount: number;
    isLoading: boolean;
    onBack: () => void;
    onSubmit: (data: IPaymentDefinition[]) => void;
}

const paymentSchema = z.object({
    payerId: z.string().min(1, 'Selecione um pagador.'),
    paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório.'),
    totalAmount: z.coerce.number().min(0.01, 'O valor deve ser positivo.'),
    qtdInstallments: z.coerce.number().int().min(1, 'Pelo menos uma parcela é necessária.'),
    firstDueDate: z.string().min(1, 'A data de vencimento é obrigatória.'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentStep({ buyers, totalAmount, isLoading, onBack, onSubmit }: PaymentStepProps) {
    const { data: settings, isLoading: isLoadingSettings } = useQuery({ 
        queryKey: ['settings'], 
        queryFn: fetchSettings 
    });

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
    });

    useEffect(() => {
        if (settings) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            form.reset({
                paymentMethod: settings.paymentMethods[0]?.value || '',
                qtdInstallments: 1,
                firstDueDate: dueDate.toISOString().split('T')[0],
                totalAmount: totalAmount * (settings.paymentPercentage / 100),
            });
        }
    }, [settings, totalAmount, form]);

    function handleFormSubmit(data: PaymentFormData) {
        onSubmit([data]);
    }

    if (isLoadingSettings) return <div>Carregando configurações...</div>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="payerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pagador</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o comprador responsável pelo pagamento" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {buyers.map(buyer => (
                                        <SelectItem key={buyer._id} value={buyer._id}>
                                            {buyer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="totalAmount" render={({ field }) => (
                    <FormItem><FormLabel>Valor da Entrada</FormLabel><FormControl><Input type="number" {...field} readOnly/></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="qtdInstallments" render={({ field }) => (
                    <FormItem><FormLabel>Quantidade de Parcelas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="firstDueDate" render={({ field }) => (
                    <FormItem><FormLabel>Data do Primeiro Vencimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Método de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o método de pagamento" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {settings?.paymentMethods.map(method => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                        Voltar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Criando Ordem...' : 'Criar Ordem'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
