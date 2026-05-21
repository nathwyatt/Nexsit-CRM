import { Link } from '@inertiajs/react';
import { useDraggable } from '@dnd-kit/core';

export default function DealCard({ deal, isDragging = false }) {
    const { attributes, listeners, setNodeRef, transform, isDragging: isSource } = useDraggable({
        id: `deal-${deal.id}`,
    });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm select-none transition-opacity ${
                isSource ? 'opacity-30' : ''
            } ${isDragging ? 'shadow-xl rotate-1' : ''}`}
        >
            <div className="flex items-start gap-2">
                <div
                    {...listeners}
                    className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab shrink-0 touch-none"
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="7" cy="4"  r="1.5"/><circle cx="13" cy="4"  r="1.5"/>
                        <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
                        <circle cx="7" cy="16" r="1.5"/><circle cx="13" cy="16" r="1.5"/>
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/deals/${deal.id}`}
                        className="block text-sm font-medium text-gray-900 hover:text-emerald-600 truncate leading-tight"
                    >
                        {deal.title}
                    </Link>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{deal.reference}</p>
                </div>
            </div>

            {deal.value && (
                <p className="mt-2 text-sm font-semibold text-gray-800">
                    {deal.currency} {Number(deal.value).toLocaleString()}
                </p>
            )}

            <div className="mt-2 flex items-center justify-between gap-2">
                {deal.contact && (
                    <span className="text-xs text-gray-500 truncate">{deal.contact.name}</span>
                )}
                {deal.assigned_to && (
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 shrink-0">
                        {deal.assigned_to.name.split(' ')[0]}
                    </span>
                )}
            </div>

            {deal.expected_close_date && (
                <p className="mt-1.5 text-xs text-gray-400">Close: {deal.expected_close_date}</p>
            )}
        </div>
    );
}
