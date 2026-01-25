import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Trip, TripPackage } from '../../types/trip';
import { X, Calendar, Truck, User, Building, Package, Plus, Trash2, MapPin, FileText } from 'lucide-react';
import { getVehicles } from '../../services/vehicleService';
import { getDrivers } from '../../services/driverService';
import { getCustomers } from '../../services/customerService';

interface TripEditPanelProps {
    trip: Trip | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (trip: any) => Promise<void>;
    isSubmitting: boolean;
    prefillData?: any;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col bg-gray-50/50 w-full border-l border-gray-200">
        {children}
    </div>
);

export const TripEditPanel: React.FC<TripEditPanelProps> = ({
    trip,
    isOpen,
    onClose,
    onSave,
    isSubmitting,
    prefillData
}) => {
    const { user } = useAuth();
    const isOps = user?.roles?.some(r => r === 'Operations' || r === 'Admin' || r === 'Manager');

    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<string[]>([]);

    // Tab State
    const [activeTab, setActiveTab] = useState<'general' | 'resources' | 'route' | 'cargo'>('general');

    // Dropdown Data
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadMasterData();
            if (trip) {
                setFormData({
                    ...trip,
                    tripDate: trip.tripDate ? trip.tripDate.split('T')[0] : '',
                    startTime: trip.startTime ? new Date(trip.startTime).toISOString().slice(11, 16) : '',
                    endTime: trip.endTime ? new Date(trip.endTime).toISOString().slice(11, 16) : '',
                    timeWindowFrom: trip.timeWindowFrom || '',
                    timeWindowTo: trip.timeWindowTo || '',
                    proofOfDeliveryRequired: trip.proofOfDeliveryRequired || false,
                    truckType: trip.truckType || '14FT',
                    numberOfTrips: trip.numberOfTrips || 1,
                    totalCost: trip.totalCost || 0,

                    pickupLocation: trip.pickupLocation || '',
                    dropLocation: trip.dropLocation || '',

                    chargesType: trip.chargesType || 'Adhoc',
                    packages: trip.packages || []
                });
            } else {
                // CREATE MODE - Check for prefill
                let defaults = {
                    tripDate: new Date().toISOString().split('T')[0],
                    truckType: '',
                    numberOfTrips: 1,
                    chargesType: 'Adhoc',
                    proofOfDeliveryRequired: false,
                    pickupLocation: '',
                    dropLocation: '',
                    totalCost: 0,
                    packages: [] as any[]
                };

                if (prefillData) {
                    defaults = { ...defaults, ...prefillData };
                }

                setFormData(defaults);
            }
            setErrors([]);
            setActiveTab('general');
        }
    }, [isOpen, trip, prefillData]);

    const loadMasterData = async () => {
        const [v, d, c] = await Promise.all([getVehicles(), getDrivers(), getCustomers()]);
        setVehicles(v);
        setDrivers(d);
        setCustomers(c);
    };

    const validate = () => {
        const errs = [];

        // if (formData.tripDate < today && !trip) errs.push("Trip date cannot be a past date");

        if (formData.startTime && formData.endTime) {
            if (formData.endTime <= formData.startTime && !formData.proofOfDeliveryRequired) errs.push("End time must be greater than start time");
        }

        if (formData.timeWindowFrom && formData.timeWindowTo) {
            if (formData.timeWindowTo <= formData.timeWindowFrom) errs.push("Window To must be > From");
        }

        // Resources are optional for creation
        // Only enforce if user is trying to set status to Assigned explicitly?
        // Or if Ops Manager is "Assigning"?
        // For now, relax completely as Backend handles the status logic.

        // if (!formData.vehicleId) errs.push("Truck is required");
        // if (!formData.driverId) errs.push("Driver is required");

        if (formData.numberOfTrips < 1) errs.push("Number of trips must be >= 1");

        if (formData.packages && formData.packages.length > 0) {
            formData.packages.forEach((pkg: TripPackage, idx: number) => {
                if (pkg.quantity <= 0) errs.push(`Item ${idx + 1}: Quantity must be > 0`);
                if (pkg.packageType === "Pallets" && (!pkg.noOfPallets || pkg.noOfPallets <= 0))
                    errs.push(`Item ${idx + 1}: No of Pallets required`);
            });
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        // If times are not provided, don't construct date objects that might be invalid
        const fullStartDate = formData.startTime ? new Date(`${formData.tripDate}T${formData.startTime}:00Z`) : null;
        const fullEndDate = formData.endTime ? new Date(`${formData.tripDate}T${formData.endTime}:00Z`) : null;

        onSave({
            ...formData,
            startTime: fullStartDate,
            endTime: fullEndDate
        });
    };

    const addPackage = () => {
        const newPkg: TripPackage = { packageType: 'Box', quantity: 1 };
        setFormData({ ...formData, packages: [...(formData.packages || []), newPkg] });
    };

    const updatePackage = (index: number, field: keyof TripPackage, value: any) => {
        const pkgs = [...(formData.packages || [])];
        pkgs[index] = { ...pkgs[index], [field]: value };
        setFormData({ ...formData, packages: pkgs });
    };

    const removePackage = (index: number) => {
        const pkgs = [...(formData.packages || [])];
        pkgs.splice(index, 1);
        setFormData({ ...formData, packages: pkgs });
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 flex-1 border-b-2 transition-colors ${activeTab === id
                ? 'border-gray-800 text-gray-800 bg-gray-100'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
        >
            <Icon size={16} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
        </button>
    );

    if (!isOpen) return null;

    return (
        <Wrapper>
            {/* Header - Neutral Enterprise Theme */}
            <div className="bg-[#4d5761] text-white px-3 py-2 flex justify-between items-center shadow-md z-10 sticky top-0">
                <h2 className="font-bold text-base">{trip ? (trip.tripNumber || 'Pending') : 'New Manifest'}</h2>
                <button onClick={onClose} className="text-gray-300 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white border-b border-gray-200 shadow-sm">
                <TabButton id="general" label="Header" icon={FileText} />
                <TabButton id="resources" label="Resources" icon={Truck} />
                <TabButton id="route" label="Route" icon={MapPin} />
                <TabButton id="cargo" label="Cargo" icon={Package} />
            </div>

            {/* Validation Errors - Always Visible */}
            {errors.length > 0 && (
                <div className="bg-red-50 border-b border-red-200 text-red-700 px-3 py-2 text-xs">
                    <ul className="list-disc list-inside">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <div className="p-2 overflow-y-auto bg-gray-50 custom-scrollbar max-h-[calc(100vh-110px)]" style={{ scrollbarWidth: 'thin' }}>
                <form onSubmit={handleSubmit} className="flex flex-col">

                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="space-y-2">
                            <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Manifest Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2 top-1.5 text-gray-400" size={14} />
                                            <input
                                                type="date"
                                                className="w-full pl-8 text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                                value={formData.tripDate || ''}
                                                onChange={e => setFormData({ ...formData, tripDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Charges Type */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Charges Type</label>
                                        <select
                                            className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                            value={formData.chargesType || 'Adhoc'}
                                            onChange={e => setFormData({ ...formData, chargesType: e.target.value })}
                                        >
                                            <option value="Adhoc">Adhoc</option>
                                            <option value="Contract">Contract</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Customer - Full Width */}
                                <div className="mb-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Client / Customer</label>
                                    <div className="relative">
                                        <Building className="absolute left-2 top-1.5 text-gray-400" size={14} />
                                        <select
                                            className="w-full pl-8 text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                            value={formData.customerId || ''}
                                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Customer...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* No of Trips / Future Fields */}
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">No. of Trips</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                            value={formData.numberOfTrips || 1}
                                            onChange={e => setFormData({ ...formData, numberOfTrips: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remarks</label>
                                    <textarea
                                        className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                        rows={2}
                                        maxLength={250}
                                        value={formData.remarks || ''}
                                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: RESOURCES */}
                    {activeTab === 'resources' && (
                        <div className="bg-white p-2 rounded shadow-sm border border-gray-200 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Truck Type</label>
                                    <select
                                        className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        value={formData.truckType || ''}
                                        onChange={e => setFormData({ ...formData, truckType: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Type...</option>
                                        <option value="14FT">14FT</option>
                                        <option value="24FT">24FT</option>
                                        <option value="40FT">40FT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Truck No</label>
                                    <select
                                        className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        value={formData.vehicleId || ''}
                                        onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Driver</label>
                                <div className="relative">
                                    <User className="absolute left-2 top-1.5 text-gray-400" size={14} />
                                    <select
                                        className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        value={formData.driverId || ''}
                                        onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                                    >
                                        <option value="">Select Driver...</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Helper</label>
                                <input
                                    className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                    value={formData.helperName || ''}
                                    onChange={e => setFormData({ ...formData, helperName: e.target.value })}
                                    placeholder="Name (Optional)"
                                />
                            </div>

                            {/* Cost - Only for Ops */}
                            {isOps && (
                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tentative Cost (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500 font-bold"
                                        value={formData.totalCost || ''}
                                        onChange={e => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ROUTE (Replacing Timing) */}
                    {activeTab === 'route' && (
                        <div className="space-y-2">
                            <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    {/* Pickup */}
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Information</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-1.5 text-green-600" size={14} />
                                            <input
                                                type="text"
                                                className="w-full pl-8 text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                                value={formData.pickupLocation || ''}
                                                onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                                                placeholder="Enter Pickup Address"
                                            />
                                        </div>
                                    </div>

                                    {/* Drop */}
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Drop Information</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-1.5 text-red-500" size={14} />
                                            <input
                                                type="text"
                                                className="w-full pl-8 text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                                value={formData.dropLocation || ''}
                                                onChange={e => setFormData({ ...formData, dropLocation: e.target.value })}
                                                placeholder="Enter Drop Address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Timings - 2x2 Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                            value={formData.startTime || ''}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full text-xs border-gray-300 rounded p-1 border focus:ring-slate-500 focus:border-slate-500"
                                            value={formData.endTime || ''}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {/* Removed Window From/To Fields */}
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-2">
                                    <input
                                        type="checkbox"
                                        id="pod"
                                        className="rounded text-slate-900 focus:ring-slate-900"
                                        checked={formData.proofOfDeliveryRequired || false}
                                        onChange={e => setFormData({ ...formData, proofOfDeliveryRequired: e.target.checked })}
                                    />
                                    <label htmlFor="pod" className="text-xs font-medium text-gray-700">Proof Of Delivery (POD) Required</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: CARGO */}
                    {activeTab === 'cargo' && (
                        <div className="space-y-3">
                            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Packages ({formData.packages?.length || 0})</h3>
                                    <button
                                        type="button"
                                        onClick={addPackage}
                                        className="text-slate-700 hover:text-slate-900 text-[10px] font-bold flex items-center gap-1"
                                    >
                                        <Plus size={12} /> ADD ITEM
                                    </button>
                                </div>
                                <div className="p-3 space-y-3">
                                    {(formData.packages || []).map((pkg: TripPackage, idx: number) => (
                                        <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-50/50 relative group">
                                            <button
                                                type="button"
                                                onClick={() => removePackage(idx)}
                                                className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            <div className="grid grid-cols-2 gap-2 mb-2 pr-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Type</label>
                                                    <select
                                                        className="w-full text-xs p-1 border rounded focus:ring-slate-500"
                                                        value={pkg.packageType}
                                                        onChange={e => updatePackage(idx, 'packageType', e.target.value)}
                                                    >
                                                        <option value="Box">Box</option>
                                                        <option value="Pallets">Pallets</option>
                                                        <option value="Crate">Crate</option>
                                                        <option value="Bag">Bag</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Quantity</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs p-1 border rounded focus:ring-slate-500"
                                                        value={pkg.quantity}
                                                        onChange={e => updatePackage(idx, 'quantity', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Volume (M3)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full text-xs p-1 border rounded focus:ring-slate-500"
                                                        value={pkg.volume || ''}
                                                        onChange={e => updatePackage(idx, 'volume', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                {pkg.packageType === 'Pallets' && (
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">No of Pallets</label>
                                                        <input
                                                            type="number"
                                                            className="w-full text-xs p-1 border rounded bg-yellow-50 focus:ring-slate-500"
                                                            value={pkg.noOfPallets || ''}
                                                            onChange={e => updatePackage(idx, 'noOfPallets', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(!formData.packages || formData.packages.length === 0) && (
                                        <div className="text-center py-4 text-gray-400 text-xs">
                                            No packages added.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-transparent p-3 flex justify-end gap-3 z-10 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg"
                        >
                            {isSubmitting ? 'SAVING...' : 'SAVE MANIFEST'}
                        </button>
                    </div>
                </form>
            </div>
        </Wrapper>
    );
}
