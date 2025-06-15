// src/services/company.service.ts
import api from './api';

// As interfaces podem ser mais detalhadas para corresponder aos DTOs
export interface ICompany {
    _id: string;
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    // Adicione outros campos conforme necessário
}

export type ICompanyPayload = Omit<ICompany, '_id'>;

export const fetchCompanies = async (): Promise<ICompany[]> => {
    const response = await api.get('/company');
    return response.data.data;
};

export const fetchCompanyById = async (id: string): Promise<ICompany> => {
    const response = await api.get(`/company/${id}`);
    return response.data.data;
};

export const createCompany = async (data: ICompanyPayload): Promise<ICompany> => {
    const response = await api.post('/company', data);
    return response.data.data;
};

export const updateCompany = async (id: string, data: Partial<ICompanyPayload>): Promise<ICompany> => {
    const response = await api.put(`/company/${id}`, data);
    return response.data.data;
};