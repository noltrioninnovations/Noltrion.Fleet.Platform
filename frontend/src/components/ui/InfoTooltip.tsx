import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
    return (
        <div className="group relative inline-block ml-2 cursor-help">
            <Info size={14} className="text-slate-400 group-hover:text-primary" />
            <div className="invisible group-hover:visible absolute z-10 w-48 p-2 mt-1 text-xs text-white bg-slate-800 rounded shadow-lg -left-20">
                {text}
            </div>
        </div>
    );
};
