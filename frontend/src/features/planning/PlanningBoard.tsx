import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { generatePlan, confirmPlan } from '../../services/planningService';
import type { Job, TripCandidate } from '../../types/planning';

// --- Components ---

// --- Components ---

const JobCard = ({ job, isOverlay = false }: { job: Job; isOverlay?: boolean }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job.id, data: { type: 'Job', job } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const cardClasses = isOverlay
        ? "bg-white p-3 rounded-md shadow-xl border border-blue-500 cursor-grabbing z-50 ring-2 ring-blue-100"
        : "bg-white p-3 rounded-md shadow-sm border border-slate-200 mb-2 cursor-grab hover:border-blue-400 active:cursor-grabbing hover:shadow-md transition-all";

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cardClasses}
        >
            <div className="flex justify-between items-start">
                <div className="font-semibold text-xs text-slate-800 line-clamp-1" title={job.customerName}>{job.customerName}</div>
                <div className="text-[10px] font-mono text-slate-500">{job.weightKg}kg</div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight" title={job.deliveryAddress}>
                {job.deliveryAddress}
            </div>
            {job.requiredVehicleType && (
                <div className="mt-2 text-[10px] inline-block bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    {job.requiredVehicleType}
                </div>
            )}
        </div>
    );
};

const DroppableColumn = ({ id, title, jobs, meta }: { id: string, title: string, jobs: Job[], meta?: React.ReactNode }) => {
    const { setNodeRef } = useSortable({ id, data: { type: 'Column' } });

    return (
        <div ref={setNodeRef} className="bg-slate-100/50 p-1.5 rounded-lg w-72 flex-shrink-0 flex flex-col h-full max-h-[80vh] border border-slate-200 shadow-inner">
            <div className="p-2 mb-2 bg-white rounded-md border border-slate-200 shadow-sm sticky top-0 z-10">
                <h3 className="font-bold text-sm text-slate-700 truncate" title={title}>{title}</h3>
                {meta && <div className="mt-1">{meta}</div>}
            </div>

            <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div className="overflow-y-auto flex-1 min-h-[100px] px-1 scrollbar-thin scrollbar-thumb-slate-300">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                    {jobs.length === 0 && (
                        <div className="h-full flex items-center justify-center p-4">
                            <div className="text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded p-4 w-full">
                                Drop jobs here
                            </div>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// --- Main Board ---

export const PlanningBoard: React.FC = () => {
    // const [plan, setPlan] = useState<PlanningResult | null>(null); // Unused
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // UI State for D&D (mirrors plan but mutable)
    // Structure: { "unplanned": Job[], "trip-{guid}": Job[] }
    const [items, setItems] = useState<Record<string, Job[]>>({});
    const [tripMeta, setTripMeta] = useState<Record<string, TripCandidate>>({});

    // const [activeId, setActiveId] = useState<string | null>(null);
    const [activeJob, setActiveJob] = useState<Job | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await generatePlan();
            // setPlan(data);

            // Initialize State
            const newItems: Record<string, Job[]> = {
                'unplanned': data.unplannedJobs
            };
            const newMeta: Record<string, TripCandidate> = {};

            data.trips.forEach(t => {
                const tripKey = `trip-${t.vehicleId}`; // assuming 1 trip per vehicle for MVP
                newItems[tripKey] = t.jobs;
                newMeta[tripKey] = t;
            });

            setItems(newItems);
            setTripMeta(newMeta);
        } catch (err: any) {
            setError('Failed to generate plan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!Object.keys(items).some(k => k.startsWith('trip-') && items[k].length > 0)) {
            alert("No trips to save.");
            return;
        }

        setSaving(true);
        setError('');
        try {
            // Construct payload from current UI state
            const tripsToSave: TripCandidate[] = Object.keys(items)
                .filter(key => key.startsWith('trip-') && items[key].length > 0)
                .map(key => {
                    // Get existing meta if any (for vehicleId/driverId)
                    // or construct new. Ideally preservation of meta is better.
                    const vehicleId = key.replace('trip-', '');
                    const existingMeta = tripMeta[key];

                    return {
                        jobIds: items[key].map(j => j.id),
                        jobs: [], // Backend doesn't need full job objects for confirm
                        vehicleId: vehicleId,
                        driverId: existingMeta?.driverId,
                        utilizationScore: 0, // Backend recalcs
                        totalDistance: 0, // Backend recalcs
                        estimatedCost: 0, // Backend recalcs
                        estimatedDuration: "00:00:00"
                    };
                });

            await confirmPlan(tripsToSave);
            alert("Plan confirmed and saved successfully!");
            // Optionally refresh or clear
            setItems({});
            setTripMeta({});
        } catch (err: any) {
            setError('Failed to save plan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const findContainer = (id: string): string | undefined => {
        if (id in items) return id;
        return Object.keys(items).find(key => items[key].find(j => j.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const id = active.id as string;
        // setActiveId(id);

        // Find job data for overlay
        const container = findContainer(id);
        if (container) {
            const job = items[container].find(j => j.id === id);
            setActiveJob(job || null);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId) || (overId in items ? overId : null);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex(i => i.id === activeId);
            const overIndex = overItems.findIndex(i => i.id === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter(item => item.id !== activeId)
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                ]
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;
        const overId = over ? over.id as string : null;

        const activeContainer = findContainer(activeId);
        const overContainer = overId ? (findContainer(overId) || (overId in items ? overId : null)) : null;

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            // Already handled by dragOver mostly, but could finalize server sync here
        }

        if (activeContainer && overContainer && activeContainer === overContainer) {
            // Reorder within same col
            const activeIndex = items[activeContainer].findIndex(j => j.id === activeId);
            const overIndex = items[overContainer].findIndex(j => j.id === overId);

            if (activeIndex !== overIndex) {
                setItems((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex)
                }));
            }
        }

        // setActiveId(null);
        setActiveJob(null);
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-slate-50">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Operational Planning Board</h1>
                    <p className="text-xs text-slate-500 mt-1">Drag and drop jobs to assign them to vehicles.</p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || saving}
                        className="btn btn-secondary text-xs"
                    >
                        {loading ? 'Generating...' : 'Auto-Generate Plan'}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="btn btn-primary text-xs"
                    >
                        {saving ? 'Saving...' : 'Confirm & Save Plan'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex h-full space-x-4 min-w-max">
                        {/* Unplanned Column */}
                        {items['unplanned'] && (
                            <DroppableColumn
                                id="unplanned"
                                title="Unplanned Jobs"
                                jobs={items['unplanned']}
                                meta={
                                    <div className="flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded w-fit">
                                        <span className="text-red-500 mr-1">{items['unplanned'].length}</span> pending
                                    </div>
                                }
                            />
                        )}

                        {/* Trip Columns */}
                        {Object.keys(items).filter(k => k !== 'unplanned').map(key => {
                            const trip = tripMeta[key];
                            // Calc total weight on fly based on current items
                            const currentWeight = items[key].reduce((sum, j) => sum + j.weightKg, 0);
                            const count = items[key].length;

                            return (
                                <DroppableColumn
                                    key={key}
                                    id={key}
                                    title={`Vehicle: ${trip?.vehicleId || 'Unknown'}`}
                                    jobs={items[key]}
                                    meta={
                                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 mt-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                                            <span className="font-semibold">{count} jobs</span>
                                            <span className="text-slate-300">|</span>
                                            <span className={currentWeight > (trip?.utilizationScore ? 9999 : 0) ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                                {currentWeight}kg
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="font-mono">S${trip?.estimatedCost.toFixed(0)}</span>
                                        </div>
                                    }
                                />
                            );
                        })}
                    </div>
                </div>

                <DragOverlay>
                    {activeJob ? <JobCard job={activeJob} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
