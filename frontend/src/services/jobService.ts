import fleetApi from '../api/axios';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/jobs';

export interface Job {
    id: string;
    customerName: string;
    emailReference: string;
    pickupAddress: string;
    requestedPickupTime?: string;
    deliveryAddress: string;
    requestedDeliveryTime?: string;
    weightKg: number;
    volumeCbm: number;
    requiredVehicleType: string;
    specialInstructions: string;
    status: string;
    source: string;
    createdOn: string;
}

export const getJobs = async (): Promise<Job[]> => {
    const response = await fleetApi.get<ApiResult<Job[]>>(API_URL);
    return response.data.data!;
};

export const createJob = async (job: Partial<Job>) => {
    const response = await fleetApi.post(API_URL, job);
    return response.data;
};

export const updateJob = async (id: string, job: Partial<Job>) => {
    const response = await fleetApi.put(`${API_URL}/${id}`, job);
    return response.data;
};

export const cancelJob = async (id: string) => {
    const response = await fleetApi.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getDeliveredJobs = async (): Promise<Job[]> => {
    const response = await fleetApi.get<ApiResult<Job[]>>(`${API_URL}/delivered`);
    return response.data.data!;
};

export const approvePod = async (id: string) => {
    const response = await fleetApi.post(`${API_URL}/${id}/approve`, {});
    return response.data;
};
