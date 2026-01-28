import React from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface SidePanelProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    actions?: ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({
    title,
    isOpen,
    onClose,
    children,
    actions
}) => {
    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
                <div className="flex items-center gap-2">
                    {actions}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {children}
            </div>
        </div>
    );
};
