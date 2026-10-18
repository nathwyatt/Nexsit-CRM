import { useState, useRef } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import AppIcon from '@/Components/AppIcon';
import TaskPanel from '@/Components/Task/TaskPanel';
import ActivityFeed from '@/Components/Task/ActivityFeed';
import DocumentPanel from '@/Components/Document/DocumentPanel';
import { useCurrency, rentSuffix } from '@/Utils/format';

const STATUS_COLORS = {
    available:   'bg-green-100 text-green-700',
    under_offer: 'bg-amber-100 text-amber-700',
    reserved:    'bg-blue-100 text-blue-700',
    sold:        'bg-gray-100 text-gray-600',
    rented:      'bg-purple-100 text-purple-700',
    off_market:  'bg-red-100 text-red-700',
};

const UNIT_STATUS_COLORS = {
    available: 'bg-green-100 text-green-700',
    occupied:  'bg-red-100 text-red-700',
    reserved:  'bg-amber-100 text-amber-700',
};

function DetailRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-sm text-gray-800 font-medium text-right">{value}</span>
        </div>
    );
}

function PhotoGallery({ photos, propertyId }) {
    const inputRef = useRef();
    const [uploading, setUploading] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    function upload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append('photo', file);
        router.post(`/properties/${propertyId}/media`, form, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploading(false),
        });
    }

    function deletePhoto(id) {
        if (!confirm('Delete this photo?')) return;
        router.delete(`/properties/${propertyId}/media/${id}`, { preserveScroll: true });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Photos ({photos.length})</p>
                <button onClick={() => inputRef.current?.click()} disabled={uploading}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {uploading ? 'Uploading…' : '+ Upload photo'}
                </button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
            </div>

            {photos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <img src={photo.thumb ?? photo.url} alt={photo.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setLightbox(photo.url)} />
                            <button onClick={() => deletePhoto(photo.id)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No photos yet. Upload the first one.
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg shadow-xl" />
                </div>
            )}
        </div>
    );
}

