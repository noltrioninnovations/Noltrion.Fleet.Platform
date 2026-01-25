import React, { useEffect, useState } from 'react';
import { getDrivers, createDriver, updateDriver } from '../../services/driverService';
import type { Driver } from '../../services/driverService';
import {
    Loader2, Plus, RefreshCw, Search, Filter,
    User, Phone, Award
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { DriverDetailPanel } from './DriverDetailPanel';
import { DriverEditPanel } from './DriverEditPanel';

export const Drivers: React.FC = () => {
    const { success, error: showError } = useToast();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Master-Detail State
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        setIsLoading(true);
        try {
            const data = await getDrivers();
            setDrivers(data);
        } catch (err) {
            showError("Failed to load drivers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (id: string) => {
        setSelectedId(id);
        setIsCreating(false);
        setIsEditing(false); // Reset edit mode on row switch
        setIsPanelOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedId(null);
        setIsCreating(true);
        setIsEditing(true); // "New" is effectively an edit state
        setIsPanelOpen(true);
    };

    const handleEditExisting = () => {
        setIsEditing(true);
        // Do not change isCreating or isPanelOpen
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setIsEditing(false);
        setIsCreating(false);
    };

    const handleCloseEdit = () => {
        if (isCreating) {
            setIsPanelOpen(false);
            setIsCreating(false);
        }
        setIsEditing(false);
    };

    const handleSave = async (driverData: Partial<Driver>) => {
        setIsSubmitting(true);
        setErrors([]);
        try {
            let result;
            if (selectedId && !isCreating) {
                result = await updateDriver(selectedId, driverData);
            } else {
                result = await createDriver(driverData);
            }

            if (result.success) {
                success(isCreating ? "Driver created" : "Driver updated");
                loadDrivers();
                handleCloseEdit(); // Close edit panel on success
            } else {
                setErrors(result.errors || ["Operation failed"]);
            }
        } catch (error) {
            console.error(error);
            showError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSelectedDriver = () => {
        if (isCreating) return null;
        return drivers.find(d => d.id === selectedId) || null;
    };

    // --- Sidebar List Content (Webfleet Style) ---
    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Tabs */}
            <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-white">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Drivers ({drivers.length})</span>
                <div className="ml-auto flex gap-1">
                    <button onClick={loadDrivers} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                        <RefreshCw size={12} />
                    </button>
                    <button onClick={handleCreateNew} className="p-1 hover:bg-gray-100 rounded text-blue-600">
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search drivers..."
                        className="w-full pl-8 pr-2 py-1 text-[11px] bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        <span className="text-[10px]">Loading...</span>
                    </div>
                ) : drivers.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-gray-400">No drivers found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {drivers.map((d) => {
                            const isSelected = selectedId === d.id;
                            const statusColor = d.status === 'Active' ? 'bg-green-500' : 'bg-gray-300';

                            return (
                                <div
                                    key={d.id}
                                    onClick={() => handleRowClick(d.id)}
                                    className={`
                                        flex items-start p-2 cursor-pointer transition-colors group relative
                                        ${isSelected ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    {/* Left: Icon with Status Dot */}
                                    <div className="relative mr-2.5 mt-0.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500">
                                            <User size={14} />
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`}></div>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {d.name}
                                            </h4>
                                        </div>

                                        <div className="text-[10px] text-gray-500 mt-px truncate flex items-center gap-2">
                                            <span className="flex items-center"><Award size={9} className="mr-1 opacity-70" /> {d.licenseNumber}</span>
                                            {d.phone && <span className="flex items-center text-gray-400"><Phone size={9} className="mr-1 opacity-70" /> {d.phone}</span>}
                                        </div>
                                    </div>

                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500"></div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <MasterDetailLayout
            sidebarContent={sidebarContent}
            detailContent={
                // If creating, Show Edit Panel in Primary slot.
                // If viewing, Show View Panel in Primary slot.
                isCreating ? (
                    <DriverEditPanel
                        driver={null}
                        isOpen={true} // Always true if isCreating is true
                        onClose={handleClosePanel}
                        onSave={handleSave}
                        isSubmitting={isSubmitting}
                        errors={errors}
                    />
                ) : (
                    <DriverDetailPanel
                        isOpen={isPanelOpen}
                        onClose={handleClosePanel}
                        driver={getSelectedDriver()}
                        onEdit={handleEditExisting}
                    />
                )
            }
            isPanelOpen={isPanelOpen}
            backgroundMarkers={drivers.map(d => ({
                lat: 0, lng: 0,
                label: d.name,
                type: 'vehicle' as const
            }))}

            // Secondary Content: Edit Panel (Side-by-side)
            // Only show if NOT creating (existing record) AND editing is active
            secondaryContent={
                <DriverEditPanel
                    driver={getSelectedDriver()}
                    isOpen={!isCreating && isEditing}
                    onClose={handleCloseEdit}
                    onSave={handleSave}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            }
            isSecondaryOpen={!isCreating && isEditing}
        />
    );
};
