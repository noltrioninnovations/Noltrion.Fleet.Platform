import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer } from '../../services/customerService';
import type { Customer } from '../../services/customerService';
import {
    Loader2, Plus, RefreshCw, Search, Filter,
    Building, Mail
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { CustomerDetailPanel } from './CustomerDetailPanel';
import { CustomerEditPanel } from './CustomerEditPanel';

export const Customers: React.FC = () => {
    const { success, error: showError } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
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
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (err) {
            showError("Failed to load customers");
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

    const handleSave = async (customerData: Partial<Customer>) => {
        setIsSubmitting(true);
        setErrors([]);
        try {
            let result;
            if (selectedId && !isCreating) {
                result = await updateCustomer(selectedId, customerData);
            } else {
                result = await createCustomer(customerData);
            }

            if (result.success) {
                success(isCreating ? "Customer created" : "Customer updated");
                loadCustomers();
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

    const getSelectedCustomer = () => {
        if (isCreating) return null;
        return customers.find(c => c.id === selectedId) || null;
    };

    // --- Sidebar List Content ---
    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Tabs */}
            <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-white">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Customers ({customers.length})</span>
                <div className="ml-auto flex gap-1">
                    <button onClick={loadCustomers} className="p-1 hover:bg-gray-100 rounded text-gray-500">
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
                        placeholder="Search customers..."
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
                ) : customers.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-gray-400">No customers found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {customers.map((c) => {
                            const isSelected = selectedId === c.id;
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => handleRowClick(c.id)}
                                    className={`
                                        flex items-start p-2 cursor-pointer transition-colors group relative
                                        ${isSelected ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    {/* Left: Icon */}
                                    <div className="relative mr-2.5 mt-0.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500">
                                            <Building size={14} />
                                        </div>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {c.name}
                                            </h4>
                                        </div>

                                        <div className="text-[10px] text-gray-500 mt-px truncate flex items-center gap-2">
                                            <span className="flex items-center truncate"><Mail size={9} className="mr-1 opacity-70" /> {c.email}</span>
                                            {c.address && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="truncate">{c.address.substring(0, 15)}...</span>
                                                </>
                                            )}
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
                    <CustomerEditPanel
                        customer={null}
                        isOpen={true}
                        onClose={handleClosePanel}
                        onSave={handleSave}
                        isSubmitting={isSubmitting}
                        errors={errors}
                    />
                ) : (
                    <CustomerDetailPanel
                        isOpen={isPanelOpen}
                        onClose={handleClosePanel}
                        customer={getSelectedCustomer()}
                        onEdit={handleEditExisting}
                    />
                )
            }
            isPanelOpen={isPanelOpen}
            backgroundMarkers={customers.map(c => ({
                lat: 0, lng: 0,
                label: c.name,
                type: 'pickup' as const
            }))}

            secondaryContent={
                <CustomerEditPanel
                    customer={getSelectedCustomer()}
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
