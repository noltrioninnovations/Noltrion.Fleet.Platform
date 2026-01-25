import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { getManifests, createManifest, updateManifest, updateManifestStatus, updateManifestJobStatus } from '../../services/manifestService';
import type { Trip } from '../../types/trip';
import { TripDetailPanel } from '../monitoring/TripDetailPanel';

import { TripEditPanel } from '../monitoring/TripEditPanel';
import { BillingPanel } from '../billing/BillingPanel';
import { RefreshCw, Search, Plus, Truck } from 'lucide-react';

export const Manifests = () => {
    // State
    const [manifests, setManifests] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [prefillData, setPrefillData] = useState<any>(null);

    const location = useLocation();

    // Selection State
    const [selectedManifest, setSelectedManifest] = useState<Trip | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    // Check for navigation from Office/JobRequests
    useEffect(() => {
        if (location.state && location.state.createFromRequest) {
            const req = location.state.createFromRequest;
            setPrefillData({
                tripDate: req.preferredDate ? req.preferredDate.split('T')[0] : new Date().toISOString().split('T')[0],
                customerId: req.customerId,
                pickupLocation: req.pickupLocation,
                dropLocation: req.dropLocation,
                remarks: `Request: ${req.cargoDescription}`,
                // Map cargo if possible, or just user enters it
                // For now, simple text
                jobRequestId: req.id
            });
            setSelectedManifest(null);
            setIsEditMode(true);
            setIsPanelOpen(true);

            // Clear state so it doesn't reopen on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getManifests();
            setManifests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleSelect = (manifest: Trip) => {
        setSelectedManifest(manifest);
        setIsEditMode(false);
        setIsPanelOpen(true);
    };

    const handleCreate = () => {
        setSelectedManifest(null);
        setIsEditMode(true);
        setIsPanelOpen(true);
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleClose = () => {
        setIsPanelOpen(false);
        setIsEditMode(false);
        setIsBillingOpen(false);
        setPrefillData(null); // Clear prefill
        if (!selectedManifest && isEditMode) setSelectedManifest(null); // Clear if was creating
    };

    const handleSave = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (selectedManifest) {
                await updateManifest(selectedManifest.id, data);
            } else {
                await createManifest(data);
            }
            await loadData();
            handleClose();
        } catch (error) {
            console.error("Failed to save manifest", error);
            alert("Failed to save manifest. Please check validation errors.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateManifestStatus(id, status);
            await loadData();
            // Update local state if selected
            if (selectedManifest && selectedManifest.id === id) {
                setSelectedManifest({ ...selectedManifest, tripStatus: status as any });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleJobStatusChange = async (jobId: string, status: string) => {
        try {
            await updateManifestJobStatus(jobId, status);
            await loadData();
            // Deep update logic omitted for brevity, reload handles it
        } catch (error) {
            console.error(error);
        }
    };

    // Filtering
    const filtered = manifests.filter(m =>
        m.tripNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.driver?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // -- Sub-Components --
    const SidebarContent = (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Tabs */}
            <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-white">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Manifests ({filtered.length})</span>
                <div className="ml-auto flex gap-1">
                    <button onClick={loadData} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                        <RefreshCw size={12} />
                    </button>
                    <button onClick={handleCreate} className="p-1 hover:bg-gray-100 rounded text-blue-600">
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full pl-8 pr-2 py-1 text-[11px] bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Search manifest..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        <span className="text-[10px]">Loading...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-[10px] text-gray-400 flex flex-col items-center">
                        <Truck size={24} className="mb-2 opacity-20" />
                        No manifests found
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(m => {
                            const isSelected = selectedManifest?.id === m.id;
                            const getStatusColor = (s: string) => {
                                switch (s) {
                                    case 'Created': return 'bg-gray-400';
                                    case 'Assigned': return 'bg-blue-500';
                                    case 'StartTrip': return 'bg-cyan-500';
                                    case 'StartLoad': return 'bg-indigo-500';
                                    case 'CompleteLoad': return 'bg-indigo-600';
                                    case 'InTransit': return 'bg-orange-500';
                                    case 'Completed': return 'bg-green-500';
                                    case 'Invoiced': return 'bg-emerald-600';
                                    default: return 'bg-gray-300';
                                }
                            };
                            const statusColor = getStatusColor(m.tripStatus);

                            return (
                                <div
                                    key={m.id}
                                    onClick={() => handleSelect(m)}
                                    className={`
                                        flex items-start p-2 cursor-pointer transition-colors group relative
                                        ${isSelected ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    {/* Left: Icon with Status Dot */}
                                    <div className="relative mr-2.5 mt-0.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500">
                                            <Truck size={14} />
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`}></div>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {m.tripNumber}
                                                </h4>
                                                <span className={`text-[8px] px-1 rounded text-white ${statusColor}`}>
                                                    {m.tripStatus}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-gray-400">{m.tripDate ? new Date(m.tripDate).toLocaleDateString() : ''}</span>
                                        </div>

                                        <div className="text-[10px] text-gray-500 mt-px truncate flex items-center gap-2">
                                            <span className="truncate max-w-[100px]">{m.vehicle?.registrationNumber || 'No Truck'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="truncate max-w-[100px]">{m.driver?.fullName || 'No Driver'}</span>
                                        </div>
                                    </div>

                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500"></div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-1 border-t border-gray-200 bg-white text-[9px] text-gray-400 text-center">
                {filtered.length} Records
            </div>
        </div>
    );

    const DetailContent = isEditMode ? (
        <TripEditPanel
            trip={selectedManifest}
            isOpen={true} // Controlled by parent layout
            onClose={handleClose}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            prefillData={prefillData}
        />
    ) : (
        <TripDetailPanel
            trip={selectedManifest}
            isOpen={!!selectedManifest}
            onClose={handleClose}
            onStatusChange={handleStatusChange}
            onJobStatusChange={handleJobStatusChange}
            onEdit={handleEdit}
            onBilling={() => setIsBillingOpen(true)}
        />
    );

    const BillingContent = selectedManifest && (
        <BillingPanel
            trip={selectedManifest}
            isOpen={isBillingOpen}
            onClose={() => setIsBillingOpen(false)}
        />
    );

    return (
        <>
            <MasterDetailLayout
                sidebarContent={SidebarContent}
                detailContent={DetailContent}
                isPanelOpen={isPanelOpen || isEditMode}
                panelWidth="450px" // Compact panel for Manifest details
                backgroundMarkers={filtered.map(m => ({
                    lat: 0, lng: 0, // Mock location
                    label: m.vehicle?.registrationNumber || m.tripNumber,
                    type: 'vehicle' as const
                }))}
            />
            {BillingContent}
        </>
    );
};
