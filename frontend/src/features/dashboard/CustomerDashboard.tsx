import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
// import { getTrips } from '../../services/tripService'; // Removed
import type { Trip } from '../../types/trip';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1 font-mono">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-full ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
);

export const CustomerDashboard = () => {
    const [stats, setStats] = useState({ activeOrders: 0, completedMonth: 0, pendingDelivery: 0, totalSpend: 0 });
    const [recentTrips, setRecentTrips] = useState<any[]>([]); // Use flexible type to support mapped requests
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Use JobRequestService for secure customer data
            const requests = await import('../../services/jobRequestService').then(m => m.getMyRequests());

            // Stats Calculation
            const activeStatuses = ['Assigned', 'StartTrip', 'StartLoad', 'CompleteLoad', 'InTransit'];

            let activeOrders = 0;
            let completedMonth = 0;
            let pendingDelivery = 0;
            let totalSpend = 0;
            const currentMonth = new Date().getMonth();

            const mappedTrips = requests.map(r => {
                const t = r.trip;

                // Calculate Stats
                if (t) {
                    if (activeStatuses.includes(t.tripStatus)) activeOrders++;
                    if (t.tripStatus === 'Completed' && t.endTime && new Date(t.endTime).getMonth() === currentMonth) completedMonth++;
                    if (t.tripStatus === 'InTransit' || t.tripStatus === 'Delivery') pendingDelivery++;
                    totalSpend += (t.invoices?.[0]?.totalAmount || 0);
                } else if (r.requestStatus === 'Submitted') {
                    activeOrders++; // Count submitted requests as active
                }

                // Map to display format (Hybrid of Request and Trip)
                return {
                    id: r.id,
                    tripNumber: t?.tripNumber || 'PENDING',
                    tripDate: r.preferredDate,
                    tripStatus: t?.tripStatus || r.requestStatus,
                    pickupLocation: r.pickupLocation,
                    dropLocation: r.dropLocation,
                    endTime: t?.endTime,
                    invoices: t?.invoices
                };
            });

            setStats({ activeOrders, completedMonth, pendingDelivery, totalSpend });
            setRecentTrips(mappedTrips.slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 text-sm">Loading Your Dashboard...</div>;

    return (
        <div className="space-y-6 animate-fade-in p-4">
            <div>
                <h2 className="text-md font-bold text-gray-800">Welcome Back</h2>
                <p className="text-xs text-gray-500">Track your orders and invoices</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders}
                    subtext="Currently processing"
                    icon={Package}
                    color="bg-blue-500"
                />
                <StatCard
                    title="In Transit"
                    value={stats.pendingDelivery}
                    subtext="On the way to you"
                    icon={Truck}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Delivered (Month)"
                    value={stats.completedMonth}
                    subtext="Completed this month"
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Spend"
                    value={`$${stats.totalSpend.toLocaleString()}`}
                    subtext="Total Invoiced Amount"
                    icon={Clock}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Orders List */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-700">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">Trip #</th>
                                <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">Route</th>
                                <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTrips.map(trip => (
                                <tr key={trip.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-xs font-medium text-gray-800">{trip.tripNumber}</td>
                                    <td className="px-4 py-2 text-xs text-gray-600">
                                        {trip.tripDate ? new Date(trip.tripDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${trip.tripStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                trip.tripStatus === 'InTransit' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-yellow-100 text-yellow-700'}`}>
                                            {trip.tripStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-xs text-gray-600 truncate max-w-[200px]">
                                        {trip.pickupLocation?.split(',')[0]} → {trip.dropLocation?.split(',')[0]}
                                    </td>
                                    <td className="px-4 py-2 text-xs font-mono text-gray-800 text-right">
                                        {trip.invoices?.[0] ? `$${trip.invoices[0].totalAmount.toFixed(2)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
