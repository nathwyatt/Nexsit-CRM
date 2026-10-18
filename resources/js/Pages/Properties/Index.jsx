import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import AppIcon from '@/Components/AppIcon';

const STATUS_COLORS = {
    available:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
    under_offer: 'bg-amber-50 text-amber-700 ring-amber-200',
    reserved:    'bg-blue-50 text-blue-700 ring-blue-200',
    sold:        'bg-gray-100 text-gray-600 ring-gray-200',
    rented:      'bg-purple-50 text-purple-700 ring-purple-200',
    off_market:  'bg-red-50 text-red-700 ring-red-200',
};

const PURPOSE_LABELS = { sale: 'Sale', rent: 'Rent', both: 'Sale & Rent' };

function PropertyCard({ property }) {
    function togglePublish(e) {
        e.preventDefault();
        router.patch(`/properties/${property.id}/publish`, {}, { preserveScroll: true });
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transform transition-all group">
            {/* Photo */}
            <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {property.thumb ? (
                    <img src={property.thumb} alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span className="text-xs">No photo</span>
                    </div>
                )}
                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ring-1 ${STATUS_COLORS[property.status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1).replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 font-medium shadow-sm">
                        {PURPOSE_LABELS[property.purpose] ?? property.purpose}
                    </span>
                </div>
                <button onClick={togglePublish}
                    className={`absolute top-2 right-2 text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all shadow-sm ${
                        property.is_published
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:bg-gray-100'
                    }`}>
                    {property.is_published ? 'Published' : 'Draft'}
                </button>
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                    {property.property_type ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                            <AppIcon name={property.property_type.icon} className="w-3.5 h-3.5" />
                            {property.property_type.name}
                        </span>
                    ) : (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300">No type</span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">{property.reference}</span>
                </div>
                <Link href={`/properties/${property.id}`}
                    className="text-sm font-bold text-gray-900 hover:text-emerald-600 line-clamp-2 leading-snug transition-colors">
                    {property.title}
                </Link>

                {(property.community || property.city) && (
                    <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {[property.community, property.city].filter(Boolean).join(', ')}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
                    {property.bedrooms != null && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12h19.5m-16.5 0V9.75a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25V12m-15 0v2.25A2.25 2.25 0 004.5 16.5h15a2.25 2.25 0 002.25-2.25V12" /></svg>
                            {property.bedrooms} bed
                        </span>
                    )}
                    {property.bathrooms != null && (
                        <span>{property.bathrooms} bath</span>
                    )}
                    {property.area_sqm && (
                        <span>{Number(property.area_sqm).toLocaleString()} m²</span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div>
                        {property.price && (
                            <p className="text-sm font-bold text-gray-900">
                                RWF {Number(property.price).toLocaleString()}
                            </p>
                        )}
                        {property.rent_price && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                RWF {Number(property.rent_price).toLocaleString()}/mo
                            </p>
                        )}
                    </div>
                    <Link href={`/properties/${property.id}/edit`}
                        className="text-xs text-gray-400 hover:text-emerald-600 font-medium transition-colors opacity-0 group-hover:opacity-100">
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PropertiesIndex({ properties, propertyTypes, filters }) {
    const [search, setSearch]   = useState(filters.search ?? '');
    const [type, setType]       = useState(filters.type ?? '');
    const [purpose, setPurpose] = useState(filters.purpose ?? '');
    const [status, setStatus]   = useState(filters.status ?? '');

    function applyFilters(overrides = {}) {
        router.get('/properties', { search, type, purpose, status, ...overrides }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout title="Properties">
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            placeholder="Search title, ref, community…"
                            className="w-full rounded-xl border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        />
                    </div>

                    <select value={type} onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All types</option>
                        {propertyTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <select value={purpose} onChange={(e) => { setPurpose(e.target.value); applyFilters({ purpose: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All purposes</option>
                        <option value="sale">Sale</option>
                        <option value="rent">Rent</option>
                        <option value="both">Both</option>
                    </select>

                    <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All statuses</option>
                        <option value="available">Available</option>
                        <option value="under_offer">Under Offer</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                        <option value="off_market">Off Market</option>
                    </select>

                    <Link href="/properties/create"
                        className="ml-auto px-4 py-2.5 text-sm rounded-xl text-white font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-sm transition hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add property
                    </Link>
                </div>

                {/* Grid */}
                {properties.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {properties.data.map((p) => (
                                <PropertyCard key={p.id} property={p} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs text-gray-400">
                                Showing {properties.from}–{properties.to} of {properties.total} properties
                            </span>
                            <div className="flex gap-2">
                                {properties.prev_page_url && (
                                    <Link href={properties.prev_page_url}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                        Prev
                                    </Link>
                                )}
                                {properties.next_page_url && (
                                    <Link href={properties.next_page_url}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
                                        Next
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No properties found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <Link href="/properties/create" className="text-emerald-600 hover:text-emerald-700 font-medium">Add your first property</Link>
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
