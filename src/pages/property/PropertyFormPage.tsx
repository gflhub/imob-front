// src/pages/PropertyFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProperty, fetchPropertyById, updateProperty } from '@/services/property.service';

// ... (imports dos componentes Shadcn permanecem os mesmos) ...
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';


// 1. Definir o schema de validação com Zod
const propertyFormSchema = z.object({
    title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
    description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
    price: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }),
    type: z.enum(['apartment', 'house', 'rural', 'land'], { required_error: "Selecione um tipo." }),
    condition: z.enum(['new', 'used', 'construction'], { required_error: "Selecione uma condição." }),
    // Adicione aqui todos os outros campos do seu formulário com suas respectivas validações
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export function PropertyFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>(); // Pega o ID da URL, se existir
    const isEditMode = !!id; // Define se estamos no modo de edição

    // 1. Busca os dados do imóvel se estiver em modo de edição
    const { data: existingProperty, isLoading: isLoadingData } = useQuery({
        queryKey: ['property', id],
        queryFn: () => fetchPropertyById(id!),
        enabled: isEditMode, // SÓ executa a query se houver um ID (modo de edição)
    });

    // 2. Configurar o formulário com React Hook Form e o resolver do Zod
    const form = useForm<PropertyFormData>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
        },
    });

    useEffect(() => {
        if (existingProperty) {
            form.reset({
                ...existingProperty,
                type: existingProperty.type as "apartment" | "house" | "rural" | "land",
            });
        }
    }, [existingProperty, form]);

    // 3. Configurar a "Mutation" para lidar com a submissão para a API
    const createMutation = useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            navigate('/properties');
        },
      });

    const updateMutation = useMutation({
        mutationFn: (data: PropertyFormData) => updateProperty(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', id] }); // Invalida o cache deste imóvel específico
            navigate('/properties');
        },
      });

    // 4. Função que é chamada ao submeter o formulário
    function onSubmit(data: PropertyFormData) {
        if (isEditMode) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
      }

    if (isLoadingData) {
        return <div>Carregando dados do imóvel...</div>;
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    

    return (
        <Card>
            <CardHeader>
                <CardTitle>Adicionar Novo Imóvel</CardTitle>
                <CardDescription>Preencha os dados abaixo para cadastrar um novo imóvel.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* 5. O componente Form do Shadcn integra-se com o React Hook Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>

                        {/* Adicione outros campos (como 'condition') aqui, seguindo o mesmo padrão */}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/properties')}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Imóvel')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}