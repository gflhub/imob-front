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

export const fetchPaymentsForOrder = async (orderId: string): Promise<IPayment[]> => {
    const response = await api.get(`/payment/order/${orderId}`);
    return response.data.data;
};

export const createPayments = async (data: ICreatePaymentPayload): Promise<any> => {
    const response = await api.post('/payment', data);
    return response.data.data;
};