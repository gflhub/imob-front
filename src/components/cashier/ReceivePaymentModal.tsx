// src/components/cashier/ReceivePaymentModal.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type IInstallment, receiveInstallment } from '@/services/payment.service';
import { useState } from 'react';
import { ReceiptModal } from './ReceiptModal';

interface Props {
    installment: IInstallment | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ReceivePaymentModal({ installment, isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const [paidInstallment, setPaidInstallment] = useState<IInstallment | null>(null);

    const mutation = useMutation({
        mutationFn: (paymentDate: string) => receiveInstallment(installment!._id, paymentDate),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['installments'] });
            queryClient.invalidateQueries({ queryKey: ['cashierSummary'] });
            onClose(); // Fecha o modal de pagamento
            setPaidInstallment(data); // Abre o modal de recibo
        },
        onError: (error) => {
            alert(`Erro ao receber pagamento: ${error.message}`);
        }
    });

    const handleConfirmPayment = () => {
        // Por simplicidade, usamos a data de hoje. Poderíamos ter um DatePicker aqui.
        const paymentDate = new Date().toISOString();
        mutation.mutate(paymentDate);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Recebimento</DialogTitle>
                        <DialogDescription>
                            Você está prestes a confirmar o recebimento do título abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p><strong>Cliente:</strong> {installment?.payer.name}</p>
                        <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment?.amount || 0)}</p>
                        <p><strong>Vencimento:</strong> {installment ? new Date(installment.dueDate).toLocaleDateString() : ''}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleConfirmPayment} disabled={mutation.isPending}>
                            {mutation.isPending ? "Confirmando..." : "Confirmar Recebimento"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Recibo */}
            <ReceiptModal
                installment={paidInstallment}
                isOpen={!!paidInstallment}
                onClose={() => setPaidInstallment(null)}
            />
        </>
    );
}