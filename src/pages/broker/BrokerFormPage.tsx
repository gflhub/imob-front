// src/pages/broker/BrokerFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBroker, fetchBrokerById, updateBroker } from '@/services/person.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema de validação com Zod para o formulário de corretor
const commissionRangeSchema = z.object({
    minAmount: z.coerce.number().min(0, "Valor inicial deve ser positivo."),
    maxAmount: z.coerce.number().positive("Valor final deve ser positivo."),
    rate: z.coerce.number().min(0, "Valor da comissão deve ser positivo.").max(100, "Valor da comissão não pode exceder 100%"),
}).refine(data => data.minAmount < data.maxAmount, {
    message: "Valor inicial deve ser menor que o valor final.",
    path: ["minAmount"],
});

const brokerFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Formato de email inválido."),
    phone: z.string().min(10, "Telefone inválido."),
    doc: z.string().min(11, "Documento inválido."),
    birth: z.string().min(8, "Data de nascimento inválida.").optional(),
    commissionRanges: z.array(commissionRangeSchema).optional(),
}).superRefine((data, ctx) => {
    if (data.commissionRanges && data.commissionRanges.length > 1) {
        for (let i = 0; i < data.commissionRanges.length; i++) {
            for (let j = i + 1; j < data.commissionRanges.length; j++) {
                const range1 = data.commissionRanges[i];
                const range2 = data.commissionRanges[j];

                // Check for overlap
                if (
                    (range1.minAmount < range2.maxAmount && range1.maxAmount > range2.minAmount)
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Faixas de comissão se sobrepõem.",
                        path: [`commissionRanges.${j}.minAmount`], // Point to the overlapping range
                    });
                }
            }
        }
    }
});

type BrokerFormData = z.infer<typeof brokerFormSchema>;

export function BrokerFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { data: existingBroker, isLoading: isLoadingData } = useQuery({
        queryKey: ['broker', id],
        queryFn: () => fetchBrokerById(id!),
        enabled: isEditMode,
    });

    const form = useForm<BrokerFormData>({
        resolver: zodResolver(brokerFormSchema),
        defaultValues: {},
    });

    const { fields: commissionRangeFields, append: appendCommissionRange, remove: removeCommissionRange } = useFieldArray({
        control: form.control,
        name: "commissionRanges",
    });

    useEffect(() => {
        if (existingBroker) {
            const transformedRanges = existingBroker.commission?.ranges.map(range => ({
                minAmount: range.minAmount,
                maxAmount: range.maxAmount,
                rate: range.rate * 100, // Convert to percentage
            })) || [];

            form.reset({
                ...existingBroker,
                commissionRanges: transformedRanges,
            });
        }
    }, [existingBroker, form]);

    const mutation = useMutation({
        mutationFn: (data: BrokerFormData) => {
            const dataToSend = {
                ...data,
                commissionRanges: data.commissionRanges?.map(range => ({
                    ...range,
                    rate: range.rate / 100, // Convert back to decimal
                })),
            };
            return isEditMode ? updateBroker(id!, dataToSend) : createBroker(dataToSend);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brokers'] });
            navigate('/brokers');
        },
    });

    if (isLoadingData) return <div>Carregando corretor...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Corretor' : 'Adicionar Novo Corretor'}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-4">
                        <Tabs defaultValue="personal-data" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="personal-data">Dados Pessoais</TabsTrigger>
                                <TabsTrigger value="commission-ranges">Faixas de Comissão</TabsTrigger>
                            </TabsList>
                            <TabsContent value="personal-data">
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
                            </TabsContent>
                            <TabsContent value="commission-ranges">
                                <div className="space-y-4">
                                    {commissionRangeFields.map((field, index) => (
                                        <Card key={field.id} className="p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold">Faixa de Comissão #{index + 1}</h3>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCommissionRange(index)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <FormField control={form.control} name={`commissionRanges.${index}.minAmount`} render={({ field }) => (
                                                <FormItem><FormLabel>Valor Mínimo</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`commissionRanges.${index}.maxAmount`} render={({ field }) => (
                                                <FormItem><FormLabel>Valor Máximo</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`commissionRanges.${index}.rate`} render={({ field }) => (
                                                <FormItem><FormLabel>Taxa de Comissão (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </Card>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => appendCommissionRange({ minAmount: 0, maxAmount: 0, rate: 0 })}
                                    >
                                        Adicionar Faixa de Comissão
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
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