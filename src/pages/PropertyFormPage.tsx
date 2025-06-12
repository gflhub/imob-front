// src/pages/PropertyFormPage.tsx
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty } from '@/services/property.service';

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

    // 2. Configurar o formulário com React Hook Form e o resolver do Zod
    const form = useForm<PropertyFormData>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
        },
    });

    // 3. Configurar a "Mutation" para lidar com a submissão para a API
    const { mutate, isPending } = useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            // Invalida a query de 'properties' para que a lista seja atualizada na próxima vez que for acessada
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            // Redireciona para a página de listagem
            navigate('/properties');
            // Adicionar uma notificação de sucesso aqui (usando um "Toast" component)
        },
        onError: (error) => {
            // Adicionar uma notificação de erro aqui
            console.error("Erro ao criar imóvel:", error);
        }
    });

    // 4. Função que é chamada ao submeter o formulário
    function onSubmit(data: PropertyFormData) {
        mutate(data); // Executa a mutation com os dados validados do formulário
    }

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

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Salvando...' : 'Salvar Imóvel'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}