import { useEffect, useState } from 'react';
import { Calendar, MapPin, Navigation, Package } from 'lucide-react';
import { getTrips } from '../../services/tripService';
import type { Trip } from '../../types/trip';
import { useAuth } from '../../contexts/AuthContext';

export const DriverDashboard = () => {
    const { user } = useAuth();
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allTrips = await getTrips();
            // Mock Filtering: In real app, backend filters by token, or we filter by user.username/email
            // For now, simple mock filter or show all if user matching is hard without driverId
            const filtered = allTrips.filter(t =>
                t.driver?.fullName === user?.username ||
                t.tripStatus === 'InProgress' // Fallback: Show active stuff for demo if name mismatch
            );
            setMyTrips(filtered.length > 0 ? filtered : allTrips.slice(0, 2)); // Fallback to show SOMETHING for demo
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const currentTrip = myTrips.find(t => t.tripStatus === 'InProgress');
    const upcomingTrips = myTrips.filter(t => t.tripStatus === 'Planned');

    if (loading) return <div className="p-8 text-center text-sm text-gray-500">Loading Schedule...</div>;

    return (
        <div className="max-w-md mx-auto space-y-6 animate-fade-in pb-20">
            <div>
                <h2 className="text-lg font-bold text-gray-800">Hello, {user?.username} 👋</h2>
                <p className="text-xs text-gray-500">Here is your schedule for today.</p>
            </div>

            {/* Active Trip Card */}
            {currentTrip ? (
                <div className="bg-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-blue-200 text-xs uppercase font-bold tracking-wider">Current Job</span>
                            <h3 className="text-xl font-bold mt-1">Trip #{currentTrip.tripNumber?.split('-').pop()}</h3>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Navigation size={24} className="text-white" />
                        </div>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-blue-400/50"></div>

                        <div className="flex gap-4 relative z-10">
                            <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-blue-600 mt-1"></div>
                            <div>
                                <p className="text-xs text-blue-200">Pickup</p>
                                <p className="font-semibold">{currentTrip.pickupLocation || 'Warehouse A'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 relative z-10">
                            <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-600 mt-1"></div>
                            <div>
                                <p className="text-xs text-blue-200">Drop-off</p>
                                <p className="font-semibold">{currentTrip.dropLocation || 'Customer Site'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-blue-500/50 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <Package size={16} className="text-blue-200" />
                            <span>{currentTrip.tripJobs.length} stops</span>
                        </div>
                        <button className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-500">No active trip right now.</p>
                    <button className="mt-2 text-blue-600 text-xs font-bold">Refresh Status</button>
                </div>
            )}

            {/* Upcoming List */}
            <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} /> Upcoming Trips
                </h3>
                <div className="space-y-3">
                    {upcomingTrips.map(trip => (
                        <div key={trip.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-gray-800">{trip.tripNumber}</p>
                                <p className="text-xs text-gray-500 mt-1">{trip.startTime ? new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">Planned</span>
                            </div>
                        </div>
                    ))}
                    {upcomingTrips.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No upcoming trips scheduled.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
