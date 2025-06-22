// src/components/cashier/InstallmentsTable.tsx
import { useState } from 'react';
import { type IInstallment } from '@/services/payment.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReceivePaymentModal } from './ReceivePaymentModal';

export function InstallmentsTable({ installments }: { installments: IInstallment[] }) {
    const [selectedInstallment, setSelectedInstallment] = useState<IInstallment | null>(null);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {installments.map(item => (
                        <TableRow key={item._id}>
                            <TableCell className="font-medium">{item.payer.name}</TableCell>
                            <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant={item.status === 'overdue' ? 'destructive' : 'outline'}>{item.status}</Badge></TableCell>
                            <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}</TableCell>
                            <TableCell className="text-center">
                                <Button size="sm" onClick={() => setSelectedInstallment(item)}>Receber</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* O Modal de Recebimento */}
            <ReceivePaymentModal
                installment={selectedInstallment}
                isOpen={!!selectedInstallment}
                onClose={() => setSelectedInstallment(null)}
            />
        </>
    );
}