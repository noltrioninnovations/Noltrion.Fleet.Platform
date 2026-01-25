import React, { useState, useEffect } from 'react';
import type { Customer } from '../../services/customerService';
import { X } from 'lucide-react';

interface CustomerEditPanelProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Partial<Customer>) => Promise<void>;
    isSubmitting: boolean;
    errors: string[];
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col bg-gray-50/50 w-full border-l border-gray-200">
        {children}
    </div>
);

export const CustomerEditPanel: React.FC<CustomerEditPanelProps> = ({
    customer,
    isOpen,
    onClose,
    onSave,
    isSubmitting,
    errors
}) => {
    const [formData, setFormData] = useState<Partial<Customer>>({});

    useEffect(() => {
        if (isOpen) {
            if (customer) {
                setFormData(customer);
            } else {
                setFormData({});
            }
        }
    }, [isOpen, customer]);

    if (!isOpen) return null;

    return (
        <Wrapper>
            <div className="bg-[#4d5761] text-white px-3 py-3 flex justify-between items-center shadow-md z-1">
                <h2 className="font-bold text-base">{customer ? 'Edit Customer' : 'New Customer'}</h2>
                <button onClick={onClose} className="text-gray-300 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            <div className="p-2 overflow-y-auto flex-1 bg-gray-50/50 custom-scrollbar">
                <form id="customer-form" onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-2">
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
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Details</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Company Name"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.email || ''}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="contact@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs text-[10px] font-bold select-none">
                                    +65
                                </span>
                                <input
                                    className="flex-1 w-full text-xs border-gray-300 rounded-r p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                    value={formData.phone ? formData.phone.replace('+65', '') : ''}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, phone: val ? `+65${val}` : '' });
                                    }}
                                    placeholder="91234567"
                                    title="Singapore phone number"
                                    maxLength={8}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address</label>
                            <textarea
                                className="w-full text-xs border-gray-300 rounded p-1.5 border focus:ring-[#4d5761] focus:border-[#4d5761]"
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                                placeholder="Full Address"
                            />
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
                    </div>
                </form>
            </div>
        </Wrapper>
    );
}
