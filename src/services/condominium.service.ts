// src/services/condominium.service.ts
import api from './api';

export interface ICondominium {
    _id: string;
    name: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    monthlyFees: number;
    description?: string;
    type: 'building' | 'subdivision'; // Edifício ou Loteamento
}

export type ICondominiumPayload = Omit<ICondominium, '_id'>;

export const fetchCondominiums = async (): Promise<ICondominium[]> => {
    const response = await api.get('/condominium');
    return response.data;
};

export const createCondominium = async (data: ICondominiumPayload): Promise<ICondominium> => {
    const response = await api.post('/condominium', data);
    return response.data;
};
