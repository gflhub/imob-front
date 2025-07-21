// src/services/property.service.ts
import api from './api';

// Interface para um imóvel (pode ser mais detalhada)
export interface IProperty {
    _id: string;
    title: string;
    description: string;
    price: number;
    type: 'apartment' | 'house' | 'rural' | 'land';
    condition: 'new' | 'used' | 'construction';
    status: 'active' | 'inactive';
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    area?: number;
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
    condominium?: {
        _id: string;
        name: string;
    };
}

export type IPropertyPayload = Omit<IProperty, '_id' | 'status' | 'condominium'> & {
    condominiumId?: string;
};

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