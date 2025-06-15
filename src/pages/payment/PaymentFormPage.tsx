// src/pages/payment/PaymentFormPage.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayments, ICreatePaymentPayload } from '@/services/payment.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash } from 'lucide-react';

const paymentFormSchema = z.object({
    payments: z.array(z.object({
        payerId: z.string().min(1, "Selecione um pagador."),
        paymentMethod: z.string().min(3, "Método de pagamento é obrigatório."),
        totalAmount: z.coerce.number().positive("O valor deve ser positivo."),
        qtdInstallments: z.coerce.number().int().min(1, "Mínimo de 1 parcela."),
        firstDueDate: z.string().min(1, "Data de vencimento é obrigatória."),
    })).min(1, "Adicione pelo menos um plano de pagamento."),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function PaymentFormPage() {
    const { id: orderId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: { payments: [] },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "payments",
    });

    const mutation = useMutation({
        mutationFn: (data: ICreatePaymentPayload) => createPayments(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', orderId] });
            navigate(`/orders/view/${orderId}`);
        },
    });

    const onSubmit = (data: PaymentFormData) => {
        mutation.mutate({ orderId: orderId!, payments: data.payments });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Adicionar Pagamentos à Ordem #{orderId?.substring(0, 8)}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <Card key={field.id} className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold">Plano de Pagamento #{index + 1}</h3>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* Aqui você adicionaria os campos do formulário para cada item do array */}
                                    {/* Exemplo: <FormField control={form.control} name={`payments.${index}.payerId`} render={...} /> */}
                                    <p>Formulário para o plano de pagamento iria aqui (Payer ID, Método, Valor, etc.).</p>
                                </Card>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ payerId: '', paymentMethod: '', totalAmount: 0, qtdInstallments: 1, firstDueDate: '' })}
                        >
                            Adicionar outro plano de pagamento
                        </Button>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Salvando...' : 'Salvar Pagamentos'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}