// src/pages/settings/SettingsPage.tsx
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, Building, Users, Target, ShieldCheck, Percent } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsPage() {
    const { user } = useAuth();

    const settingsItems = [
        {
            title: 'Dados da Empresa',
            description: 'Visualize e edite as informações da sua empresa.',
            href: '/settings/company',
            icon: Building,
        },
        {
            title: 'Gerenciar Corretores',
            description: 'Adicione, edite ou desative corretores.',
            href: '/brokers',
            icon: Users,
        },
        {
            title: 'Controle de Acesso',
            description: 'Gerencie usuários, papéis e permissões do sistema.',
            href: '/settings/access-control',
            icon: ShieldCheck,
            adminOnly: true,
        },
        {
            title: 'Regras de Comissão',
            description: 'Defina as faixas de comissão para os corretores.',
            href: '/settings/commissions',
            icon: Percent,
        },
        {
            title: 'Metas e Comissões',
            description: 'Defina as metas de venda e as regras de comissionamento.',
            href: '#', // Link desabilitado por enquanto
            icon: Target,
            disabled: true,
        },
    ];

    const availableItems = settingsItems.filter(item => !item.adminOnly || user?.type === 'admin');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações gerais da sua conta e empresa.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableItems.map((item) => (
                    <Link key={item.title} to={item.href} className={item.disabled ? 'pointer-events-none' : ''}>
                        <Card className={`h-full flex flex-col hover:border-primary transition-colors ${item.disabled ? 'bg-muted/50' : ''}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <item.icon className="h-6 w-6" />
                                    <span>{item.title}</span>
                                </CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow"></CardContent>
                            <div className="flex justify-end p-4">
                                <ArrowRight className={`h-5 w-5 ${item.disabled ? 'text-muted-foreground' : 'text-primary'}`} />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
