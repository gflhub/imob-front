import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { CircleUser, Search } from "lucide-react"; // Ícones do shadcn

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="flex items-center h-16 px-6 border-b bg-white">
            <div className="text-lg font-semibold">
                {user?.company?.name || 'Minha Empresa'}
            </div>
            <div className="flex items-center w-full gap-4 mx-auto max-w-sm">
                <form className="flex-1 ml-auto sm:flex-initial">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Buscar funcionalidades..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" />
                    </div>
                </form>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full ml-auto">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.name || 'Meu Perfil'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}