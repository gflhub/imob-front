// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/main/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/main/DashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyListPage } from './pages/property/PropertyListPage';
import { PropertyFormPage } from './pages/property/PropertyFormPage';
import { CompanyListPage } from './pages/company/CompanyListPage';
import { CustomerListPage } from './pages/customer/CustomerListPage';
import { CustomerFormPage } from './pages/customer/CustomerFormPage';

import { OrderListPage } from './pages/order/OrderListPage';
import { OrderFormPage } from './pages/order/OrderFormPage';
import { OrderDetailPage } from './pages/order/OrderDetailPage';
import { PaymentFormPage } from './pages/payment/PaymentFormPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { CashierPage } from './pages/cashier/CashierPage';
import { BrokerListPage } from './pages/broker/BrokerListPage';
import { BrokerFormPage } from './pages/broker/BrokerFormPage';
import { CommissionListPage } from './pages/commission/CommissionListPage';
import { CommissionFormPage } from './pages/commission/CommissionFormPage';



import { AccessControlPage } from './pages/settings/access-control/AccessControlPage';
import { UserFormPage } from './pages/settings/access-control/users/UserFormPage';
import { RoleFormPage } from './pages/settings/access-control/roles/RoleFormPage';

const queryClient = new QueryClient();

// Componente para lidar com a rota raiz "/"
function Root() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Carregando aplicação...</div>;
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/brokers" element={<BrokerListPage />} />
            <Route path="/brokers/new" element={<BrokerFormPage />} />
            <Route path="/brokers/edit/:id" element={<BrokerFormPage />} />
            <Route path="/brokers/:brokerId/commissions" element={<CommissionListPage />} />
            <Route path="/brokers/:brokerId/commissions/new" element={<CommissionFormPage />} />
            <Route path="/brokers/:brokerId/commissions/edit/:id" element={<CommissionFormPage />} />
            <Route path="/properties" element={<PropertyListPage />} />
            <Route path="/properties/new" element={<PropertyFormPage />} />
            <Route path="/properties/edit/:id" element={<PropertyFormPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/edit/:id" element={<CustomerFormPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/new" element={<OrderFormPage />} />  
            <Route path="/orders/view/:id" element={<OrderDetailPage />} />
            <Route path="/orders/:id/add-payment" element={<PaymentFormPage />} />
            <Route path="/payments" element={<PaymentFormPage />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            <Route path="/settings/company" element={<CompanyListPage />} />
            <Route path="/settings/access-control" element={<AccessControlPage />} />
            <Route path="/settings/access-control/users/new" element={<UserFormPage />} />
            <Route path="/settings/access-control/users/edit/:id" element={<UserFormPage />} />
            <Route path="/settings/access-control/roles/new" element={<RoleFormPage />} />
            <Route path="/settings/access-control/roles/edit/:id" element={<RoleFormPage />} />
            {/* <Route path="/settings/company/new" element={<CompanyFormPage />} />
            <Route path="/settings/company/edit/:id" element={<CompanyFormPage />} /> */}

          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    // Envolva o AuthProvider com o QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}