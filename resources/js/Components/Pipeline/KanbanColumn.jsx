import { useDroppable } from '@dnd-kit/core';
import DealCard from './DealCard';

export default function KanbanColumn({ column }) {
    const { setNodeRef, isOver } = useDroppable({ id: `col-${column.id}` });

    return (
        <div className="flex flex-col w-72 shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold text-sm text-gray-700 flex-1 truncate">{column.name}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                    {column.deals.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 min-h-32 rounded-xl p-2 space-y-2 transition-colors border-2 ${
                    isOver
                        ? 'bg-emerald-50 border-emerald-300 border-dashed'
                        : 'bg-gray-50 border-transparent'
                }`}
            >
                {column.deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))}

                {column.deals.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-gray-400">
                        No deals
                    </div>
                )}
            </div>
        </div>
    );
}
