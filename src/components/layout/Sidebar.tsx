// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils"; // Utilitário do Shadcn para classes condicionais
import { Button } from '@/components/ui/button';
// Ícones
import { Building, Pin } from 'lucide-react';
import { MENU_ITEMS } from '@/lib/menuItems';

const MOCKED_MENU_ITEMS = MENU_ITEMS;

export function Sidebar() {
    // Estado para controlar se o menu está fixado (pinned)
    const [isPinned, setIsPinned] = useState(false);
    // Estado para controlar se o mouse está sobre o menu
    const [isHovered, setIsHovered] = useState(false);

    // O menu está expandido se estiver fixado OU se o mouse estiver sobre ele
    const isExpanded = isPinned || isHovered;

    return (
        <aside
            className={cn(
                "hidden border-r bg-background md:flex md:flex-col", // flex-col é importante
                "transition-all duration-300 ease-in-out", // Animação suave da largura
                isExpanded ? "w-64" : "w-20" // Largura condicional
            )}
            // Eventos para controlar o hover
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Cabeçalho da Sidebar */}
            <div className="flex h-16 items-center border-b px-6">
                <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Building className="h-6 w-6" />
                    <span
                        className={cn(
                            "transition-opacity duration-200",
                            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                    >
                        SE-Imob
                    </span>
                </Link>

                {/* Botão de Fixar (Pin) - só aparece quando o menu está expandido */}
                <div
                    className={cn(
                        "ml-auto transition-opacity duration-200",
                        isExpanded ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPinned(!isPinned)}
                    >
                        <Pin
                            className={cn(
                                "h-4 w-4 transition-transform duration-300",
                                isPinned && "rotate-45" // Efeito visual quando fixado
                            )}
                        />
                    </Button>
                </div>
            </div>

            {/* Corpo da Sidebar com os itens de menu */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <ul className="space-y-2">
                    {MOCKED_MENU_ITEMS.map((item) => (
                        <li key={item.href}>
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-primary",
                                        isActive && "bg-muted text-primary"
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                <span
                                    className={cn(
                                        "whitespace-nowrap transition-opacity duration-200",
                                        isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}