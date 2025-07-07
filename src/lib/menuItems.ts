// src/lib/menuItems.ts
import { Home, Building, Users, FileText, Settings, DollarSign } from 'lucide-react';

export const MENU_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/properties', label: 'Imóveis', icon: Building },
    { href: '/customers', label: 'Clientes', icon: Users },
    { href: '/brokers', label: 'Corretores', icon: Users },
    { href: '/orders', label: 'Ordens', icon: FileText },
    { href: '/cashier', label: 'Financeiro', icon: DollarSign }, // Adiciona a nova rota
    { href: '/settings', label: 'Configurações', icon: Settings },
];