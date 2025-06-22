// src/components/cashier/ReceiptModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type IInstallment } from '@/services/payment.service';
import { Printer } from 'lucide-react';

interface Props {
    installment: IInstallment | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ReceiptModal({ installment, isOpen, onClose }: Props) {

    const handlePrint = () => {
        window.print(); // Aciona a caixa de diálogo de impressão do navegador
    };

    if (!installment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="printable-area">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Comprovante de Pagamento</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-3 text-sm">
                    <p><strong>Recebemos de:</strong> {installment.payer.name}</p>
                    <p><strong>Referente à ordem:</strong> #{installment.orderId.substring(0, 8).toUpperCase()}</p>
                    <hr className="my-4" />
                    <p><strong>Valor Pago:</strong> <span className="text-lg font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.amount)}</span></p>
                    <p><strong>Data do Pagamento:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <DialogFooter className="non-printable">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                    <Button onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" />
                        Imprimir
                    </Button>
                </DialogFooter>
            </DialogContent>
            <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .printable-area, .printable-area * {
                visibility: visible;
              }
              .printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .non-printable {
                  display: none;
              }
            }
          `}</style>
        </Dialog>
    );
}