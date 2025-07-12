// src/pages/settings/access-control/AccessControlPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserListPage } from './users/UserListPage';
import { RoleListPage } from './roles/RoleListPage';
import { PermissionListPage } from './permissions/PermissionListPage';

export function AccessControlPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Controle de Acesso</h1>
                <p className="text-muted-foreground">Gerencie usuários, papéis e permissões do sistema.</p>
            </div>
            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="roles">Papéis</TabsTrigger>
                    <TabsTrigger value="permissions">Permissões</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <UserListPage />
                </TabsContent>
                <TabsContent value="roles">
                    <RoleListPage />
                </TabsContent>
                <TabsContent value="permissions">
                    <PermissionListPage />
                </TabsContent>
            </Tabs>
        </div>
    );
}
