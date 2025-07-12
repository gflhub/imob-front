// src/services/user.service.ts
import api from './api';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  type: 'user' | 'admin';
  person?: {
    _id: string;
    name: string;
  };
  roles: IRole[];
}

export interface IRole {
    _id: string;
    name: string;
    permissions: IPermission[];
}

export interface IPermission {
    _id: string;
    name: string;
    slug: string;
}

export interface IUserPayload {
  email: string;
  password?: string;
  person: string;
  type: 'user' | 'admin';
  roles?: string[];
}

export const fetchUsers = async (): Promise<IUser[]> => {
  const response = await api.get('/user');
  return response.data;
};

export const fetchUserById = async (id: string): Promise<IUser> => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const createUser = async (data: IUserPayload): Promise<IUser> => {
  const response = await api.post('/user', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<IUserPayload>): Promise<IUser> => {
  const response = await api.patch(`/user/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/user/${id}`);
};

export const fetchRoles = async (): Promise<IRole[]> => {
    const response = await api.get('/roles');
    return response.data;
};

export const fetchRoleById = async (id: string): Promise<IRole> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
};

export const createRole = async (data: { name: string, permissions: string[] }): Promise<IRole> => {
    const response = await api.post('/roles', data);
    return response.data;
};

export const updateRole = async (id: string, data: { name: string, permissions: string[] }): Promise<IRole> => {
    const response = await api.patch(`/roles/${id}`, data);
    return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
};

export const fetchPermissions = async (): Promise<IPermission[]> => {
    const response = await api.get('/permissions');
    return response.data;
};

export const createPermission = async (data: { name: string, slug: string }): Promise<IPermission> => {
    const response = await api.post('/permissions', data);
    return response.data;
};
