import { useEffect, useState } from 'react';
import { getTrips, updateTripStatus, updateJobStatus, createTrip } from '../../services/tripService';
import type { Trip } from '../../types/trip';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { TripDetailPanel } from './TripDetailPanel';
import { TripEditPanel } from './TripEditPanel';
import { BillingPanel } from '../billing/BillingPanel';
import { Truck, Search, RefreshCw, Plus, Receipt } from 'lucide-react';
import { InvoiceFormPanel } from '../billing/InvoiceFormPanel';

export const TripDashboard = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [sInvoiceTripId, setSInvoiceTripId] = useState<string | null>(null);

    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const data = await getTrips();
            setTrips(data);
            if (selectedTrip) {
                const updatedSelected = data.find(t => t.id === selectedTrip.id);
                if (updatedSelected) setSelectedTrip(updatedSelected);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, []);

    const handleStatusChange = async (id: string, status: string) => {
        await updateTripStatus(id, status);
        loadTrips();
    };

    const handleJobStatusChange = async (tripJobId: string, status: string) => {
        await updateJobStatus(tripJobId, status);
        loadTrips();
    };

    const handleSaveTrip = async (data: any) => {
        setLoading(true);
        try {
            if (editingTrip) {
                // Import updateTrip if not already imported (it is not currently imported in dashboard)
                // I will assume I need to update imports separately or use the Service directly if accessible. 
                // Wait, I need to add updateTrip to imports.
                const { updateTrip } = await import('../../services/tripService');
                await updateTrip(editingTrip.id, data);
            } else {
                await createTrip(data);
            }
            await loadTrips();
            setIsEditOpen(false);
            setEditingTrip(null);
        } catch (error) {
            console.error("Failed to save trip", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrips = trips.filter(t =>
        t.vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.driver?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sidebarContent = (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Sidebar Header */}
            <div className="p-3 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Manifests ({filteredTrips.length})</h2>
                    <div className="flex gap-1">
                        <button onClick={() => loadTrips()} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600" title="Refresh">
                            <RefreshCw size={12} />
                        </button>
                        <button onClick={() => { setIsEditOpen(true); setEditingTrip(null); setSelectedTrip(null); }} className="p-1 hover:bg-gray-100 rounded text-blue-600" title="New Trip">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search trips..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && !trips.length ? (
                    <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
                ) : filteredTrips.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">No trips found</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredTrips.map(trip => (
                            <div
                                key={trip.id}
                                onClick={() => { setSelectedTrip(trip); setIsEditOpen(false); setEditingTrip(null); }}
                                className={`
                                    flex items-start p-2 cursor-pointer transition-colors group relative
                                    ${selectedTrip?.id === trip.id ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                `}
                            >
                                {/* Left: Icon */}
                                <div className="relative mr-2.5 mt-0.5">
                                    <div className="w-7 h-7 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500">
                                        <Truck size={14} />
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white 
                                        ${trip.tripStatus === 'InTransit' ? 'bg-green-500' :
                                            trip.tripStatus === 'Completed' ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                                </div>

                                {/* Middle: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-xs font-bold truncate ${selectedTrip?.id === trip.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {trip.tripNumber || 'Pending'}
                                        </h4>
                                        <span className={`text-[9px] px-1.5 rounded font-bold uppercase
                                            ${trip.tripStatus === 'StartLoad' ? 'text-blue-700 bg-blue-50' :
                                                trip.tripStatus === 'InTransit' ? 'text-indigo-700 bg-indigo-50' :
                                                    trip.tripStatus === 'Delivery' ? 'text-orange-700 bg-orange-50' :
                                                        trip.tripStatus === 'Completed' ? 'text-gray-600 bg-gray-100' :
                                                            'text-yellow-700 bg-yellow-50'}`}>
                                            {trip.tripStatus === 'Planned' ? 'JR Assigned' : trip.tripStatus}
                                        </span>
                                    </div>

                                    <div className="text-[10px] text-gray-500 mt-px truncate">
                                        <span className="font-semibold text-gray-700">{trip.vehicle?.registrationNumber || 'No Vehicle'}</span>
                                        <span className="mx-1 text-gray-300">•</span>
                                        <span>{trip.driver?.fullName || 'Unassigned'}</span>
                                    </div>

                                    {trip.tripStatus === 'Completed' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSInvoiceTripId(trip.id); }}
                                            className="absolute right-2 top-10 text-slate-400 hover:text-green-600 hover:bg-green-50 p-1.5 rounded-full transition-colors z-10"
                                            title="Generate Invoice"
                                        >
                                            <Receipt size={16} />
                                        </button>
                                    )}

                                    <div className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-2">
                                        <span>{trip.tripJobs.length} stops ({trip.totalDistanceKm} km)</span>
                                    </div>
                                </div>

                                {selectedTrip?.id === trip.id && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const isCreating = isEditOpen && !editingTrip;
    const isEditing = isEditOpen && !!editingTrip;

    return (
        <>
            <MasterDetailLayout
                panelWidth="320px"
                sidebarContent={sidebarContent}
                detailContent={
                    isCreating ? (
                        <TripEditPanel
                            trip={null}
                            isOpen={true}
                            onClose={() => { setIsEditOpen(false); setEditingTrip(null); }}
                            onSave={handleSaveTrip}
                            isSubmitting={loading}
                        />
                    ) : selectedTrip ? (
                        <TripDetailPanel
                            trip={selectedTrip}
                            isOpen={!!selectedTrip}
                            onClose={() => setSelectedTrip(null)}
                            onStatusChange={handleStatusChange}
                            onJobStatusChange={handleJobStatusChange}
                            onEdit={() => {
                                setEditingTrip(selectedTrip);
                                // Keep selectedTrip for context
                                setIsEditOpen(true);
                            }}
                            onBilling={() => setIsBillingOpen(true)}
                        />
                    ) : null
                }
                isPanelOpen={!!selectedTrip || isCreating}
                secondaryContent={
                    <TripEditPanel
                        trip={editingTrip}
                        isOpen={isEditing}
                        onClose={() => { setIsEditOpen(false); setEditingTrip(null); }}
                        onSave={handleSaveTrip}
                        isSubmitting={loading}
                    />
                }
                isSecondaryOpen={isEditing}
            />

            {/* Billing Modal - Independent Overlay */}
            {isBillingOpen && selectedTrip && (
                <BillingPanel
                    trip={selectedTrip}
                    isOpen={isBillingOpen}
                    onClose={() => setIsBillingOpen(false)}
                />
            )}

            {sInvoiceTripId && (
                <InvoiceFormPanel
                    tripId={sInvoiceTripId}
                    isOpen={!!sInvoiceTripId}
                    onClose={() => setSInvoiceTripId(null)}
                />
            )}
        </>
    );
};
