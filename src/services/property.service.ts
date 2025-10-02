// src/services/property.service.ts
import api from './api';
import { type ICondominium } from './condominium.service';

// Interface para um imóvel (pode ser mais detalhada)
export interface IProperty {
    _id: string;
    title: string;
    description: string;
    price: number;
    type: 'apartment' | 'house' | 'rural' | 'land';
    condition: 'new' | 'used' | 'construction';
    status: 'active' | 'inactive';
    attributes: {
        bedrooms?: string;
        bathrooms?: string;
        parkingSpaces?: string;
    };
    totalArea?: number;
    privateArea?: number;
    areaUnit?: 'm2' | 'ha';
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zip?: string;
    };
    condominium?: ICondominium;
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

export const disableProperty = async (id: string): Promise<IProperty> => {
    const response = await api.patch(`/property/${id}/disable`);
    return response.data;
};