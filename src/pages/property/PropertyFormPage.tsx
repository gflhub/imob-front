// src/pages/PropertyFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProperty, fetchPropertyById, updateProperty, type IPropertyPayload } from '@/services/property.service';
import { fetchCondominiums } from '@/services/condominium.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/shared/Combobox';
import { CondominiumFormModal } from '@/components/condominium/CondominiumFormModal';
import { PlusCircle } from 'lucide-react';


// 1. Definir o schema de validação com Zod
const propertyFormSchema = z.object({
    title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
    description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
    price: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }),
    type: z.enum(['apartment', 'house', 'rural', 'land'], { required_error: "Selecione um tipo." }),
    condition: z.enum(['new', 'used', 'construction'], { required_error: "Selecione uma condição." }),
    bedrooms: z.coerce.number().int().min(0, "Número de quartos inválido.").optional(),
    bathrooms: z.coerce.number().int().min(0, "Número de banheiros inválido.").optional(),
    parkingSpaces: z.coerce.number().int().min(0, "Número de vagas inválido.").optional(),
    area: z.coerce.number().positive("Tamanho em m² inválido.").optional(),
    address: z.object({
        street: z.string().min(3, "Rua inválida."),
        number: z.string().min(1, "Número inválido."),
        complement: z.string().optional(),
        neighborhood: z.string().min(2, "Bairro inválido."),
        city: z.string().min(2, "Cidade inválida."),
        state: z.string().length(2, "Estado inválido (ex: SP)."),
        zip: z.string().length(8, "CEP inválido.")
    }),
    condominiumId: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export function PropertyFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [isCondominiumModalOpen, setIsCondominiumModalOpen] = useState(false);

    const { data: existingProperty, isLoading: isLoadingData } = useQuery({
        queryKey: ['property', id],
        queryFn: () => fetchPropertyById(id!),
        enabled: isEditMode,
    });

    const { data: condominiums, isLoading: isLoadingCondominiums } = useQuery({
        queryKey: ['condominiums'],
        queryFn: fetchCondominiums,
    });

    const form = useForm<PropertyFormData>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            type: "apartment",
            condition: "new",
            bedrooms: 0,
            bathrooms: 0,
            parkingSpaces: 0,
            area: 0,
            address: {
                street: "",
                number: "",
                complement: "",
                neighborhood: "",
                city: "",
                state: "",
                zip: "",
            },
            condominiumId: "",
        },
    });

    const propertyType = form.watch('type');
    const condominiumId = form.watch('condominiumId');

    useEffect(() => {
        if (condominiumId) {
            const selectedCondo = condominiums?.find(c => c._id === condominiumId);
            if (selectedCondo) {
                form.setValue('address', selectedCondo.address);
            }
        }
    }, [condominiumId, condominiums, form]);

    useEffect(() => {
        if (existingProperty) {
            form.reset({
                ...existingProperty,
                type: existingProperty.type as "apartment" | "house" | "rural" | "land",
                condominiumId: existingProperty.condominium?._id || "",
                address: existingProperty.condominium?.address || existingProperty.address,
            });
        }
    }, [existingProperty, form]);

    const createMutation = useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            navigate('/properties');
        },
      });

    const updateMutation = useMutation({
        mutationFn: (data: IPropertyPayload) => updateProperty(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', id] });
            navigate('/properties');
        },
      });

    function onSubmit(data: PropertyFormData) {
        const payload: IPropertyPayload = {
            title: data.title,
            description: data.description,
            price: data.price,
            type: data.type,
            condition: data.condition,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            parkingSpaces: data.parkingSpaces,
            area: data.area,
            address: data.address,
            condominiumId: (data.type === 'apartment' || data.type === 'house') ? data.condominiumId : undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
      }

    if (isLoadingData || isLoadingCondominiums) {
        return <div>Carregando dados do imóvel...</div>;
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}</CardTitle>
                <CardDescription>Preencha os dados abaixo para cadastrar um novo imóvel.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-3">
                                        <FormLabel>Título do Anúncio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Apartamento 2 quartos no centro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="250000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descreva os detalhes do imóvel..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Imóvel</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="apartment">Apartamento</SelectItem>
                                                <SelectItem value="house">Casa</SelectItem>
                                                <SelectItem value="rural">Rural</SelectItem>
                                                <SelectItem value="land">Terreno</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(propertyType === 'apartment' || propertyType === 'house') && (
                                <div className="flex items-end gap-2 md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="condominiumId"
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel>Condomínio</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={condominiums?.map(c => ({ value: c._id, label: c.name })) || []}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Selecione um condomínio"
                                                        notFoundMessage="Nenhum condomínio encontrado."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => setIsCondominiumModalOpen(true)}>
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="condition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Condição</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a condição" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="new">Novo</SelectItem>
                                                <SelectItem value="used">Usado</SelectItem>
                                                <SelectItem value="construction">Em Construção</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bedrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quartos</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bathrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Banheiros</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parkingSpaces"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vagas de Garagem</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tamanho (m²)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <h3 className="text-lg font-semibold mt-6">Endereço</h3>
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
                        <FormField control={form.control} name="address.zip" render={({ field }) => (
                            <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Imóvel')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CondominiumFormModal
                isOpen={isCondominiumModalOpen}
                onClose={() => setIsCondominiumModalOpen(false)}
                onSuccess={(newCondominiumId) => {
                    form.setValue('condominiumId', newCondominiumId, { shouldValidate: true });
                    queryClient.invalidateQueries({ queryKey: ['condominiums'] }); // Invalidate to refetch updated list
                }}
            />
        </Card>
    );
}