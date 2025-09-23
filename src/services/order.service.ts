// src/services/order.service.ts
import api from './api';

// Interfaces para tipar os dados da ordem
// Estas interfaces devem refletir a resposta da sua API NestJS
export interface IOrder {
    _id: string;
    orderDate: string;
    totalAmount: number;
    orderStatus: string;
    buyers: { _id: string; name: string }[]; // Exemplo de como podem vir populados
    items: { _id: string; title: string }[];
    // Adicione outros campos...
}

// Payload para criar uma nova ordem
export interface IPaymentDefinition {
    payerId: string;
    paymentMethod: string;
    totalAmount: number;
    qtdInstallments: number;
    firstDueDate: string;
}

export interface IOrderPayload {
    orderDate: string;
    items: { _id: string; price: number }[];
    sellers: string[];
    buyers: string[];
    brokers: string[];
    payments: IPaymentDefinition[];
}

export const fetchOrders = async (): Promise<IOrder[]> => {
    const response = await api.get('/order');
    return response.data;
};

export const fetchOrderById = async (id: string): Promise<IOrder> => {
    const response = await api.get(`/order/${id}`);
    return response.data;
};

export const createOrder = async (data: IOrderPayload): Promise<IOrder> => {
    const response = await api.post('/order', data);
    return response.data;
};