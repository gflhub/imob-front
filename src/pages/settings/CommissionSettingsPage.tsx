// src/pages/settings/CommissionSettingsPage.tsx
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBrokers, fetchBrokerById, updateBroker } from '@/services/person.service';
import { useNavigate } from 'react-router-dom';

import { Combobox } from '@/components/shared/Combobox';
import { MultiSelectCombobox } from '@/components/shared/MultiSelectCombobox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash } from 'lucide-react';

// --- Schemas ---
const commissionRangeSchema = z.object({
    minAmount: z.coerce.number().min(0, "Valor inicial deve ser positivo."),
    maxAmount: z.coerce.number().positive("Valor final deve ser positivo."),
    rate: z.coerce.number().min(0, "Valor da comissão deve ser positivo.").max(100, "Valor da comissão não pode exceder 100%"),
}).refine(data => data.minAmount < data.maxAmount, {
    message: "Valor inicial deve ser menor que o valor final.",
    path: ["minAmount"],
});

const commissionFormSchema = z.object({
    brokerId: z.string().min(1, "Selecione um corretor."),
    commissionRanges: z.array(commissionRangeSchema).optional(),
});

const bulkCommissionFormSchema = z.object({
    brokerIds: z.array(z.string()).min(1, "Selecione pelo menos um corretor."),
    commissionRanges: z.array(commissionRangeSchema).optional(),
});

type CommissionFormData = z.infer<typeof commissionFormSchema>;
type BulkCommissionFormData = z.infer<typeof bulkCommissionFormSchema>;

