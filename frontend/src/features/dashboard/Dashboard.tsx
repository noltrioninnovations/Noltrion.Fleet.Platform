import { useAuth } from '../../contexts/AuthContext';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { OpsDashboard } from './OpsDashboard';
import { DriverDashboard } from './DriverDashboard';

export const Dashboard = () => {
    const { user } = useAuth();

    // Default to Executive if no role
    const role = user?.roles?.[0] || 'Admin';

    // Role Logic
    if (role === 'Driver') {
        return <DriverDashboard />;
    }

    if (role === 'Dispatcher' || role === 'Manager') {
        return <OpsDashboard />;
    }

    // Default / Admin / Investor
    return <ExecutiveDashboard />;
};
