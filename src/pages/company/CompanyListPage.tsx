// src/pages/CompanyListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies } from '@/services/company.service';
import { Link } from 'react-router-dom';
import { Building, Mail, Phone, Hash, MapPin, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';


function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) {
    return (
        <div className="flex items-center text-sm">
            <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-semibold mr-2">{label}:</span>
            <span className="text-muted-foreground">{value || 'Não informado'}</span>
        </div>
    );
}

export function CompanyListPage() {
    const { data: company, isLoading, isError } = useQuery({
        queryKey: ['companies'],
        queryFn: fetchCompanies,
    });

    const {user} = useAuth();

    console.log('user ', user)

    if (isLoading) {
        return (<Card>
            Carregando empresas...
        </Card>);
    }
    if (isError) {
        return (<Card>
            Sem dados para exibir
        </Card>);
    }
    return (
        <>
            {company && (
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-6 w-6" />
                                {company.name}
                            </CardTitle>
                            <CardDescription>Visualize as informações da sua empresa.</CardDescription>
                        </div>

                        <Link to={`/settings/company/edit`}> {/* Rota para edição */}
                            <Button variant="outline" size="sm" className="gap-1">
                                <Edit className="h-3.5 w-3.5" />
                                Editar
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <DetailItem icon={Hash} label="CNPJ" value={company.cnpj} />
                            <DetailItem icon={Mail} label="Email" value={company.email} />
                            <DetailItem icon={Phone} label="Telefone" value={company.phone} />
                            <DetailItem icon={MapPin} label="Endereço" value={`${company.address.street}, ${company.address.number} - ${company.address.city}, ${company.address.state}`} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}