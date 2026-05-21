import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SortableList from '@/Components/SortableList';

function TypeRow({ type, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
            <span className="flex-1 text-sm font-medium text-gray-800">{type.name}</span>
            {type.requires_expiry && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Expiry required</span>
            )}
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
        name:            type?.name            ?? '',
        requires_expiry: type?.requires_expiry ?? false,
        is_active:       type?.is_active       ?? true,
    });

    function submit(e) {
        e.preventDefault();
        const url = type ? `/settings/document-types/${type.id}` : '/settings/document-types';
        const method = type ? patch : post;
        method(url, { onSuccess: () => { reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-4 space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Passport"
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={data.requires_expiry}
                        onChange={(e) => setData('requires_expiry', e.target.checked)}
                        className="rounded accent-indigo-600" />
                    Requires expiry date
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded accent-indigo-600" />
                    Active
                </label>
            </div>
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

export default function DocumentTypesIndex({ types: initial }) {
    const [types, setTypes] = useState(initial);
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);

    function handleReorder(newItems) {
        setTypes(newItems);
        router.patch('/settings/document-types/reorder', { items: newItems.map((t) => t.id) }, { preserveScroll: true });
    }

    function handleDelete(type) {
        if (!confirm(`Delete "${type.name}"?`)) return;
        router.delete(`/settings/document-types/${type.id}`, {
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
        <AppLayout title="Document Types">
            <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Define document categories for contacts and tenancies. Drag to reorder.</p>
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
                    <div className="text-center py-12 text-gray-400 text-sm">No document types yet.</div>
                )}
            </div>
        </AppLayout>
    );
}
