// src/services/property.service.ts
import api from './api';

// Supondo que você tenha uma interface IProperty para tipar a resposta
interface IProperty {
    _id: string;
    title: string;
    price: number;
    type: string;
    status: 'active' | 'inactive';
    // Adicione outros campos que a API retorna
}

interface ICreatePropertyPayload {
    title: string;
    description: string;
    price: number;
    // ... adicione todos os outros campos do formulário
}

export const fetchProperties = async (): Promise<IProperty[]> => {
    const response = await api.get('/property');
    // A API NestJS retorna os dados dentro da propriedade 'data' da nossa resposta padrão
    return response.data;
};

export const createProperty = async (data: ICreatePropertyPayload): Promise<IProperty> => {
    const response = await api.post('/property', data);
    return response.data;
};