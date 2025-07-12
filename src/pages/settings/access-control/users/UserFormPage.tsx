// src/pages/settings/access-control/users/UserFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, fetchUserById, updateUser, fetchRoles, type IUserPayload } from '@/services/user.service';
import { fetchPersons } from '@/services/person.service'; // Assuming a function to fetch all persons

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectCombobox } from '@/components/shared/MultiSelectCombobox';

const userFormSchema = z.object({
    email: z.string().email("Formato de email inválido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").optional().or(z.literal('')),
    person: z.string().min(1, "Selecione uma pessoa."),
    type: z.enum(['user', 'admin'], { required_error: "Selecione um tipo." }),
    roles: z.array(z.string()).optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function UserFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { data: existingUser, isLoading: isLoadingData } = useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUserById(id!),
        enabled: isEditMode,
    });

    const { data: roles, isLoading: loadingRoles } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
    const { data: persons, isLoading: loadingPersons } = useQuery({ queryKey: ['persons'], queryFn: fetchPersons });

    const form = useForm<UserFormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: { email: '', password: '', person: '', type: 'user', roles: [] },
    });

    useEffect(() => {
        if (existingUser) {
            form.reset({
                email: existingUser.email,
                person: existingUser.person?._id,
                type: existingUser.type,
                roles: existingUser.roles.map(r => r._id)
            });
        }
    }, [existingUser, form]);

    const mutation = useMutation({
        mutationFn: (data: IUserPayload) => {
            return isEditMode ? updateUser(id!, data) : createUser(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/settings/access-control');
        },
    });

    function onSubmit(data: UserFormData) {
        const payload: IUserPayload = { ...data };
        if (!payload.password) {
            delete payload.password;
        }
        mutation.mutate(payload);
    }

    if (isLoadingData || loadingRoles || loadingPersons) return <div>Carregando...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="person" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pessoa</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma pessoa" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {persons?.map(person => (
                                            <SelectItem key={person._id} value={person._id}>{person.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
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
                                        <SelectItem value="user">Usuário</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="roles" render={({ field }) => (
                            <FormItem><FormLabel>Papéis</FormLabel>
                                <MultiSelectCombobox
                                    options={roles?.map(r => ({ value: r._id, label: r.name })) || []}
                                    selectedValues={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Selecione os papéis..."
                                /><FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/settings/access-control')}>
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
