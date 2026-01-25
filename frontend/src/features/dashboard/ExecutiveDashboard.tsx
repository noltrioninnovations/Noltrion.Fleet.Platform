import { useEffect, useState } from 'react';
import { Truck, Users, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { getVehicles } from '../../services/vehicleService';
import { getDrivers } from '../../services/driverService';
import { getTrips } from '../../services/tripService';

// --- SVG CHARY COMPONENTS (Reused) ---
const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulativeAngle = 0;
    const radius = 40;
    const center = 50;

    if (total === 0) return <div className="flex items-center justify-center h-48 text-gray-400 text-xs">No Data</div>;

    return (
        <div className="flex items-center justify-center h-48 relative">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                {data.map((slice, i) => {
                    const angle = (slice.value / total) * 360;
                    const x1 = center + radius * Math.cos((Math.PI * cumulativeAngle) / 180);
                    const y1 = center + radius * Math.sin((Math.PI * cumulativeAngle) / 180);
                    const x2 = center + radius * Math.cos((Math.PI * (cumulativeAngle + angle)) / 180);
                    const y2 = center + radius * Math.sin((Math.PI * (cumulativeAngle + angle)) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    const pathd = [`M ${center} ${center}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, 'Z'].join(' ');
                    cumulativeAngle += angle;
                    return <path key={i} d={pathd} fill={slice.color} stroke="white" strokeWidth="2" />;
                })}
                <circle cx={center} cy={center} r={radius * 0.6} fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-gray-700">{total}</span>
            </div>
        </div>
    );
};

const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="h-48 flex items-end justify-around gap-2 pt-4 pb-2">
            {data.map((item, i) => {
                const heightPercentage = (item.value / maxValue) * 100;
                return (
                    <div key={i} className="flex flex-col items-center justify-end h-full w-full group relative">
                        <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {item.label}: S${item.value.toLocaleString()}
                        </div>
                        <div style={{ height: `${heightPercentage}%` }} className={`w-full max-w-[30px] rounded-t-sm transition-all duration-500 ${item.color}`}></div>
                        <span className="text-[10px] text-gray-500 mt-2 font-medium truncate w-full text-center">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1 font-mono">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-full ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        {subtext && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">{subtext}</p>}
    </div>
);

export const ExecutiveDashboard = () => {
    const [stats, setStats] = useState({ totalVehicles: 0, activeDrivers: 0, totalRevenue: 0, activeTrips: 0 });
    const [charts, setCharts] = useState({ tripStatus: [] as any[], revenueByType: [] as any[] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vehicles, drivers, trips] = await Promise.all([getVehicles(), getDrivers(), getTrips()]);
            const totalVehicles = vehicles.length;
            const activeDrivers = drivers.filter(d => d.status === 'Active' || (d as any).isActive).length;
            const totalRevenue = trips.reduce((sum, t) => sum + (t.totalCost || 0), 0);
            const activeStatuses = ['StartTrip', 'StartLoad', 'CompleteLoad', 'InTransit'];
            const activeTrips = trips.filter(t => activeStatuses.includes(t.tripStatus)).length;

            setStats({ totalVehicles, activeDrivers, totalRevenue, activeTrips });

            const statusCounts = trips.reduce((acc, t) => {
                let group: string = t.tripStatus;
                if (['Assigned', 'Planned'].includes(t.tripStatus)) group = 'Planned';
                if (activeStatuses.includes(t.tripStatus)) group = 'On Road';

                acc[group] = (acc[group] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const tripStatusData = [
                { label: 'Completed', value: statusCounts['Completed'] || 0, color: '#22c55e' }, // Green
                { label: 'On Road', value: statusCounts['On Road'] || 0, color: '#3b82f6' }, // Blue
                { label: 'Planned', value: statusCounts['Planned'] || 0, color: '#eab308' }, // Yellow
                { label: 'Cancelled', value: statusCounts['Cancelled'] || 0, color: '#94a3b8' }, // Gray
            ].filter(d => d.value > 0);

            const revByType = trips.reduce((acc, t) => {
                const type = t.truckType || 'Unknown';
                acc[type] = (acc[type] || 0) + (t.totalCost || 0);
                return acc;
            }, {} as Record<string, number>);
            const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500'];
            const revenueData = Object.keys(revByType).map((type, idx) => ({
                label: type, value: revByType[type], color: colors[idx % colors.length]
            }));

            setCharts({ tripStatus: tripStatusData, revenueByType: revenueData });
        } catch (error) { console.error("Dashboard load failed", error); } finally { setLoading(false); }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 text-sm">Loading Executive Overview...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-md font-bold text-gray-800">Executive Overview</h2>
                <p className="text-xs text-gray-500">Financial health and fleet utilization metrics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`S$${stats.totalRevenue.toLocaleString()}`} subtext={<><TrendingUp size={12} className="text-green-500" /> Gross Income</>} icon={DollarSign} color="bg-indigo-500" />
                <StatCard title="Active Trips" value={stats.activeTrips} subtext="Currently on road" icon={Activity} color="bg-green-500" />
                <StatCard title="Active Drivers" value={stats.activeDrivers} subtext={`${stats.totalVehicles} total vehicles`} icon={Users} color="bg-blue-500" />
                <StatCard title="Total Vehicles" value={stats.totalVehicles} subtext="Fleet Size" icon={Truck} color="bg-orange-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
                <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Trip Status</h3>
                    <div className="flex-1 flex flex-col items-center justify-center"><DonutChart data={charts.tripStatus} /></div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {charts.tripStatus.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span><span className="text-[10px] text-gray-600 font-medium">{item.label} ({item.value})</span></div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg p-5 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-gray-700">Revenue by Vehicle Type</h3></div>
                    <div className="flex-1 w-full">{charts.revenueByType.length > 0 ? <BarChart data={charts.revenueByType} /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Revenue Data</div>}</div>
                </div>
            </div>
        </div>
    );
};
