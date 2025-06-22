// src/components/dashboard/QuickActions.tsx
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MENU_ITEMS } from '@/lib/menuItems';

export function QuickActions() {
    // Vamos pular o item "Dashboard" dos atalhos, pois já estamos nele.
    const actionItems = MENU_ITEMS.filter(item => item.href !== '/dashboard');

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {actionItems.map((item) => (
                <Link to={item.href} key={item.href}>
                    <Card className="hover:bg-muted/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    );
}