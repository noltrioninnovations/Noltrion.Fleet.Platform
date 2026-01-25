import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../../services/vehicleService';
import { X } from 'lucide-react';

interface VehicleEditPanelProps {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Partial<Vehicle>) => Promise<void>;
    isSubmitting: boolean;
    errors: string[];
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col bg-gray-50/50 w-full border-l border-gray-200">
        {children}
    </div>
);

export const VehicleEditPanel: React.FC<VehicleEditPanelProps> = ({
    vehicle,
    isOpen,
    onClose,
    onSave,
    isSubmitting,
    errors
}) => {
    const [formData, setFormData] = useState<Partial<Vehicle>>({});

    useEffect(() => {
        if (isOpen) {
            if (vehicle) {
                setFormData(vehicle);
            } else {
                setFormData({ type: 'Truck', status: 'Active' });
            }
        }
    }, [isOpen, vehicle]);

    if (!isOpen) return null;

    return (
        <Wrapper>
            <div className="bg-[#4d5761] text-white px-3 py-3 flex justify-between items-center shadow-md z-1">
                <h2 className="font-bold text-base">{vehicle ? 'Edit Vehicle' : 'New Vehicle'}</h2>
                <button onClick={onClose} className="text-gray-300 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            <div className="p-2 overflow-y-auto flex-1 bg-gray-50/50 custom-scrollbar">
                <form id="vehicle-form" onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-2">
                    {/* Error Display */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                            <ul className="list-disc list-inside">
                                {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 space-y-3">
                        <div className="border-b border-gray-100 pb-2 mb-2">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vehicle Details</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registration</label>
                            <input
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.registrationNumber || ''}
                                onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                                required
                                placeholder="e.g. SAA1234A, GBA1234Z"
                                title="Vehicle Registration Number (e.g. SAA1234A, GBA1234Z)"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Model</label>
                            <input
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.model || ''}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                required
                                placeholder="e.g. Tata Ace"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                            <select
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.type || 'Truck'}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Truck">Truck</option>
                                <option value="Van">Van</option>
                                <option value="Bike">Bike</option>
                                <option value="Car">Car</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                            <select
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.status || 'Active'}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-1.5 rounded-full bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700 transition-colors shadow-sm"
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Wrapper>
    );
}
