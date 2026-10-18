import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SortableList from '@/Components/SortableList';
import AppIcon, { IconPicker } from '@/Components/AppIcon';

const CATEGORIES = [
    { value: 'building',  label: 'Building' },
    { value: 'unit',      label: 'Unit' },
    { value: 'community', label: 'Community' },
];

function AmenityRow({ amenity, onEdit, onDelete }) {
    const cat = CATEGORIES.find((c) => c.value === amenity.category);
    return (
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
            {amenity.icon && <span className="w-6 flex justify-center text-gray-500"><AppIcon name={amenity.icon} className="w-5 h-5" /></span>}
            <span className="flex-1 text-sm font-medium text-gray-800">{amenity.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{cat?.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${amenity.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {amenity.is_active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={() => onEdit(amenity)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
            <button onClick={() => onDelete(amenity)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
    );
}

function AmenityForm({ amenity, onDone }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:      amenity?.name      ?? '',
        icon:      amenity?.icon      ?? '',
        category:  amenity?.category  ?? 'building',
        is_active: amenity?.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();
        const url = amenity ? `/settings/amenities/${amenity.id}` : '/settings/amenities';
        const method = amenity ? patch : post;
        method(url, { onSuccess: () => { reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Swimming Pool"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                    <IconPicker value={data.icon} onChange={(v) => setData('icon', v)} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select value={data.category} onChange={(e) => setData('category', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
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
                    {amenity ? 'Save' : 'Add amenity'}
                </button>
                <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function AmenitiesIndex({ amenities: initial }) {
    const [amenities, setAmenities] = useState(initial);
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    const filtered = activeCategory === 'all'
        ? amenities
        : amenities.filter((a) => a.category === activeCategory);

    function handleReorder(newItems) {
        const rest = amenities.filter((a) => !newItems.find((n) => n.id === a.id));
        setAmenities([...rest, ...newItems]);
        router.patch('/settings/amenities/reorder', { items: newItems.map((a) => a.id) }, { preserveScroll: true });
    }

    function handleDelete(amenity) {
        if (!confirm(`Delete "${amenity.name}"?`)) return;
        router.delete(`/settings/amenities/${amenity.id}`, {
            preserveScroll: true,
            onSuccess: () => setAmenities((a) => a.filter((x) => x.id !== amenity.id)),
        });
    }

    function refresh() {
        setEditing(null);
        setAdding(false);
        router.reload({ only: ['amenities'], preserveScroll: true });
    }

    return (
        <AppLayout title="Amenities">
            <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Manage amenities shown on property listings. Drag to reorder within a category.</p>
                    {!adding && (
                        <button onClick={() => setAdding(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                            + Add amenity
                        </button>
                    )}
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                    {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
                        <button key={c.value}
                            onClick={() => setActiveCategory(c.value)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeCategory === c.value
                                    ? 'bg-white shadow text-gray-900 font-medium'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}>
                            {c.label}
                        </button>
                    ))}
                </div>

                {adding && <AmenityForm onDone={refresh} />}

                <SortableList
                    items={filtered}
                    onReorder={handleReorder}
                    renderItem={(amenity) =>
                        editing?.id === amenity.id ? (
                            <AmenityForm amenity={amenity} onDone={refresh} />
                        ) : (
                            <AmenityRow amenity={amenity} onEdit={setEditing} onDelete={handleDelete} />
                        )
                    }
                />

                {filtered.length === 0 && !adding && (
                    <div className="text-center py-12 text-gray-400 text-sm">No amenities in this category.</div>
                )}
            </div>
        </AppLayout>
    );
}
