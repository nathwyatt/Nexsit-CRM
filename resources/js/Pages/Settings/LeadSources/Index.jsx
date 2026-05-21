import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SortableList from '@/Components/SortableList';

function SourceRow({ source, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
            {source.icon && <span className="text-lg w-6 text-center">{source.icon}</span>}
            <span className="flex-1 text-sm font-medium text-gray-800">{source.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {source.is_active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={() => onEdit(source)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
            <button onClick={() => onDelete(source)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
    );
}

function SourceForm({ source, onDone }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:      source?.name      ?? '',
        icon:      source?.icon      ?? '',
        is_active: source?.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();
        const url = source ? `/settings/lead-sources/${source.id}` : '/settings/lead-sources';
        const method = source ? patch : post;
        method(url, { onSuccess: () => { reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Property Finder"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Icon (emoji)</label>
                    <input value={data.icon} onChange={(e) => setData('icon', e.target.value)}
                        placeholder="🏠"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                    {source ? 'Save' : 'Add source'}
                </button>
                <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function LeadSourcesIndex({ sources: initial }) {
    const [sources, setSources] = useState(initial);
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);

    function handleReorder(newItems) {
        setSources(newItems);
        router.patch('/settings/lead-sources/reorder', { items: newItems.map((s) => s.id) }, { preserveScroll: true });
    }

    function handleDelete(source) {
        if (!confirm(`Delete "${source.name}"?`)) return;
        router.delete(`/settings/lead-sources/${source.id}`, {
            preserveScroll: true,
            onSuccess: () => setSources((s) => s.filter((x) => x.id !== source.id)),
        });
    }

    function refresh() {
        setEditing(null);
        setAdding(false);
        router.reload({ only: ['sources'], preserveScroll: true });
    }

    return (
        <AppLayout title="Lead Sources">
            <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Define where your leads come from. Drag to reorder.</p>
                    {!adding && (
                        <button onClick={() => setAdding(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                            + Add source
                        </button>
                    )}
                </div>

                {adding && <SourceForm onDone={refresh} />}

                <SortableList
                    items={sources}
                    onReorder={handleReorder}
                    renderItem={(source) =>
                        editing?.id === source.id ? (
                            <SourceForm source={source} onDone={refresh} />
                        ) : (
                            <SourceRow
                                source={source}
                                onEdit={setEditing}
                                onDelete={handleDelete}
                            />
                        )
                    }
                />

                {sources.length === 0 && !adding && (
                    <div className="text-center py-12 text-gray-400 text-sm">No lead sources yet.</div>
                )}
            </div>
        </AppLayout>
    );
}