export function CommissionSettingsPage() {
    const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // --- Data Fetching ---
    const { data: brokers } = useQuery({ queryKey: ['brokers'], queryFn: fetchBrokers });
    const { data: selectedBroker, isLoading: loadingBrokerData } = useQuery({
        queryKey: ['broker', selectedBrokerId],
        queryFn: () => fetchBrokerById(selectedBrokerId!),
        enabled: !!selectedBrokerId,
    });

    // --- Individual Form ---
    const individualForm = useForm<CommissionFormData>({
        resolver: zodResolver(commissionFormSchema),
        defaultValues: { brokerId: '', commissionRanges: [] },
    });
    const { fields: individualFields, append: appendIndividual, remove: removeIndividual } = useFieldArray({ control: individualForm.control, name: "commissionRanges" });

    useEffect(() => {
        if (selectedBroker) {
            const transformedRanges = selectedBroker.commission?.ranges.map(r => ({ ...r, rate: r.rate * 100 })) || [];
            individualForm.reset({ brokerId: selectedBroker._id, commissionRanges: transformedRanges });
        } else {
            individualForm.reset({ brokerId: selectedBrokerId || '', commissionRanges: [] });
        }
    }, [selectedBroker, individualForm, selectedBrokerId]);

    const individualMutation = useMutation({
        mutationFn: (data: CommissionFormData) => updateBroker(data.brokerId, { commissionRanges: data.commissionRanges }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brokers'] });
            queryClient.invalidateQueries({ queryKey: ['broker', selectedBrokerId] });
            alert('Comissões salvas com sucesso!');
        },
        onError: (error) => alert(`Erro ao salvar comissões: ${error.message}`),
    });

    // --- Bulk Form ---
    const bulkForm = useForm<BulkCommissionFormData>({ resolver: zodResolver(bulkCommissionFormSchema), defaultValues: { brokerIds: [], commissionRanges: [] } });
    const { fields: bulkFields, append: appendBulk, remove: removeBulk } = useFieldArray({ control: bulkForm.control, name: "commissionRanges" });

    const bulkMutation = useMutation({
        mutationFn: async (data: BulkCommissionFormData) => {
            const { brokerIds, commissionRanges } = data;
            const updatePromises = brokerIds.map(brokerId => updateBroker(brokerId, { commissionRanges }));
            return Promise.all(updatePromises);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brokers'] });
            data.forEach(broker => queryClient.invalidateQueries({ queryKey: ['broker', broker._id] }));
            alert('Comissões atualizadas em massa com sucesso!');
            bulkForm.reset();
        },
        onError: (error) => alert(`Erro ao atualizar comissões em massa: ${error.message}`),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Regras de Comissão</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
            </div>

            <Tabs defaultValue="individual">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual">Edição Individual</TabsTrigger>
                    <TabsTrigger value="bulk">Edição em Massa</TabsTrigger>
                </TabsList>

                {/* Individual Edit Tab */}
                <TabsContent value="individual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selecione um Corretor</CardTitle>
                            <CardDescription>Defina as faixas de comissão para cada corretor individualmente.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Combobox
                                options={brokers?.map(b => ({ value: b._id, label: b.name })) || []}
                                value={selectedBrokerId || ''}
                                onChange={(value) => { setSelectedBrokerId(value); individualForm.setValue('brokerId', value); }}
                                placeholder="Selecione um corretor..."
                            />
                            {loadingBrokerData && <p>Carregando comissões...</p>}
                            {selectedBrokerId && !loadingBrokerData && (
                                <Form {...individualForm}>
                                    <form onSubmit={individualForm.handleSubmit(data => individualMutation.mutate(data))} className="space-y-4">
                                        {/* Accordion for ranges */}
                                        <Accordion type="single" collapsible className="w-full" defaultValue='item-0'>
                                            {individualFields.map((field, index) => (
                                                <Card key={field.id} className="w-full">
                                                    <CardContent>
                                                        <AccordionItem value={`item-${index}`} key={field.id} className="w-full">
                                                            <AccordionTrigger>{`Faixa #${index + 1}: R$ ${field.minAmount} - R$ ${field.maxAmount} (${field.rate}%)`}</AccordionTrigger>
                                                            <AccordionContent className="p-4">
                                                                <div className="flex items-end w-full gap-4">
                                                                    <FormField control={individualForm.control} name={`commissionRanges.${index}.minAmount`} render={({ field }) => (<FormItem className="w-[30%]"><FormLabel>Mínimo</FormLabel><FormControl><Input type="number" className="w-full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={individualForm.control} name={`commissionRanges.${index}.maxAmount`} render={({ field }) => (<FormItem className="w-[30%]"><FormLabel>Máximo</FormLabel><FormControl><Input type="number" className="w-full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={individualForm.control} name={`commissionRanges.${index}.rate`} render={({ field }) => (<FormItem className="w-[30%]"><FormLabel>Taxa (%)</FormLabel><FormControl><Input type="number" className="w-full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeIndividual(index)}><Trash className="h-4 w-4" /></Button>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Accordion>
                                        <div className='flex justify-between'>
                                            <Button type="button" variant="outline" onClick={() => appendIndividual({ minAmount: 0, maxAmount: 0, rate: 0 })}>Adicionar Faixa</Button>
                                            <Button type="submit" disabled={individualMutation.isPending}>{individualMutation.isPending ? 'Salvando...' : 'Salvar Comissões'}</Button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Edit Tab */}
                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edição de Comissões em Massa</CardTitle>
                            <CardDescription>Selecione múltiplos corretores e aplique as mesmas regras de comissão para todos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...bulkForm}>
                                <form onSubmit={bulkForm.handleSubmit(data => bulkMutation.mutate(data))} className="space-y-6">
                                    <FormField
                                        control={bulkForm.control}
                                        name="brokerIds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Selecione os Corretores</FormLabel>
                                                <MultiSelectCombobox
                                                    options={brokers?.map(b => ({ value: b._id, label: b.name })) || []}
                                                    selectedValues={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Selecione os corretores..."
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <h3 className="text-md font-medium">Faixas de Comissão a serem aplicadas</h3>
                                    <Accordion type="single" collapsible className="w-full" defaultValue='item-0'>
                                        {bulkFields.map((field, index) => (
                                            <Card key={field.id} className="w-full">
                                                <CardContent>
                                                    <AccordionItem value={`item-${index}`} key={field.id} className="w-full">
                                                        <AccordionTrigger>{`Faixa #${index + 1}: R$ ${field.minAmount} - R$ ${field.maxAmount} (${field.rate}%)`}</AccordionTrigger>
                                                        <AccordionContent className="p-4">
                                                            <div className="flex items-end w-full gap-4">
                                                                <FormField control={bulkForm.control} name={`commissionRanges.${index}.minAmount`} render={({ field }) => (<FormItem className="w-[30%]"><FormLabel>Mínimo</FormLabel><FormControl><Input type="number" className="w-full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                <FormField control={bulkForm.control} name={`commissionRanges.${index}.maxAmount`} render={({ field }) => (<FormItem className="w-[30%]"><FormLabel>Máximo</FormLabel><FormControl><Input type="number" className="w-full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                <FormField control={bulkForm.control} name={`commissionRanges.${index}.rate`} render={({ field }) => (<FormItem className="w-[30%]"><FormLabel>Taxa (%)</FormLabel><FormControl><Input type="number" className="w-full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeBulk(index)}><Trash className="h-4 w-4" /></Button>
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Accordion>
                                    <div className='flex justify-between'>
                                        <Button type="button" variant="outline" onClick={() => appendBulk({ minAmount: 0, maxAmount: 0, rate: 0 })}>Adicionar Faixa</Button>
                                        <Button type="submit" disabled={bulkMutation.isPending}>{bulkMutation.isPending ? 'Aplicando...' : 'Aplicar para Todos Selecionados'}</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
