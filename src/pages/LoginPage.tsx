// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário
import { useAuth } from '@/contexts/AuthContext'; // Nosso hook de autenticação
import api from '@/services/api'; // Nosso serviço de API configurado com Axios

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
    const navigate = useNavigate();
    // Pegamos a função `login` do nosso contexto global
    const { login } = useAuth();

    // Estados locais do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Faz a chamada real para a API NestJS
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            // A resposta da API NestJS, usando nosso defaultResponse,
            // deve ter a seguinte estrutura: { status, message, data: { user, access_token } }
            const responseData = response.data; // Acessa o objeto 'data' da nossa resposta padrão

            if (responseData && responseData.access_token && responseData.user) {
                // Se a chamada for bem-sucedida, chamamos a função 'login' do nosso contexto
                // para salvar o token e os dados do usuário globalmente e no localStorage.
                login(responseData.access_token, responseData.user);

                // Redireciona o usuário para o dashboard
                navigate('/dashboard');
            } else {
                // Caso a resposta da API não venha no formato esperado
                throw new Error('Resposta da API inválida.');
            }
        } catch (err: any) {
            // Captura o erro retornado pela API (ex: "Credenciais inválidas")
            const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro inesperado.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Entre com suas credenciais para acessar o painel SE-Imob.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}