import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { CustomerDashboard } from './CustomerDashboard';

export const DashboardWrapper = () => {
    const { user } = useAuth();

    // Check if user has Customer role
    const isCustomer = user?.roles?.includes('Customer');

    if (isCustomer) {
        return <CustomerDashboard />;
    }

    return <ExecutiveDashboard />;
};
