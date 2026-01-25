import fleetApi from '../api/axios';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/tracking';

export interface VehicleLocation {
    id: string;
    registrationNumber: string;
    latitude: number | null;
    longitude: number | null;
    lastLocationUpdate: string | null;
    status: string;
}

export const getLiveLocations = async (): Promise<VehicleLocation[]> => {
    const response = await fleetApi.get<ApiResult<VehicleLocation[]>>(`${API_URL}/live`);
    return response.data.data!;
};
