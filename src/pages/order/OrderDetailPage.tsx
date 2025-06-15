// src/pages/order/OrderDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderById, type IOrder } from '@/services/order.service';
import { fetchPaymentsForOrder, type IPayment } from '@/services/payment.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';

function OrderDetails({ order }: { order: IOrder }) {
    // Componente interno para mostrar os detalhes da ordem
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Detalhes da Ordem</CardTitle>
                <CardDescription>
                    Data: {new Date(order.orderDate).toLocaleDateString()} - Status: <Badge>{order.orderStatus}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}</p>
                {/* Adicione mais detalhes da ordem aqui (compradores, imóveis, etc.) */}
            </CardContent>
        </Card>
    );
}

function PaymentsList({ payments }: { payments?: IPayment[] }) {
    // Componente interno para listar os planos de pagamento
    return (
        <Card>
            <CardHeader>
                <CardTitle>Planos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
                {payments && payments.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pagador</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map(payment => (
                                <TableRow key={payment._id}>
                                    <TableCell>{payment.payerId.name}</TableCell>
                                    <TableCell>{payment.paymentMethod}</TableCell>
                                    <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.totalAmount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p>Nenhum plano de pagamento cadastrado para esta ordem.</p>
                )}
            </CardContent>
        </Card>
    );
}

export function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();

    // Busca os detalhes da ordem
    const { data: order, isLoading: loadingOrder } = useQuery({
        queryKey: ['order', id],
        queryFn: () => fetchOrderById(id!),
        enabled: !!id,
    });

    // Busca os pagamentos para esta ordem
    const { data: payments, isLoading: loadingPayments } = useQuery({
        queryKey: ['payments', id],
        queryFn: () => fetchPaymentsForOrder(id!),
        enabled: !!id,
    });

    if (loadingOrder || loadingPayments) return <div>Carregando detalhes da ordem...</div>;
    if (!order) return <div>Ordem não encontrada.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Ordem #{order._id.substring(0, 8)}</h1>
                <Link to={`/orders/${id}/add-payment`}>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Adicionar Plano de Pagamento
                    </Button>
                </Link>
            </div>

            <OrderDetails order={order} />
            <PaymentsList payments={payments} />
        </div>
    );
}