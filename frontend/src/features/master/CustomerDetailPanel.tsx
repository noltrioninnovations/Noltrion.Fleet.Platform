import React from 'react';
import type { Customer } from '../../services/customerService';
import { X, Phone, Mail, MapPin, Edit, Building } from 'lucide-react';

interface CustomerDetailPanelProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full flex flex-col bg-gray-50/50 w-full">
        {children}
    </div>
);

export const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({
    customer,
    isOpen,
    onClose,
    onEdit
}) => {
    if (!isOpen || !customer) return null;

    // --- VIEW MODE ---
    return (
        <Wrapper>
            {/* Header */}
            <div className="bg-[#4d5761] text-white px-3 py-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                        <Building size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-tight">{customer.name}</h1>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wider">Customer</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
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

            {/* Quick Actions / Tabs Mock */}
            <div className="bg-[#4d5761] text-gray-300 flex px-2 border-t border-white/10">
                <div className="px-3 py-2 border-b-2 border-white text-white font-medium text-[11px] cursor-pointer">
                    Overview
                </div>
                <div className="px-3 py-2 hover:bg-white/5 border-b-2 border-transparent hover:text-white text-[11px] cursor-pointer transition-colors">
                    Orders
                </div>
                <div className="px-3 py-2 hover:bg-white/5 border-b-2 border-transparent hover:text-white text-[11px] cursor-pointer transition-colors">
                    Invoices
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">

                {/* Card: Contact Info */}
                <div className="bg-white rounded shadow-sm border border-gray-200">
                    <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact Information</h3>
                    </div>
                    <div className="p-2 space-y-2">
                        <div className="flex items-center gap-3">
                            <Mail size={14} className="text-gray-400" />
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase">Email</div>
                                <div className="text-xs font-medium text-gray-800">{customer.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={14} className="text-gray-400" />
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase">Phone</div>
                                <div className="text-xs font-medium text-gray-800">{customer.phone || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin size={14} className="text-gray-400 mt-1" />
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase">Address</div>
                                <div className="text-xs font-medium text-gray-800">{customer.address || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </Wrapper>
    );
};
