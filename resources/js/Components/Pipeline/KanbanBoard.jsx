import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import DealCard from './DealCard';

export default function KanbanBoard({ columns: initial }) {
    const [columns, setColumns]     = useState(initial);
    const [activeCard, setActiveCard] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    function findCard(dealId) {
        for (const col of columns) {
            const card = col.deals.find(d => d.id === dealId);
            if (card) return { card, colId: col.id };
        }
        return null;
    }

    function onDragStart({ active }) {
        const id = Number(active.id.toString().replace('deal-', ''));
        const found = findCard(id);
        if (found) setActiveCard(found.card);
    }

    function onDragEnd({ active, over }) {
        setActiveCard(null);
        if (!over) return;

        const dealId      = Number(active.id.toString().replace('deal-', ''));
        const toColId     = Number(over.id.toString().replace('col-', ''));
        const found       = findCard(dealId);
        if (!found || found.colId === toColId) return;

        const { card } = found;

        setColumns(cols =>
            cols.map(col => {
                if (col.id === found.colId) return { ...col, deals: col.deals.filter(d => d.id !== dealId) };
                if (col.id === toColId)     return { ...col, deals: [card, ...col.deals] };
                return col;
            })
        );

        router.patch(`/deals/${dealId}/stage`, { stage_id: toColId }, {
            preserveScroll: true,
            onError: () => setColumns(initial),
        });
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-96">
                {columns.map(col => (
                    <KanbanColumn key={col.id} column={col} />
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeCard ? <DealCard deal={activeCard} isDragging /> : null}
            </DragOverlay>
        </DndContext>
    );
}
