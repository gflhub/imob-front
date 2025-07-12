// src/pages/settings/access-control/roles/RoleFormPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRole, fetchRoleById, updateRole, fetchPermissions } from '@/services/user.service';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from '@/components/shared/MultiSelectCombobox';

const roleFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    permissions: z.array(z.string()).min(1, "Selecione pelo menos uma permissão."),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

export function RoleFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { data: existingRole, isLoading: isLoadingData } = useQuery({
        queryKey: ['role', id],
        queryFn: () => fetchRoleById(id!),
        enabled: isEditMode,
    });

    const { data: permissions, isLoading: loadingPermissions } = useQuery({ queryKey: ['permissions'], queryFn: fetchPermissions });

    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: { name: '', permissions: [] },
    });

    useEffect(() => {
        if (existingRole) {
            form.reset({
                name: existingRole.name,
                permissions: existingRole.permissions.map(p => p._id)
            });
        }
    }, [existingRole, form]);

    const mutation = useMutation({
        mutationFn: (data: { name: string, permissions: string[] }) => {
            return isEditMode ? updateRole(id!, data) : createRole(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/settings/access-control');
        },
    });

    if (isLoadingData || loadingPermissions) return <div>Carregando...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Papel' : 'Adicionar Novo Papel'}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome do Papel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="permissions" render={({ field }) => (
                            <FormItem><FormLabel>Permissões</FormLabel>
                                <MultiSelectCombobox
                                    options={permissions?.map(p => ({ value: p._id, label: p.name })) || []}
                                    selectedValues={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Selecione as permissões..."
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
