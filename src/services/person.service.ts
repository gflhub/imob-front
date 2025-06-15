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
    // ... outros campos
}

export type IPersonPayload = Omit<IPerson, '_id' | 'active' | 'companyId' | 'type'>;

// --- Métodos para Clientes ---

export const fetchCustomers = async (): Promise<IPerson[]> => {
    // A API NestJS que criamos usa o endpoint /person/customer
    const response = await api.get('/person/customer');
    return response.data.data;
};

export const fetchCustomerById = async (id: string): Promise<IPerson> => {
    const response = await api.get(`/person/customer/${id}`);
    return response.data.data;
};

export const createCustomer = async (data: IPersonPayload): Promise<IPerson> => {
    const response = await api.post('/person/customer', data);
    return response.data.data;
};

export const updateCustomer = async (id: string, data: Partial<IPersonPayload>): Promise<IPerson> => {
    const response = await api.put(`/person/customer/${id}`, data);
    return response.data.data;
};

// --- Métodos para Corretores ---
export const fetchBrokers = async (): Promise<IPerson[]> => {
    const response = await api.get('/person/broker');
    return response.data.data;
};

// Lembrete: A API precisa ser adequada para esta chamada.
// O backend deve criar uma Person (type: 'user') e um User (login) atomicamente.
export const createBroker = async (data: IPersonPayload): Promise<IPerson> => {
    const response = await api.post('/person/broker', data);
    return response.data.data;
  };