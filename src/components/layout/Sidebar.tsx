import { NavLink } from 'react-router-dom';
import { Home, Building, User, FileText, Landmark } from 'lucide-react'; // Ícones
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Lembrete: A API para buscar o menu ainda não existe!
// Usaremos dados mocados por enquanto.
const MOCKED_MENU_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/properties', label: 'Imóveis', icon: Building }, // ROTA ADICIONADA
    { href: '/customers', label: 'Clientes', icon: User },
    { href: '/orders', label: 'Ordens', icon: FileText },
    { href: '/payments', label: 'Pagamentos', icon: Landmark },
  ];

export function Sidebar() {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState(MOCKED_MENU_ITEMS);

    useEffect(() => {
        // TODO: Implementar a chamada à API aqui
        // Lembrete para mim e para você:
        // Precisamos criar um endpoint na API NestJS, por exemplo: GET /api/users/menu
        // que retorne a lista de itens de menu com base nas permissões do usuário logado.

        // const fetchMenu = async () => {
        //   try {
        //     const response = await api.get('/users/menu');
        //     setMenuItems(response.data);
        //   } catch (error) {
        //     console.error("Erro ao buscar itens do menu:", error);
        //     setMenuItems(MOCKED_MENU_ITEMS); // Usa o mock como fallback
        //   }
        // };
        // fetchMenu();
    }, [user]);

    return (
        <aside className="hidden border-r bg-muted/40 md:block w-64">
            <div className="flex flex-col h-full">
                <div className="flex items-center h-16 border-b px-6">
                    <span className="text-lg font-bold">SE-Imob</span>
                </div>
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}