// src/services/payment.service.ts
import api from './api';

// Interface para o DTO de criação
export interface ICreatePaymentPayload {
    orderId: string;
    payments: {
        payerId: string;
        paymentMethod: string;
        totalAmount: number;
        qtdInstallments: number;
        firstDueDate: string;
    }[];
}

// Interface para um pagamento retornado pela API
export interface IPayment {
    _id: string;
    payerId: {
        _id: string;
        name: string;
    };
    paymentMethod: string;
    totalAmount: number;
    installments: {
        installment: number;
        amount: number;
        dueDate: string;
        status: string;
    }[];
}

// Interface para uma parcela individual, como retornada pela nova API
export interface IInstallment {
    _id: string;
    orderId: string;
    payer: {
        _id: string;
        name: string;
    };
    dueDate: string;
    amount: number;
    status: 'pending' | 'overdue' | 'paid';
}

// Interface para o resumo do caixa
export interface ICashierSummary {
    dueToday: { count: number; total: number };
    overdue: { count: number; total: number };
    paidToday: { count: number; total: number };
}

export const fetchPaymentsForOrder = async (orderId: string): Promise<IPayment[]> => {
    const response = await api.get(`/payment/order/${orderId}`);
    return response.data;
};

export const createPayments = async (data: ICreatePaymentPayload): Promise<IPayment[]> => {
    const response = await api.post('/payment', data);
    return response.data;
};

export const fetchInstallments = async (customerName?: string): Promise<IInstallment[]> => {
    const response = await api.get('/payment/installments', {
        params: { customerName: customerName || undefined },
    });
    return response.data.data;
};

// Busca os dados para os cards de resumo
export const fetchCashierSummary = async (): Promise<ICashierSummary> => {
    const response = await api.get('/payment/cashier/summary');
    return response.data.data;
}

// Realiza o recebimento de uma parcela
export const receiveInstallment = async (installmentId: string, paymentDate: string): Promise<IInstallment> => {
    const response = await api.patch(`/payment/installments/${installmentId}/receive`, {
        paymentDate,
    });
    return response.data.data;
};