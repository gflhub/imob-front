// src/services/settings.service.ts
import api from './api';

export interface ISettings {
  _id: string;
  paymentPercentage: number;
  paymentMethods: string[];
}

export const fetchSettings = async (): Promise<ISettings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
  const response = await api.put('/settings', data);
  return response.data;
};
