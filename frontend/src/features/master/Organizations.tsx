import React, { useEffect, useState } from 'react';
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '../../services/organizationService';
import type { Organization } from '../../services/organizationService';
import { Plus, Edit, Trash, X, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { InfoTooltip } from '../../components/ui/InfoTooltip'; // Assuming exists, reusing from Drivers/others

export const Organizations: React.FC = () => {
    const { success, error: showError } = useToast();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Organization>>({ isActive: true });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        setIsLoading(true);
        try {
            const data = await getOrganizations();
            setOrganizations(data);
        } catch (err: any) {
            showError(err.message || "Failed to load organizations");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors([]);

        if (!formData.code || !formData.name) {
            setErrors(["Code and Name are required."]);
            setIsSubmitting(false);
            return;
        }

        try {
            let result;
            const payload = {
                code: formData.code,
                name: formData.name,
                address: formData.address || '',
                isActive: formData.isActive || false
            };

            if (editingId) {
                result = await updateOrganization(editingId, payload);
            } else {
                result = await createOrganization(payload);
            }

            if (result.succeeded) {
                success(editingId ? "Organization updated successfully" : "Organization created successfully");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ isActive: true });
                loadOrganizations();
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    showError("Operation failed");
                }
            }
        } catch (error) {
            console.error("Failed to save", error);
            showError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (org: Organization) => {
        setEditingId(org.id);
        setFormData({ ...org });
        setErrors([]);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this organization?")) return;
        try {
            const result = await deleteOrganization(id);
            if (result.succeeded) {
                success("Organization deleted successfully");
                loadOrganizations();
            } else {
                showError(result.errors ? result.errors[0] : "Failed to delete organization");
            }
        } catch (error) {
            console.error(error);
            showError("An unexpected error occurred");
        }
    };

    const openNew = () => {
        setEditingId(null);
        setFormData({ isActive: true });
        setErrors([]);
        setIsModalOpen(true);
    };

    const filteredOrgs = organizations.filter(o =>
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Organizations</h2>
                    <p className="text-sm text-slate-500">Manage company entities structure.</p>
                </div>
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={openNew}
                        className="btn btn-primary flex items-center"
                    >
                        <Plus size={18} className="mr-2" /> Add Organization
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
                </div>
            ) : (
                <div className="table-container shadow-sm border border-slate-200">
                    <div className="overflow-x-auto max-h-[calc(100vh-220px)]">
                        <table className="table-auto w-full">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="th-dense w-1/6">Code</th>
                                    <th className="th-dense w-1/4">Name</th>
                                    <th className="th-dense w-1/3">Address</th>
                                    <th className="th-dense text-center">Status</th>
                                    <th className="th-dense text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredOrgs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No organizations found.</td>
                                    </tr>
                                )}
                                {filteredOrgs.map((org) => (
                                    <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="td-dense font-mono text-slate-700">{org.code}</td>
                                        <td className="td-dense font-semibold text-slate-800">{org.name}</td>
                                        <td className="td-dense text-slate-600 truncate max-w-xs">{org.address}</td>
                                        <td className="td-dense text-center">
                                            <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wide rounded-full border 
                                                ${org.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {org.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="td-dense text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(org)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50" title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(org.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50" title="Delete">
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit' : 'New'} Organization</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X size={20} /></button>
                        </div>

                        {errors.length > 0 && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm">
                                <ul className="list-disc list-inside">
                                    {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="input-label">Code <span className="text-red-500">*</span>
                                    <InfoTooltip text="Unique identifier for the organization" />
                                </label>
                                <input
                                    className="input-base w-full"
                                    value={formData.code || ''}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    placeholder="e.g. ORG001"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label className="input-label">Name <span className="text-red-500">*</span>
                                    <InfoTooltip text="Legal name of the organization" />
                                </label>
                                <input
                                    className="input-base w-full"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Acme Corp"
                                    maxLength={150}
                                />
                            </div>
                            <div>
                                <label className="input-label">Address</label>
                                <textarea
                                    className="input-base w-full h-24 resize-none"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full address..."
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="ml-2 text-sm text-slate-700 font-medium">Is Active</span>
                                </label>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-secondary mr-3"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
