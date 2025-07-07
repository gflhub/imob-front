// src/services/commission.service.ts
import api from './api';

export interface ICommission {
    _id: string;
    brokerId: string;
    orderId: string;
    amount: number;
    commissionDate: string;
    status: 'pending' | 'paid';
}

export type ICommissionPayload = Omit<ICommission, '_id'>;

export const fetchCommissionsByBroker = async (brokerId: string): Promise<ICommission[]> => {
    const response = await api.get(`/commissions/broker/${brokerId}`);
    return response.data;
};

export const fetchCommissionById = async (id: string): Promise<ICommission> => {
    const response = await api.get(`/commissions/${id}`);
    return response.data;
};

export const createCommission = async (data: ICommissionPayload): Promise<ICommission> => {
    const response = await api.post('/commissions', data);
    return response.data;
};

export const updateCommission = async (id: string, data: Partial<ICommissionPayload>): Promise<ICommission> => {
    const response = await api.put(`/commissions/${id}`, data);
    return response.data;
};
