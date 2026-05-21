import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

function fmtRwf(n) {
    return `RWF ${Number(n ?? 0).toLocaleString()}`;
}

const STATUS_COLORS = {
    available:   'bg-emerald-500',
    under_offer: 'bg-amber-500',
    reserved:    'bg-blue-500',
    sold:        'bg-gray-500',
    rented:      'bg-purple-500',
    off_market:  'bg-red-500',
};
const STATUS_LABELS = {
    available: 'Available', under_offer: 'Under Offer', reserved: 'Reserved',
    sold: 'Sold', rented: 'Rented', off_market: 'Off Market',
};

// ── SVG icons ─────────────────────────────────────────────────────────────────
function IconBed({ className = 'w-3.5 h-3.5' }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a1 1 0 011-1h16a1 1 0 011 1v5M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 12h18M7 7V4m10 3V4" /></svg>;
}
function IconBath({ className = 'w-3.5 h-3.5' }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5h15M4.5 10.5V6a1.5 1.5 0 013 0v4.5m-3 0v9m15-9v9m-15 0h15m-12 0v1.5m9-1.5v1.5" /></svg>;
}
function IconArea({ className = 'w-3.5 h-3.5' }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>;
}
function IconPin({ className = 'w-3 h-3' }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
}
function IconSearch({ className = 'w-4 h-4' }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" /></svg>;
}
function IconHome({ className = 'w-10 h-10' }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
}
function IconStar({ className = 'w-3 h-3' }) {
    return <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
}

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ property, companySlug }) {
    const isRent     = property.purpose === 'rent';
    const price      = isRent ? property.rent_price : property.price;
    const priceLabel = price ? `${fmtRwf(price)}${isRent ? '/yr' : ''}` : 'Price on request';
    const href       = companySlug
        ? `/listings/${property.reference}?company=${companySlug}`
        : `/listings/${property.reference}`;

    return (
        <Link href={href}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 flex flex-col">
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
                {property.photo_thumb ? (
                    <img src={property.photo_thumb} alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                        <IconHome className="w-12 h-12" />
                        <span className="text-xs mt-2 text-gray-300">No photo yet</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold text-white shadow-sm ${isRent ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                        {isRent ? 'For Rent' : 'For Sale'}
                    </span>
                    {property.featured_until && (
                        <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold text-white bg-amber-500 shadow-sm">
                            <IconStar className="w-2.5 h-2.5" /> Featured
                        </span>
                    )}
                </div>
                <div className="absolute top-3 right-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold text-white shadow-sm ${STATUS_COLORS[property.status] ?? 'bg-gray-500'}`}>
                        {STATUS_LABELS[property.status] ?? property.status}
                    </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                    <p className="text-white font-bold text-base leading-none">{priceLabel}</p>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col">
                {property.type && (
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{property.type}</p>
                )}
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors flex-1">
                    {property.title}
                </h3>
                {(property.community || property.city) && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <IconPin className="w-3 h-3 shrink-0 text-gray-300" />
                        {[property.community, property.city].filter(Boolean).join(', ')}
                    </p>
                )}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    {property.bedrooms != null && (
                        <span className="flex items-center gap-1">
                            <IconBed className="text-gray-400" /> {property.bedrooms}
                        </span>
                    )}
                    {property.bathrooms != null && (
                        <span className="flex items-center gap-1">
                            <IconBath className="text-gray-400" /> {property.bathrooms}
                        </span>
                    )}
                    {property.area_sqm != null && (
                        <span className="flex items-center gap-1">
                            <IconArea className="text-gray-400" /> {Number(property.area_sqm).toLocaleString()} m²
                        </span>
                    )}
                    <span className="ml-auto text-emerald-600 font-semibold group-hover:underline text-[11px]">View →</span>
                </div>
            </div>
        </Link>
    );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
function SearchBar({ filters, propertyTypes, companySlug }) {
    const [local, setLocal] = useState({
        q:         filters.q ?? '',
        purpose:   filters.purpose ?? '',
        type:      filters.type ?? '',
        bedrooms:  filters.bedrooms ?? '',
        price_min: filters.price_min ?? '',
        price_max: filters.price_max ?? '',
        sort:      filters.sort ?? 'newest',
    });

    function apply(e) {
        e.preventDefault();
        const params = Object.fromEntries(Object.entries(local).filter(([, v]) => v !== ''));
        if (companySlug) params.company = companySlug;
        router.get('/listings', params, { preserveState: true });
    }

    function reset() {
        setLocal({ q: '', purpose: '', type: '', bedrooms: '', price_min: '', price_max: '', sort: 'newest' });
        router.get('/listings', companySlug ? { company: companySlug } : {});
    }

    const sel = 'bg-white rounded-xl border border-white/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-gray-700';

    return (
        <form onSubmit={apply} className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-5 space-y-4">
            {/* Main search */}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <IconSearch className="w-4 h-4" />
                </span>
                <input
                    value={local.q}
                    onChange={e => setLocal(s => ({ ...s, q: e.target.value }))}
                    placeholder="Search by title, neighbourhood, reference…"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-gray-800 placeholder-gray-400"
                />
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <select value={local.purpose} onChange={e => setLocal(s => ({ ...s, purpose: e.target.value }))} className={sel}>
                    <option value="">Any purpose</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                </select>
                <select value={local.type} onChange={e => setLocal(s => ({ ...s, type: e.target.value }))} className={sel}>
                    <option value="">Any type</option>
                    {propertyTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={local.bedrooms} onChange={e => setLocal(s => ({ ...s, bedrooms: e.target.value }))} className={sel}>
                    <option value="">Any bedrooms</option>
                    {[0, 1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>
                    ))}
                    <option value="7">7+ BR</option>
                </select>
                <input type="number" value={local.price_min}
                    onChange={e => setLocal(s => ({ ...s, price_min: e.target.value }))}
                    placeholder="Min price (RWF)" className={sel} />
                <input type="number" value={local.price_max}
                    onChange={e => setLocal(s => ({ ...s, price_max: e.target.value }))}
                    placeholder="Max price (RWF)" className={sel} />
                <select value={local.sort} onChange={e => setLocal(s => ({ ...s, sort: e.target.value }))} className={sel}>
                    <option value="newest">Newest first</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                </select>
            </div>

            <div className="flex gap-3">
                <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm rounded-xl font-semibold text-white shadow-sm transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                    <IconSearch className="w-4 h-4" />
                    Search Properties
                </button>
                <button type="button" onClick={reset}
                    className="px-5 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Reset
                </button>
            </div>
        </form>
    );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, body }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ListingsIndex({ properties, propertyTypes, filters, company }) {
    const { data, meta, links } = properties;
    const hasFilters    = Object.values(filters).some(v => v && v !== 'newest' && v !== 'company');
    const companySlug   = company?.slug ?? filters.company ?? null;
    const companyName   = company?.name ?? null;
    const heroTitle     = companyName ? `${companyName} — Properties` : 'Find Your Dream Property in Rwanda';
    const heroSubtitle  = companyName
        ? `Browse ${companyName}'s exclusive property listings`
        : 'From Kigali\'s vibrant neighbourhoods to serene countryside retreats';

    return (
        <PublicLayout title={companyName ? `${companyName} — Listings` : 'Properties in Rwanda'} company={company}>
            {/* ── Hero ── */}
            <section className="relative text-white overflow-hidden" style={{ minHeight: '520px' }}>
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/images/kigali-hero.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 60%',
                    }} />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(2,44,34,0.90) 0%, rgba(5,78,59,0.82) 40%, rgba(6,78,59,0.72) 70%, rgba(2,44,34,0.85) 100%)' }} />
                <div className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                    <div className="text-center mb-10">
                        {companyName ? (
                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                                <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                                Official Listings
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                Rwanda's Premier Property Platform
                            </div>
                        )}
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                            {companyName ? (
                                <>{companyName}<br /><span className="text-emerald-300">Property Listings</span></>
                            ) : (
                                <>Find Your Dream<br /><span className="text-emerald-300">Property in Rwanda</span></>
                            )}
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl mx-auto drop-shadow">
                            {heroSubtitle}
                        </p>
                    </div>
                    <div className="max-w-5xl mx-auto">
                        <SearchBar filters={filters} propertyTypes={propertyTypes} companySlug={companySlug} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 mt-10">
                        {[
                            {
                                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>,
                                label: `${meta?.total ?? 0} Properties Listed`
                            },
                            {
                                icon: <IconPin className="w-5 h-5" />,
                                label: 'Kigali & Nationwide'
                            },
                            {
                                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                label: 'Verified Listings'
                            },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-2 text-white/85">
                                <span className="text-emerald-300">{s.icon}</span>
                                <span className="text-sm font-semibold drop-shadow">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Results ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {hasFilters ? 'Search Results' : companyName ? `${companyName} Properties` : 'All Properties'}
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {meta?.total ?? 0} {(meta?.total ?? 0) === 1 ? 'property' : 'properties'} found
                        </p>
                    </div>
                    {hasFilters && (
                        <button
                            onClick={() => router.get('/listings', companySlug ? { company: companySlug } : {})}
                            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 font-medium border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Clear filters
                        </button>
                    )}
                </div>

                {data?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {data.map(p => <PropertyCard key={p.id} property={p} companySlug={companySlug} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 text-gray-200">
                            <IconHome className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No properties found</h3>
                        <p className="text-gray-400 text-sm max-w-sm">Try adjusting your search filters or browse all our available properties.</p>
                        <button
                            onClick={() => router.get('/listings', companySlug ? { company: companySlug } : {})}
                            className="mt-5 px-5 py-2.5 text-sm rounded-xl font-semibold text-white transition hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                            View all properties
                        </button>
                    </div>
                )}

                {links && data?.length > 0 && (
                    <div className="flex justify-center gap-1.5 flex-wrap mt-10">
                        {links.map((link, i) => (
                            <button key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-2 text-sm rounded-xl border transition-colors ${
                                    link.active
                                        ? 'text-white border-emerald-600 font-semibold'
                                        : link.url
                                            ? 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-600'
                                            : 'bg-white border-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                                style={link.active ? { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' } : {}}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Features ── */}
            {!hasFilters && (
                <section className="bg-gray-50 border-t border-gray-100 py-16 mt-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {companyName ? `Why Choose ${companyName}?` : 'Why Choose Nexsit Properties?'}
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm">Rwanda's most trusted real estate platform</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                                title="Verified Listings"
                                body="Every property is verified by our local team before being published."
                            />
                            <FeatureCard
                                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
                                title="Fast Response"
                                body="Our agents respond to your enquiry within hours, not days."
                            />
                            <FeatureCard
                                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                                title="Secure Transactions"
                                body="Your personal information is always kept safe and confidential."
                            />
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
