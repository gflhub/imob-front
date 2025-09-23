// src/pages/settings/PaymentSettingsPage.tsx
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings, type ISettings } from '@/services/settings.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

const settingsSchema = z.object({
  paymentPercentage: z.coerce.number().min(0, 'A porcentagem não pode ser negativa.'),
  paymentMethods: z.array(z.object({ value: z.string() })).min(1, 'Deve haver pelo menos um método de pagamento.'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function PaymentSettingsPage() {
  const queryClient = useQueryClient();
  const [newMethod, setNewMethod] = useState('');

  const { data: settings, isLoading } = useQuery<ISettings>({
    queryKey: ['settings'],
    queryFn: fetchSettings
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      paymentPercentage: 0,
      paymentMethods: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "paymentMethods",
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        paymentPercentage: settings.paymentPercentage,
        paymentMethods: Array.isArray(settings.paymentMethods) ? settings.paymentMethods.map(method => ({ value: method })) : [],
      });
    }
  }, [settings, form.reset]);

  const mutation = useMutation({
    mutationFn: (data: SettingsFormData) => {
      const transformedData = {
        ...data,
        paymentMethods: data.paymentMethods.map(method => method.value),
      };
      return updateSettings(transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleAddMethod = () => {
    if (newMethod.trim() !== '') {
      append({ value: newMethod.trim() });
      setNewMethod('');
    }
  };

  const handleRemoveMethod = (index: number) => {
    remove(index);
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Pagamento</CardTitle>
        <CardDescription>Defina a porcentagem de entrada e os métodos de pagamento aceitos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porcentagem de Entrada (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethods"
              render={() => (
                <FormItem>
                  <FormLabel>Métodos de Pagamento</FormLabel>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newMethod}
                      onChange={(e) => setNewMethod(e.target.value)}
                      placeholder="Adicionar novo método"
                    />
                    <Button type="button" onClick={handleAddMethod}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((field, index) => (
                      <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                        {field.value}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveMethod(index)} />
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
