// src/components/condominium/CondominiumFormModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCondominium, type ICondominiumPayload } from '@/services/condominium.service';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const condominiumFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    monthlyFees: z.coerce.number().positive("O valor mensal deve ser positivo."),
    description: z.string().optional(),
    type: z.enum(['building', 'subdivision'], { required_error: "Selecione um tipo." }),
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

type CondominiumFormData = z.infer<typeof condominiumFormSchema>;

interface CondominiumFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (condominiumId: string) => void;
}

export function CondominiumFormModal({ isOpen, onClose, onSuccess }: CondominiumFormModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<CondominiumFormData>({
        resolver: zodResolver(condominiumFormSchema),
        defaultValues: {
            name: '',
            monthlyFees: 0,
            description: '',
            type: 'building',
            address: {
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                zip: '',
            }
        },
    });

    const mutation = useMutation({
        mutationFn: (data: ICondominiumPayload) => createCondominium(data),
        onSuccess: (newCondominium) => {
            queryClient.invalidateQueries({ queryKey: ['condominiums'] });
            onSuccess(newCondominium._id);
            onClose();
            form.reset();
        },
        onError: (error) => {
            console.error("Erro ao criar condomínio:", error);
            alert("Erro ao criar condomínio. Verifique o console para mais detalhes.");
        }
    });

    useEffect(() => {
        if (!isOpen) {
            form.reset(); // Reset form when modal closes
        }
    }, [isOpen, form]);

    const onSubmit = (data: CondominiumFormData) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] sm:max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Condomínio</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
                        <div className="overflow-scroll space-y-4 sm:max-h-[60vh] overflow-x-hidden p-1">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nome do Condomínio</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="monthlyFees" render={({ field }) => (
                                <FormItem><FormLabel>Valor Mensal (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="building">Edifício</SelectItem>
                                            <SelectItem value="subdivision">Loteamento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <h3 className="text-lg font-semibold mt-6">Endereço</h3>
                            <FormField control={form.control} name="address.street" render={({ field }) => (
                                <FormItem><FormLabel>Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="address.number" render={({ field }) => (
                                    <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="address.complement" render={({ field }) => (
                                    <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="address.neighborhood" render={({ field }) => (
                                <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="address.city" render={({ field }) => (
                                    <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="address.state" render={({ field }) => (
                                    <FormItem><FormLabel>Estado (UF)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="address.zip" render={({ field }) => (
                                    <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Salvando...' : 'Salvar Condomínio'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
