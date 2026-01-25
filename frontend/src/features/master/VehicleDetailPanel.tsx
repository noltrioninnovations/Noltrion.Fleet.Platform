
import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../../services/vehicleService';
import { getTrips } from '../../services/tripService'; // Import trip service
import type { Trip } from '../../types/trip';
import {
    getMaintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    seedMaintenanceData,
    type MaintenanceRecord
} from '../../services/maintenanceService'; // Import maintenance service

import { X, Truck, User, Battery, Activity, MapPin, Navigation, Edit, DollarSign, PenTool, Plus } from 'lucide-react';
import { MapDisplay } from '../../components/ui/MapDisplay';

interface VehicleDetailPanelProps {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full flex flex-col bg-gray-50/50 w-full">
        {children}
    </div>
);

type Tab = 'dashboard' | 'trips' | 'maintenance';

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({
    vehicle,
    isOpen,
    onClose,
    onEdit
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [showAddMaintenance, setShowAddMaintenance] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [editingId, setEditingId] = useState<string | null>(null);

    // New Maintenance Form State
    const [newMaintenance, setNewMaintenance] = useState({
        description: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        odometer: '',
        type: 'Service' as const,
        performedBy: 'Inhouse'
    });

    useEffect(() => {
        if (isOpen && vehicle) {
            // Reset state on open
            setActiveTab('dashboard');
            setVisibleCount(5);
            loadData();
        }
    }, [isOpen, vehicle]);

    const loadData = async () => {
        if (!vehicle) return;

        // Load Trips
        try {
            const allTrips = await getTrips();
            // Filter trips for this vehicle
            const vehicleTrips = allTrips.filter(t => t.vehicleId === vehicle.id || t.vehicle?.registrationNumber === vehicle.registrationNumber);
            setTrips(vehicleTrips);
        } catch (error) {
            console.error("Failed to load trips", error);
        }

        // Load Maintenance
        seedMaintenanceData(vehicle.id); // Ensure some demo data exists
        const records = getMaintenanceRecords(vehicle.id);
        setMaintenanceRecords(records);
    };

    const handleSaveMaintenance = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle) return;

        try {
            if (editingId) {
                // Update existing
                updateMaintenanceRecord({
                    id: editingId,
                    vehicleId: vehicle.id,
                    description: newMaintenance.description,
                    date: newMaintenance.date,
                    cost: Number(newMaintenance.cost),
                    odometer: Number(newMaintenance.odometer),
                    type: newMaintenance.type,
                    performedBy: newMaintenance.performedBy
                });
            } else {
                // Add new
                addMaintenanceRecord({
                    vehicleId: vehicle.id,
                    description: newMaintenance.description,
                    date: newMaintenance.date,
                    cost: Number(newMaintenance.cost),
                    odometer: Number(newMaintenance.odometer),
                    type: newMaintenance.type,
                    performedBy: newMaintenance.performedBy
                });
            }

            // Reload and reset
            setMaintenanceRecords(getMaintenanceRecords(vehicle.id));
            setShowAddMaintenance(false);
            setEditingId(null);
            setNewMaintenance({
                description: '',
                date: new Date().toISOString().split('T')[0],
                cost: '',
                odometer: '',
                type: 'Service',
                performedBy: 'Inhouse'
            });
        } catch (error) {
            console.error("Failed to save maintenance", error);
        }
    };

    const handleEdit = (record: MaintenanceRecord) => {
        setNewMaintenance({
            description: record.description,
            date: record.date.split('T')[0],
            cost: record.cost.toString(),
            odometer: record.odometer.toString(),
            type: record.type as any,
            performedBy: record.performedBy || 'Inhouse'
        });
        setEditingId(record.id);
        setShowAddMaintenance(true);
    };

    const handleCancel = () => {
        setShowAddMaintenance(false);
        setEditingId(null);
        setNewMaintenance({
            description: '',
            date: new Date().toISOString().split('T')[0],
            cost: '',
            odometer: '',
            type: 'Service',
            performedBy: 'Inhouse'
        });
    };

    if (!isOpen || !vehicle) return null;

    const TabButton = ({ id, label }: { id: Tab, label: string }) => (
        <div
            onClick={() => setActiveTab(id)}
            className={`px-3 py-2 border-b-2 text-[11px] cursor-pointer transition-colors ${activeTab === id
                ? 'border-white text-white font-medium'
                : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
                }`}
        >
            {label}
        </div>
    );

    return (
        <Wrapper>
            {/* Header */}
            <div className="bg-[#4d5761] text-white px-3 py-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                        <Truck size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-tight">{vehicle.registrationNumber}</h1>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wider">{vehicle.type} • {vehicle.status}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Trace Vehicle"
                    >
                        <Navigation size={16} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Edit Details"
                    >
                        <Edit size={16} />
                    </button>
                    <div className="h-4 w-px bg-white/20"></div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Actions / Tabs */}
            <div className="bg-[#4d5761] text-gray-300 flex px-2 border-t border-white/10">
                <TabButton id="dashboard" label="Dashboard" />
                <TabButton id="trips" label="Trips" />
                <TabButton id="maintenance" label="Maintenance" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar relative">

                {/* --- DASHBOARD TAB --- */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 gap-2 mb-2">
                            <div className="bg-white rounded shadow-sm border border-gray-200 p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Today's Trips</div>
                                    <div className="text-2xl font-bold text-gray-800 mt-0.5">
                                        {trips.filter(t => t.tripDate && t.tripDate.startsWith(new Date().toISOString().split('T')[0])).length}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Navigation size={16} />
                                </div>
                            </div>
                        </div>
                        {/* Card: Position */}
                        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Position</h3>
                                <Activity size={12} className="text-gray-400" />
                            </div>
                            <MapDisplay
                                markers={[{ lat: 0, lng: 0, label: vehicle.registrationNumber, type: 'vehicle' }]}
                                height="120px"
                            />
                            <div className="p-2">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <MapPin size={14} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-0.5">Today, 11:24</div>
                                        <div className="text-xs font-medium text-gray-800">Bruinvispad 23, 1317KA</div>
                                        <div className="text-[10px] text-gray-500">Almere, NL</div>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="p-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer text-gray-500">
                                            <Navigation size={12} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-semibold">
                                        Private Trip
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card: Driver */}
                        <div className="bg-white rounded shadow-sm border border-gray-200">
                            <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Driver</h3>
                                <button onClick={onEdit} className="text-[9px] text-blue-600 font-medium hover:underline">Change</button>
                            </div>
                            <div className="p-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={12} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-gray-800">Unknown Driver</span>
                                        <div className="text-[10px] text-gray-400">Mobile: --</div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </>
                )}

                {/* --- TRIPS TAB --- */}
                {activeTab === 'trips' && (
                    <div className="space-y-2">
                        {trips.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-xs">
                                No live trips found for this vehicle.
                            </div>
                        ) : (
                            <>
                                {trips.slice(0, visibleCount).map((trip) => (
                                    <div key={trip.id} className="bg-white rounded shadow-sm border border-gray-200 p-1.5 hover:border-blue-300 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs font-bold text-gray-800">{trip.tripNumber || 'Trip #'}</div>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${trip.tripStatus === 'InTransit' ? 'bg-blue-100 text-blue-700' :
                                                    trip.tripStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {trip.tripStatus}
                                                </span>
                                            </div>
                                            <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded border border-orange-100 shadow-sm">
                                                {trip.tripDate ? new Date(trip.tripDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1 mt-1 pl-2 border-l-2 border-gray-100">
                                            <div className="relative">
                                                <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full border border-blue-500 bg-white"></div>
                                                <div className="text-[10px] font-medium text-gray-800 truncate" title={trip.pickupLocation}>{trip.pickupLocation || 'Unknown'}</div>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                                <div className="text-[10px] font-medium text-gray-800 truncate" title={trip.dropLocation}>{trip.dropLocation || 'Unknown'}</div>
                                            </div>
                                        </div>
                                        {trip.driver && (
                                            <div className="mt-1.5 pt-1.5 border-t border-gray-50 flex items-center gap-1.5 text-gray-400">
                                                <User size={10} />
                                                <span className="text-[10px]">{trip.driver.fullName}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {visibleCount < trips.length && (
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 5)}
                                        className="w-full py-2 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded border border-dashed border-blue-200 transition-colors"
                                    >
                                        Load More ({trips.length - visibleCount} remaining)
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- MAINTENANCE TAB --- */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[11px] font-bold text-gray-500 uppercase">Maintenance Log</h3>
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setNewMaintenance({
                                        description: '',
                                        date: new Date().toISOString().split('T')[0],
                                        cost: '',
                                        odometer: '',
                                        type: 'Service',
                                        performedBy: 'Inhouse'
                                    });
                                    setShowAddMaintenance(!showAddMaintenance);
                                }}
                                className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-700 transition"
                            >
                                <Plus size={12} /> Add New
                            </button>
                        </div>

                        {showAddMaintenance && (
                            <div className="bg-gray-50 rounded border border-blue-200 p-2 mb-3">
                                <form onSubmit={handleSaveMaintenance} className="space-y-2">
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">Description</label>
                                        <input
                                            type="text"
                                            required
                                            value={newMaintenance.description}
                                            onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Oil Change"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 block mb-1">Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={newMaintenance.date}
                                                onChange={e => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                                                className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 block mb-1">Odometer (km)</label>
                                            <input
                                                type="number"
                                                required
                                                value={newMaintenance.odometer}
                                                onChange={e => setNewMaintenance({ ...newMaintenance, odometer: e.target.value })}
                                                className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none"
                                                placeholder="e.g. 120000"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 block mb-1">Cost</label>
                                            <input
                                                type="number"
                                                required
                                                value={newMaintenance.cost}
                                                onChange={e => setNewMaintenance({ ...newMaintenance, cost: e.target.value })}
                                                className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 block mb-1">Category</label>
                                            <select
                                                value={newMaintenance.performedBy}
                                                onChange={e => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })}
                                                className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none bg-white"
                                            >
                                                <option value="Inhouse">Inhouse</option>
                                                <option value="Fleet Workshop">Fleet Workshop</option>
                                                <option value="AutoFix Center">AutoFix Center</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700"
                                        >
                                            Save Entry
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 rounded hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {maintenanceRecords.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-xs">
                                No maintenance history recorded.
                            </div>
                        ) : (
                            maintenanceRecords.map((record) => (
                                <div key={record.id} className="bg-white rounded shadow-sm border border-gray-200 p-2 relative group">
                                    <button
                                        onClick={() => handleEdit(record)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit Record"
                                    >
                                        <Edit size={12} />
                                    </button>
                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <div className="font-medium text-xs text-gray-800">{record.description}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(record.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Activity size={10} />
                                            <span className="text-[10px]">{record.odometer.toLocaleString()} km</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <DollarSign size={10} />
                                            <span className="text-[10px]">${record.cost.toLocaleString()}</span>
                                        </div>
                                        {record.performedBy && (
                                            <div className="flex items-center gap-1.5 text-gray-500 ml-auto">
                                                <PenTool size={10} />
                                                <span className="text-[10px]">{record.performedBy}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </Wrapper>
    );
};

