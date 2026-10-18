import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SortableList from '@/Components/SortableList';
import AppIcon, { IconPicker } from '@/Components/AppIcon';

function TypeRow({ type, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
            {type.icon && <span className="w-6 flex justify-center text-gray-500"><AppIcon name={type.icon} className="w-5 h-5" /></span>}
            <span className="flex-1 text-sm font-medium text-gray-800">{type.name}</span>
            <span className="text-xs text-gray-400 font-mono">{type.slug}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {type.is_active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={() => onEdit(type)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
            <button onClick={() => onDelete(type)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
    );
}

function TypeForm({ type, onDone }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:      type?.name      ?? '',
        icon:      type?.icon      ?? '',
        is_active: type?.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();
        const url = type ? `/settings/property-types/${type.id}` : '/settings/property-types';
        const method = type ? patch : post;
        method(url, { onSuccess: () => { reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Apartment"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                    <IconPicker value={data.icon} onChange={(v) => setData('icon', v)} />
                </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="rounded accent-indigo-600" />
                Active
            </label>
            <div className="flex gap-2">
                <button type="submit" disabled={processing}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {type ? 'Save' : 'Add type'}
                </button>
                <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function PropertyTypesIndex({ types: initial }) {
    const [types, setTypes] = useState(initial);
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);

    function handleReorder(newItems) {
        setTypes(newItems);
        router.patch('/settings/property-types/reorder', { items: newItems.map((t) => t.id) }, { preserveScroll: true });
    }

    function handleDelete(type) {
        if (!confirm(`Delete "${type.name}"?`)) return;
        router.delete(`/settings/property-types/${type.id}`, {
            preserveScroll: true,
            onSuccess: () => setTypes((t) => t.filter((x) => x.id !== type.id)),
        });
    }

    function refresh() {
        setEditing(null);
        setAdding(false);
        router.reload({ only: ['types'], preserveScroll: true });
    }

    return (
        <AppLayout title="Property Types">
            <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Define property categories available system-wide. Drag to reorder.</p>
                    {!adding && (
                        <button onClick={() => setAdding(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                            + Add type
                        </button>
                    )}
                </div>

                {adding && <TypeForm onDone={refresh} />}

                <SortableList
                    items={types}
                    onReorder={handleReorder}
                    renderItem={(type) =>
                        editing?.id === type.id ? (
                            <TypeForm type={type} onDone={refresh} />
                        ) : (
                            <TypeRow type={type} onEdit={setEditing} onDelete={handleDelete} />
                        )
                    }
                />

                {types.length === 0 && !adding && (
                    <div className="text-center py-12 text-gray-400 text-sm">No property types yet.</div>
                )}
            </div>
        </AppLayout>
    );
}
