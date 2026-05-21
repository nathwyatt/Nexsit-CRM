import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableRow({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2">
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 px-1 py-2 touch-none select-none"
                aria-label="Drag to reorder"
            >
                ⠿
            </button>
            <div className="flex-1">{children}</div>
        </div>
    );
}

/**
 * items: array of objects with at least { id }
 * onReorder: (newItems) => void — called with reordered array after drop
 * renderItem: (item) => JSX
 */
export default function SortableList({ items, onReorder, renderItem }) {
    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd({ active, over }) {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        onReorder(arrayMove(items, oldIndex, newIndex));
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                    {items.map((item) => (
                        <SortableRow key={item.id} id={item.id}>
                            {renderItem(item)}
                        </SortableRow>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
