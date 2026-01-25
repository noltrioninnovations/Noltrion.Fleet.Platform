import React, { useEffect, useState } from 'react';
import { getVehicles, createVehicle, updateVehicle } from '../../services/vehicleService';
import type { Vehicle } from '../../services/vehicleService';
import {
    Loader2, Plus, RefreshCw, Search, Filter,
    Truck, Car, Bike
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { VehicleDetailPanel } from './VehicleDetailPanel';
import { VehicleEditPanel } from './VehicleEditPanel';

export const Vehicles: React.FC = () => {
    const { success, error: showError } = useToast();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        setIsLoading(true);
        try {
            const data = await getVehicles();
            setVehicles(data);
        } catch (err) {
            showError("Failed to load vehicles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (id: string) => {
        setSelectedId(id);
        setIsCreating(false);
        setIsEditing(false); // Reset edit mode
        setIsPanelOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedId(null);
        setIsCreating(true);
        setIsEditing(true); // New = Edit
        setIsPanelOpen(true);
    };

    const handleEditExisting = () => {
        setIsEditing(true);
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

    const handleSave = async (vehicleData: Partial<Vehicle>) => {
        setIsSubmitting(true);
        setErrors([]);
        try {
            let result;
            if (selectedId && !isCreating) {
                result = await updateVehicle(selectedId, vehicleData);
            } else {
                result = await createVehicle(vehicleData);
            }

            if (result.success) {
                success(isCreating ? "Vehicle created" : "Vehicle updated");
                loadVehicles();
                handleCloseEdit();
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

    const getSelectedVehicle = () => {
        if (isCreating) return null;
        return vehicles.find(v => v.id === selectedId) || null;
    };

    // --- Sidebar List Content (Webfleet Style) ---
    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Tabs */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Vehicles ({vehicles.length})</span>
                <div className="ml-auto flex gap-2">
                    <button onClick={loadVehicles} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={handleCreateNew} className="p-1 hover:bg-gray-100 rounded text-blue-600">
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        <span className="text-xs">Loading...</span>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No vehicles found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {vehicles.map((v) => {
                            const isSelected = selectedId === v.id;
                            // Mock status color logic
                            const statusColor = v.status === 'Active' ? 'bg-green-500' :
                                v.status === 'Maintenance' ? 'bg-red-500' : 'bg-gray-400';

                            return (
                                <div
                                    key={v.id}
                                    onClick={() => handleRowClick(v.id)}
                                    className={`
                                        flex items-start p-2 cursor-pointer transition-colors group relative
                                        ${isSelected ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    {/* Left: Icon with Status Dot */}
                                    <div className="relative mr-2.5 mt-0.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500">
                                            {v.type === 'Truck' && <Truck size={14} />}
                                            {v.type === 'Van' && <Truck size={14} />}
                                            {v.type === 'Bike' && <Bike size={14} />}
                                            {v.type === 'Car' && <Car size={14} />}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`}></div>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {v.registrationNumber}
                                            </h4>
                                        </div>

                                        <div className="text-[10px] text-gray-500 mt-px truncate flex items-center gap-2">
                                            <span>{v.model}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className={v.status === 'Active' ? 'text-green-600' : 'text-gray-400'}>{v.status}</span>
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
                isCreating ? (
                    <VehicleEditPanel
                        vehicle={null}
                        isOpen={true}
                        onClose={handleClosePanel}
                        onSave={handleSave}
                        isSubmitting={isSubmitting}
                        errors={errors}
                    />
                ) : (
                    <VehicleDetailPanel
                        isOpen={isPanelOpen}
                        onClose={handleClosePanel}
                        vehicle={getSelectedVehicle()}
                        onEdit={handleEditExisting}
                    />
                )
            }
            isPanelOpen={isPanelOpen}
            backgroundMarkers={vehicles.map(v => ({
                lat: 0, lng: 0,
                label: v.registrationNumber,
                type: 'vehicle' as const
            }))}

            secondaryContent={
                <VehicleEditPanel
                    vehicle={getSelectedVehicle()}
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