function OwnersPanel({ owners, propertyId, contacts }) {
    const { data, setData, post, processing, reset } = useForm({
        contact_id:    '',
        ownership_pct: 100,
        is_primary:    owners.length === 0,
    });

    function addOwner(e) {
        e.preventDefault();
        post(`/properties/${propertyId}/owners`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function removeOwner(ownerId) {
        if (!confirm('Remove this owner?')) return;
        router.delete(`/properties/${propertyId}/owners/${ownerId}`, { preserveScroll: true });
    }

    return (
        <div className="space-y-4">
            {owners.length > 0 ? (
                <div className="space-y-2">
                    {owners.map((owner) => (
                        <div key={owner.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0">
                                {owner.contact?.first_name?.charAt(0) ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                {owner.contact ? (
                                    <Link
                                        href={`/contacts/${owner.contact.id}`}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 block truncate"
                                    >
                                        {owner.contact.first_name} {owner.contact.last_name}
                                    </Link>
                                ) : (
                                    <span className="text-sm text-gray-500">Unknown contact</span>
                                )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                owner.is_primary ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {owner.ownership_pct ?? 100}% {owner.is_primary ? '· Primary' : ''}
                            </span>
                            <button onClick={() => removeOwner(owner.id)}
                                className="text-xs text-red-400 hover:text-red-600 shrink-0">
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 text-center py-4">No owners linked.</p>
            )}

            <form onSubmit={addOwner} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Add owner</p>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact *</label>
                        <select value={data.contact_id} onChange={e => setData('contact_id', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select contact</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ownership %</label>
                        <input type="number" min="1" max="100" value={data.ownership_pct}
                            onChange={e => setData('ownership_pct', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={data.is_primary}
                            onChange={e => setData('is_primary', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        Primary owner
                    </label>
                    <button type="submit" disabled={processing || !data.contact_id}
                        className="ml-auto px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                        {processing ? 'Adding…' : 'Add owner'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function UnitsPanel({ units, propertyId }) {
    const currency = useCurrency();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        unit_number: '', floor: '', bedrooms: '', bathrooms: '',
        area_sqm: '', status: 'available', rent_price: '', notes: '',
    });

    function submitUnit(e) {
        e.preventDefault();
        if (editing) {
            put(`/properties/${propertyId}/units/${editing.id}`, {
                preserveScroll: true,
                onSuccess: () => { reset(); setEditing(null); },
            });
        } else {
            post(`/properties/${propertyId}/units`, {
                preserveScroll: true,
                onSuccess: () => { reset(); setAdding(false); },
            });
        }
    }

    function startEdit(unit) {
        setEditing(unit);
        setAdding(false);
        setData({ unit_number: unit.unit_number, floor: unit.floor ?? '', bedrooms: unit.bedrooms ?? '',
            bathrooms: unit.bathrooms ?? '', area_sqm: unit.area_sqm ?? '',
            status: unit.status, rent_price: unit.rent_price ?? '', notes: unit.notes ?? '' });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Units ({units.length})</p>
                {!adding && !editing && (
                    <button onClick={() => setAdding(true)}
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        + Add unit
                    </button>
                )}
            </div>

            {(adding || editing) && (
                <form onSubmit={submitUnit} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Unit No. *', key: 'unit_number', type: 'text' },
                            { label: 'Floor', key: 'floor', type: 'number' },
                            { label: 'Status', key: 'status', type: 'select', opts: ['available','occupied','reserved'] },
                        ].map(({ label, key, type, opts }) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                                {type === 'select' ? (
                                    <select value={data[key]} onChange={(e) => setData(key, e.target.value)}
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
                                        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                ) : (
                                    <input type={type} value={data[key]}
                                        onChange={(e) => setData(key, e.target.value)}
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Beds</label>
                            <input type="number" min="0" value={data.bedrooms} onChange={(e) => setData('bedrooms', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Baths</label>
                            <input type="number" min="0" value={data.bathrooms} onChange={(e) => setData('bathrooms', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Area sqm</label>
                            <input type="number" min="0" value={data.area_sqm} onChange={(e) => setData('area_sqm', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={processing}
                            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                            {editing ? 'Save unit' : 'Add unit'}
                        </button>
                        <button type="button" onClick={() => { reset(); setAdding(false); setEditing(null); }}
                            className="px-3 py-1.5 text-sm text-gray-600">Cancel</button>
                    </div>
                </form>
            )}

            {units.length > 0 ? (
                <div className="space-y-2">
                    {units.map((unit) => (
                        <div key={unit.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                            <span className="font-mono text-sm font-semibold text-gray-700 w-16">{unit.unit_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${UNIT_STATUS_COLORS[unit.status]}`}>{unit.status}</span>
                            <div className="flex-1 flex gap-3 text-xs text-gray-500">
                                {unit.bedrooms != null && <span>{unit.bedrooms}bd</span>}
                                {unit.bathrooms != null && <span>{unit.bathrooms}ba</span>}
                                {unit.area_sqm && <span>{unit.area_sqm} sqm</span>}
                                {unit.rent_price && <span>{currency} {Number(unit.rent_price).toLocaleString()}{rentSuffix(unit.rent_frequency)}</span>}
                            </div>
                            <button onClick={() => startEdit(unit)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
                            <button onClick={() => {
                                if (confirm('Delete unit?'))
                                    router.delete(`/properties/${propertyId}/units/${unit.id}`, { preserveScroll: true });
                            }} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        </div>
                    ))}
                </div>
            ) : !adding && (
                <p className="text-sm text-gray-400 text-center py-6">No units yet.</p>
            )}
        </div>
    );
}

export default function PropertyShow({ property, contacts, tasks, activities, taskTypes, agents, subject, documents = [], documentTypes = [] }) {
    const currency = useCurrency();
    const [tab, setTab] = useState('overview');

    const TABS = [
        { key: 'overview', label: 'Overview' },
        { key: 'owners',   label: `Owners (${property.owners?.length ?? 0})` },
        { key: 'photos',   label: `Photos (${property.photos?.length ?? 0})` },
        { key: 'units',    label: `Units (${property.units?.length ?? 0})` },
        { key: 'tasks',     label: `Tasks (${tasks?.length ?? 0})` },
        { key: 'documents', label: `Docs (${documents?.length ?? 0})` },
    ];

    function togglePublish() {
        router.patch(`/properties/${property.id}/publish`, {}, { preserveScroll: true });
    }

    function deleteProperty() {
        if (!confirm(`Permanently delete ${property.reference}?`)) return;
        router.delete(`/properties/${property.id}`);
    }

    return (
        <AppLayout title={property.reference}>
            <div className="max-w-5xl space-y-5">
                {/* Breadcrumb + actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/properties" className="hover:text-indigo-600">Properties</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{property.reference}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={togglePublish}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                                property.is_published
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                            }`}>
                            {property.is_published ? '✓ Published' : 'Publish'}
                        </button>
                        <Link href={`/viewings/create?property_id=${property.id}`}
                            className="px-3 py-1.5 text-xs rounded-lg font-semibold text-white hover:opacity-90 transition flex items-center gap-1"
                            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Book Viewing
                        </Link>
                        <a href={`/properties/${property.id}/pdf`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-green-400 hover:text-green-700">
                            ↓ PDF
                        </a>
                        <Link href={`/properties/${property.id}/edit`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-indigo-400">
                            Edit
                        </Link>
                        <button onClick={deleteProperty}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                </div>

                {/* Header card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{property.title}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {[property.building, property.community, property.city].filter(Boolean).join(' · ')}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[property.status]}`}>
                                {property.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        {property.price && (
                            <div>
                                <p className="text-xs text-gray-400">Sale price</p>
                                <p className="font-bold text-gray-900">{currency} {Number(property.price).toLocaleString()}</p>
                            </div>
                        )}
                        {property.rent_price && (
                            <div>
                                <p className="text-xs text-gray-400">Rent</p>
                                <p className="font-bold text-gray-900">{currency} {Number(property.rent_price).toLocaleString()}<span className="text-xs font-normal text-gray-400">{rentSuffix(property.rent_frequency)}</span></p>
                            </div>
                        )}
                        {property.area_sqm && (
                            <div>
                                <p className="text-xs text-gray-400">Area</p>
                                <p className="font-semibold text-gray-700">{Number(property.area_sqm).toLocaleString()} sqm</p>
                            </div>
                        )}
                        {property.bedrooms != null && (
                            <div>
                                <p className="text-xs text-gray-400">Bedrooms</p>
                                <p className="font-semibold text-gray-700">{property.bedrooms}</p>
                            </div>
                        )}
                        {property.bathrooms != null && (
                            <div>
                                <p className="text-xs text-gray-400">Bathrooms</p>
                                <p className="font-semibold text-gray-700">{property.bathrooms}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                                tab === t.key ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    {tab === 'overview' && (
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Details</h3>
                                <DetailRow label="Type" value={property.property_type?.name} />
                                <DetailRow label="Purpose" value={property.purpose} />
                                <DetailRow label="Floor" value={property.floor != null ? `${property.floor}${property.total_floors ? ` of ${property.total_floors}` : ''}` : null} />
                                <DetailRow label="Furnished" value={property.is_furnished === true ? 'Yes' : property.is_furnished === false ? 'No' : null} />
                                <DetailRow label="Permit No." value={property.permit_number} />
                                <DetailRow label="Service Charge" value={property.service_charge ? `${currency} ${Number(property.service_charge).toLocaleString()}/month` : null} />
                                <DetailRow label="Assigned to" value={property.assigned_to?.name} />

                                {property.amenities?.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Amenities</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {property.amenities.map((a) => (
                                                <span key={a.id} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                                    <AppIcon name={a.icon} className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-500" />{a.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Description</h3>
                                {property.description ? (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{property.description}</p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No description provided.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'owners' && (
                        <OwnersPanel owners={property.owners ?? []} propertyId={property.id} contacts={contacts} />
                    )}

                    {tab === 'photos' && (
                        <PhotoGallery photos={property.photos ?? []} propertyId={property.id} />
                    )}

                    {tab === 'units' && (
                        <UnitsPanel units={property.units ?? []} propertyId={property.id} />
                    )}

                    {tab === 'tasks' && (
                        <div className="space-y-4">
                            <TaskPanel tasks={tasks ?? []} taskTypes={taskTypes ?? []} agents={agents ?? []} subject={subject} />
                            <ActivityFeed activities={activities ?? []} />
                        </div>
                    )}
                    {tab === 'documents' && (
                        <DocumentPanel documents={documents} documentTypes={documentTypes} subject={subject} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
