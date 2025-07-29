// src/services/person.service.ts
import api from './api';

// Interface para a entidade Person (pode ser mais detalhada)
export interface IPerson {
    _id: string;
    name: string;
    email: string;
    phone: string;
    doc: string;
    active: boolean;
    address?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
    };
    commission?: {
        _id: string;
        ranges: ICommissionRange[];
    };
    // ... outros campos
}

export interface ICommissionRange {
    minAmount: number;
    maxAmount: number;
    rate: number;
}

export type IPersonPayload = Omit<IPerson, '_id' | 'active' | 'companyId' | 'type'> & { birth?: string; };

export const fetchPersons = async (): Promise<IPerson[]> => {
    const response = await api.get('/person');
    return response.data;
};

// --- Métodos para Clientes ---

export const fetchCustomers = async (): Promise<IPerson[]> => {
    // A API NestJS que criamos usa o endpoint /person/customer
    const response = await api.get('/person/customer');
    return response.data;
};

export const fetchPersonById = async (id: string, type: 'customer' | 'broker'): Promise<IPerson> => {
    const response = await api.get(`/person/${type}/${id}`);
    return response.data;
};

export const fetchCustomerById = async (id: string): Promise<IPerson> => {
    return fetchPersonById(id, 'customer');
};

export const fetchBrokerById = async (id: string): Promise<IPerson> => {
    return fetchPersonById(id, 'broker');
};

export const createCustomer = async (data: IPersonPayload): Promise<IPerson> => {
    const response = await api.post('/person/customer', data);
    return response.data;
};

export const updateCustomer = async (id: string, data: Partial<IPersonPayload>): Promise<IPerson> => {
    const response = await api.put(`/person/customer/${id}`, data);
    return response.data;
};

// --- Métodos para Corretores ---
export const fetchBrokers = async (): Promise<IPerson[]> => {
    const response = await api.get('/person/broker');
    return response.data;
};

// Lembrete: A API precisa ser adequada para esta chamada.
// O backend deve criar uma Person (type: 'user') e um User (login) atomicamente.
export const createBroker = async (data: IPersonPayload): Promise<IPerson> => {
    const response = await api.post('/person/broker', data);
    return response.data;
  };

export const updateBroker = async (id: string, data: Partial<IPersonPayload>): Promise<IPerson> => {
    const response = await api.put(`/person/broker/${id}`, data);
    return response.data;
};