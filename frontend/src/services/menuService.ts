import fleetApi from '../api/axios';
import type { ApiResult } from '../types/auth';

export interface MenuDto {
    id: string;
    title: string;
    code: string;
    icon: string;
    url: string;
    order: number;
    children: MenuDto[];
}

const getMyMenus = async (): Promise<MenuDto[]> => {
    try {
        const response = await fleetApi.get<ApiResult<MenuDto[]>>('/v1/web/menus/my-menus');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch menus', error);
        return [];
    }
};

export const menuService = {
    getMyMenus
};
