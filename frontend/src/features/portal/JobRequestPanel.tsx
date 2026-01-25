import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package } from 'lucide-react';
import { createJobRequest, type CreateJobRequestDto } from '../../services/jobRequestService';

interface JobRequestPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void; // Trigger reload
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col bg-gray-50/50 w-full border-l border-gray-200">
        {children}
    </div>
);

export const JobRequestPanel: React.FC<JobRequestPanelProps> = ({ isOpen, onClose, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateJobRequestDto>({
        preferredDate: new Date().toISOString().split('T')[0],
        pickupLocation: '',
        dropLocation: '',
        cargoDescription: '',
        volume: 0,
        weight: 0
    });

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setFormData({
                preferredDate: new Date().toISOString().split('T')[0],
                pickupLocation: '',
                dropLocation: '',
                cargoDescription: '',
                volume: 0,
                weight: 0
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createJobRequest(formData);
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to create request", error);
            alert("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Wrapper>
            <div className="bg-[#4d5761] text-white px-3 py-3 flex justify-between items-center shadow-md z-1">
                <h2 className="font-bold text-base">New Job Request</h2>
                <button onClick={onClose} className="text-gray-300 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            <div className="p-2 overflow-y-auto flex-1 bg-gray-50/50 custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 space-y-3">
                        <div className="border-b border-gray-100 pb-2 mb-2">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Schedule</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Preferred Date</label>
                            <div className="relative">
                                <Calendar size={12} className="absolute left-2 top-2 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    className="w-full text-xs border-gray-300 rounded p-1.5 pl-7 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                    value={formData.preferredDate}
                                    onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 space-y-3">
                        <div className="border-b border-gray-100 pb-2 mb-2">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Route Information</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Location</label>
                            <div className="relative">
                                <MapPin size={12} className="absolute left-2 top-2 text-gray-400" />
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full text-xs border-gray-300 rounded p-1.5 pl-7 border focus:ring-[#4d5761] focus:border-[#4d5761] resize-none"
                                    placeholder="Enter full pickup address..."
                                    value={formData.pickupLocation}
                                    onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Drop Location</label>
                            <div className="relative">
                                <MapPin size={12} className="absolute left-2 top-2 text-green-500" />
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full text-xs border-gray-300 rounded p-1.5 pl-7 border focus:ring-[#4d5761] focus:border-[#4d5761] resize-none"
                                    placeholder="Enter full delivery address..."
                                    value={formData.dropLocation}
                                    onChange={e => setFormData({ ...formData, dropLocation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 space-y-3">
                        <div className="border-b border-gray-100 pb-2 mb-2">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cargo Details</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                            <div className="relative">
                                <Package size={12} className="absolute left-2 top-2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full text-xs border-gray-300 rounded p-1.5 pl-7 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                    placeholder="e.g. 50 Boxes of Electronics"
                                    value={formData.cargoDescription}
                                    onChange={e => setFormData({ ...formData, cargoDescription: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Volume (m³)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                    value={formData.volume}
                                    onChange={e => setFormData({ ...formData, volume: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Wrapper>
    );
};
