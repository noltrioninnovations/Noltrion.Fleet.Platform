import fleetApi from '../api/axios';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/customers';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    notificationEnabled: boolean;
}

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await fleetApi.get<ApiResult<Customer[]>>(API_URL);
    return response.data.data!; // Assume data exists or handle
};

export const createCustomer = async (customer: Partial<Customer>) => {
    const response = await fleetApi.post(API_URL, customer);
    return response.data;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const response = await fleetApi.put(`${API_URL}/${id}`, customer);
    return response.data;
};

export const deleteCustomer = async (id: string) => {
    const response = await fleetApi.delete(`${API_URL}/${id}`);
    return response.data;
};
