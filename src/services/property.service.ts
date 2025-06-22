// src/services/property.service.ts
import api from './api';

// Interface para um imóvel (pode ser mais detalhada)
interface IProperty {
    _id: string;
    title: string;
    price: number;
    type: string;
    status: 'active' | 'inactive';
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        number: string;
    };
    // Adicione todos os campos que a API retorna
}

// DTO para o payload de criação/atualização
// Pode ser importado do DTO do Zod no formulário
interface IPropertyPayload {
    title: string;
    description: string;
    price: number;
    // ... outros campos
}

export const fetchProperties = async (): Promise<IProperty[]> => {
    const response = await api.get('/property');
    return response.data;
};

// --- FUNÇÃO ADICIONADA ---
export const fetchPropertyById = async (id: string): Promise<IProperty> => {
    const response = await api.get(`/property/${id}`);
    return response.data;
};

export const createProperty = async (data: IPropertyPayload): Promise<IProperty> => {
    const response = await api.post('/property', data);
    return response.data;
};

// --- FUNÇÃO ADICIONADA ---
export const updateProperty = async (id: string, data: Partial<IPropertyPayload>): Promise<IProperty> => {
    // Usamos PATCH para atualizações parciais
    const response = await api.patch(`/property/${id}`, data);
    return response.data;
};