// src/services/tools.service.ts
import api from './api';

export interface IZipCodeResponse {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
}

export const fetchAddressByZip = async (zip: string): Promise<IZipCodeResponse> => {
    const response = await api.get(`/tools/zip/${zip}`);
    return response.data;
};
