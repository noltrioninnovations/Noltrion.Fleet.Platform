import React, { useState, useEffect } from 'react';
import type { Job } from '../../services/jobService';
import { X, MapPin, Edit, Trash2, Package, Calendar, FileText, User } from 'lucide-react';
import { MapDisplay } from '../../components/ui/MapDisplay';

interface JobDetailPanelProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: Partial<Job>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isSubmitting: boolean;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full flex flex-col bg-gray-50/50 w-full">
        {children}
    </div>
);

export const JobDetailPanel: React.FC<JobDetailPanelProps> = ({
    job,
    isOpen,
    onClose,
    onSave,
    onDelete,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<Partial<Job>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen && job) {
            setFormData(job);
            setIsEditing(false);
        } else if (isOpen && !job) {
            setFormData({ requiredVehicleType: 'Truck' }); // Defaults
            setIsEditing(true);
        }
    }, [isOpen, job]);

    if (!isOpen) return null;

    // --- EDIT MODE ---
    if (isEditing) {
        return (
            <Wrapper>
                <div className="bg-[#4d5761] text-white px-3 py-3 flex justify-between items-center">
                    <h2 className="font-bold text-base">{job ? 'Edit Job' : 'New Job'}</h2>
                    <button onClick={job ? () => setIsEditing(false) : onClose} className="text-gray-300 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-2 overflow-y-auto flex-1 bg-gray-50/50 custom-scrollbar">
                    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-2">

                        <div className="bg-white p-3 rounded shadow-sm border border-gray-200 space-y-3">
                            <div className="border-b border-gray-100 pb-2 mb-2">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Job Details</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Name<span className="text-red-500">*</span></label>
                                    <input
                                        className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.customerName || ''}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        required
                                        placeholder="e.g. Retail Corp"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Reference</label>
                                    <input
                                        className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.emailReference || ''}
                                        onChange={e => setFormData({ ...formData, emailReference: e.target.value })}
                                        placeholder="#REF-123"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded shadow-sm border border-gray-200 space-y-3">
                            <div className="border-b border-gray-100 pb-2 mb-2">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Route & Cargo</h3>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Address<span className="text-red-500">*</span></label>
                                <input
                                    className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.pickupAddress || ''}
                                    onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })}
                                    required
                                    placeholder="Pickup Location"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Address<span className="text-red-500">*</span></label>
                                <input
                                    className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.deliveryAddress || ''}
                                    onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                    required
                                    placeholder="Delivery Location"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight (Kg)<span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.weightKg || ''}
                                        onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Volume (m³)<span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.volumeCbm || ''}
                                        onChange={e => setFormData({ ...formData, volumeCbm: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Req. Vehicle</label>
                                    <select
                                        className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.requiredVehicleType || 'Truck'}
                                        onChange={e => setFormData({ ...formData, requiredVehicleType: e.target.value })}
                                    >
                                        <option value="Truck">Truck</option>
                                        <option value="Van">Van</option>
                                        <option value="Bike">Bike</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.requestedPickupTime ? new Date(formData.requestedPickupTime).toISOString().slice(0, 16) : ''}
                                        onChange={e => setFormData({ ...formData, requestedPickupTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Instructions</label>
                                <textarea
                                    className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.specialInstructions || ''}
                                    onChange={e => setFormData({ ...formData, specialInstructions: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded font-semibold text-xs hover:bg-blue-700 shadow-sm">
                                {isSubmitting ? 'Saving...' : 'Save Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </Wrapper>
        );
    }

    if (!job) return null;

    // --- VIEW MODE ---
    return (
        <Wrapper>
            {/* Header */}
            <div className="bg-[#4d5761] text-white px-3 py-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                        <Package size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-tight">{job.customerName}</h1>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wider">Job • {job.status}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-300 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {/* Quick Actions / Tabs Mock */}
            <div className="bg-[#4d5761] text-gray-300 flex px-2 border-t border-white/10">
                <div className="px-3 py-2 border-b-2 border-white text-white font-medium text-[11px] cursor-pointer">
                    Details
                </div>
                <div className="px-3 py-2 hover:bg-white/5 border-b-2 border-transparent hover:text-white text-[11px] cursor-pointer transition-colors">
                    History
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">

                {/* Card: Route */}
                <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Route Mapping</h2>
                    </div>

                    <MapDisplay
                        markers={[
                            { lat: 0, lng: 0, label: 'Pickup: ' + job.pickupAddress, type: 'pickup' },
                            { lat: 0, lng: 0, label: 'Delivery: ' + job.deliveryAddress, type: 'delivery' }
                        ]}
                        height="150px"
                        showRoute
                    />

                    <div className="p-2 space-y-3">
                        <div className="flex items-start gap-2">
                            <MapPin size={12} className="text-green-600 mt-0.5" />
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase">Pickup</div>
                                <div className="text-xs font-medium text-gray-800 leading-snug">{job.pickupAddress}</div>
                                {job.requestedPickupTime && <div className="text-[10px] text-gray-400 mt-0.5"><Calendar size={10} className="inline mr-1" />{new Date(job.requestedPickupTime).toLocaleString()}</div>}
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin size={12} className="text-red-500 mt-0.5" />
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase">Delivery</div>
                                <div className="text-xs font-medium text-gray-800 leading-snug">{job.deliveryAddress}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card: Cargo */}
                <div className="bg-white rounded shadow-sm border border-gray-200">
                    <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cargo & Specs</h3>
                    </div>
                    <div className="p-2 grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase">Weight</div>
                            <div className="text-xs font-medium text-gray-800">{job.weightKg} kg</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase">Volume</div>
                            <div className="text-xs font-medium text-gray-800">{job.volumeCbm} m³</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase">Vehicle Type</div>
                            <div className="text-xs font-medium text-gray-800">{job.requiredVehicleType}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase">Ref</div>
                            <div className="text-xs font-medium text-gray-800">{job.emailReference || '--'}</div>
                        </div>
                    </div>
                </div>

                {job.specialInstructions && (
                    <div className="bg-white rounded shadow-sm border border-gray-200 p-2">
                        <div className="text-[10px] text-gray-400 uppercase mb-1">Instructions</div>
                        <div className="text-xs text-gray-700">{job.specialInstructions}</div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 p-2 flex justify-end gap-2">
                {job.status !== 'Cancelled' && (
                    <button
                        onClick={() => onDelete(job.id)}
                        className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Cancel
                    </button>
                )}
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 rounded-full bg-gray-800 text-white text-[10px] font-semibold hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                    <Edit size={12} /> Edit Details
                </button>
            </div>
        </Wrapper>
    );
};
