import fleetApi from '../api/axios';
import type { TripCandidate, PlanningResult } from '../types/planning';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/planning';

export const generatePlan = async (): Promise<PlanningResult> => {
    const response = await fleetApi.post<ApiResult<PlanningResult>>(`${API_URL}/generate`);
    return response.data.data!;
};

export const confirmPlan = async (trips: TripCandidate[]): Promise<void> => {
    await fleetApi.post(`${API_URL}/confirm`, trips);
};
