import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatMoney, rentSuffix, useCurrency } from '@/Utils/format';

const STATUS_LABELS = {
    available:   'Available',
    under_offer: 'Under Offer',
    reserved:    'Reserved',
    sold:        'Sold',
    rented:      'Rented',
    off_market:  'Off Market',
};

function PhotoGallery({ photos }) {
    const [current, setCurrent] = useState(0);

    if (!photos || photos.length === 0) {
        return (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                <img src={photos[current].url} alt=""
                    className="w-full h-full object-cover" />
            </div>
            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                        <button key={p.id} onClick={() => setCurrent(i)}
                            className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                                i === current ? 'border-emerald-500' : 'border-transparent'
                            }`}>
                            <img src={p.thumb ?? p.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function EnquiryForm({ property }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name:  '',
        email:      '',
        phone:      '',
        purpose:    property.purpose === 'rent' ? 'rent' : 'buy',
        message:    '',
    });

    const [sent, setSent] = useState(!!flash?.success);

    function submit(e) {
        e.preventDefault();
        post(`/listings/${property.reference}/enquire`, {
            preserveScroll: true,
            onSuccess: () => { setSent(true); reset(); },
        });
    }

    if (sent) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-green-800 font-medium">Enquiry submitted!</p>
                <p className="text-green-700 text-sm mt-1">We'll be in touch shortly.</p>
                <button onClick={() => setSent(false)}
                    className="mt-4 text-xs text-green-600 hover:text-green-800 underline">
                    Send another enquiry
                </button>
            </div>
        );
    }

    const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>First name *</label>
                    <input value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                        className={inputCls} />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                </div>
                <div>
                    <label className={labelCls}>Last name *</label>
                    <input value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                        className={inputCls} />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                </div>
            </div>

            <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)}
                    placeholder="07XX XXX XXX"
                    className={inputCls} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                    className={inputCls} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
                <label className={labelCls}>I'm interested in</label>
                <div className="flex gap-2">
                    {['buy', 'rent'].map(p => (
                        <button key={p} type="button"
                            onClick={() => setData('purpose', p)}
                            className={`flex-1 py-1.5 text-sm rounded-md border transition-colors font-medium capitalize ${
                                data.purpose === p
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                            }`}>
                            {p === 'buy' ? 'Buying' : 'Renting'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className={labelCls}>Message</label>
                <textarea rows={3} value={data.message}
                    onChange={e => setData('message', e.target.value)}
                    placeholder="I'd like to arrange a viewing…"
                    className={`${inputCls} resize-none`} />
            </div>

            <button type="submit" disabled={processing}
                className="w-full py-2.5 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-semibold">
                {processing ? 'Sending…' : 'Send Enquiry'}
            </button>

            <p className="text-xs text-gray-400 text-center">
                Your information is kept confidential and will only be used to respond to your enquiry.
            </p>
        </form>
    );
}

function SpecRow({ label, value }) {
    if (value == null || value === '') return null;
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{value}</span>
        </div>
    );
}

function AgentCard({ company, property }) {
    if (!company) return null;
    const msg = encodeURIComponent(`Hello ${company.name}, I'm interested in "${property.title}" (${property.reference}). Is it still available?`);
    return (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">Listed by</p>
            <p className="font-bold text-gray-900">{company.name}</p>
            {company.city && <p className="text-xs text-gray-500 mt-0.5">{company.city}</p>}
            <div className="grid grid-cols-2 gap-2 mt-3">
                {company.phone && (
                    <a href={`tel:${company.phone.replace(/\s/g, '')}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-800 hover:border-emerald-500 hover:text-emerald-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        Call
                    </a>
                )}
                {company.whatsapp && (
                    <a href={`https://wa.me/${company.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg bg-[#25D366] text-white hover:brightness-95 transition">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.81L2.05 22l5.36-1.41c1.37.74 2.93 1.17 4.63 1.17 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.52 14.14c-.23.65-1.35 1.24-1.86 1.32-.48.07-1.08.1-1.74-.11-.4-.13-.92-.3-1.58-.58-2.78-1.2-4.6-4-4.74-4.18-.14-.19-1.13-1.5-1.13-2.86s.72-2.03.97-2.31c.26-.28.56-.35.75-.35h.54c.17 0 .41-.07.64.49.23.57.8 1.95.87 2.1.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.3.37-.42.5-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.71-.82.9-1.11.19-.28.37-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.66-.16 1.31z"/></svg>
                        WhatsApp
                    </a>
                )}
            </div>
        </div>
    );
}

export default function ListingsShow({ property, company }) {
    const currency = useCurrency();
    const purposeLabel = property.purpose === 'rent' ? 'For Rent' : 'For Sale';
    const price = property.purpose === 'rent' ? property.rent_price : property.price;
    const priceLabel = price
        ? `${formatMoney(price, currency)}${property.purpose === 'rent' ? rentSuffix(property.rent_frequency) : ''}`
        : 'Price on request';

    return (
        <PublicLayout title={property.title} company={company}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link href="/listings" className="hover:text-emerald-600">Properties</Link>
                    <span>/</span>
                    {property.community && <><span>{property.community}</span><span>/</span></>}
                    <span className="text-gray-700 font-medium truncate max-w-xs">{property.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: photos + details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Photos */}
                        <PhotoGallery photos={property.photos} />

                        {/* Title + price */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {property.type && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                        {property.type}
                                    </span>
                                )}
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                    property.purpose === 'rent' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    {purposeLabel}
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                                    {STATUS_LABELS[property.status] ?? property.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                            {(property.community || property.city) && (
                                <p className="text-gray-500 mt-1">
                                    {[property.community, property.city].filter(Boolean).join(', ')}
                                </p>
                            )}
                            <p className="text-2xl font-bold text-emerald-700 mt-3">{priceLabel}</p>

                            {/* Quick specs */}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                                {property.bedrooms != null && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                        {property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {property.bathrooms != null && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {property.bathrooms} Bathroom{property.bathrooms !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {property.area_sqm != null && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                        </svg>
                                        {Number(property.area_sqm).toLocaleString()} sqm
                                    </span>
                                )}
                                {property.is_furnished != null && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {property.is_furnished ? 'Furnished' : 'Unfurnished'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3">About this property</h2>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {/* Property details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Property Details</h2>
                            <SpecRow label="Reference"     value={property.reference} />
                            <SpecRow label="Type"          value={property.type} />
                            <SpecRow label="Purpose"       value={purposeLabel} />
                            <SpecRow label="Bedrooms"      value={property.bedrooms} />
                            <SpecRow label="Bathrooms"     value={property.bathrooms} />
                            <SpecRow label="Area"          value={property.area_sqm ? `${Number(property.area_sqm).toLocaleString()} sqm` : null} />
                            <SpecRow label="Floor"         value={property.floor != null ? `${property.floor}${property.total_floors ? ` of ${property.total_floors}` : ''}` : null} />
                            <SpecRow label="Building"      value={property.building} />
                            <SpecRow label="Community"     value={property.community} />
                            <SpecRow label="City"          value={property.city} />
                            <SpecRow label="Permit No."    value={property.permit_number} />
                            {property.rent_frequency && property.purpose === 'rent' && (
                                <SpecRow label="Rent frequency" value={property.rent_frequency.charAt(0).toUpperCase() + property.rent_frequency.slice(1)} />
                            )}
                        </div>

                        {/* Amenities */}
                        {property.amenities?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4">Amenities</h2>
                                <div className="space-y-4">
                                    {property.amenities.map((group) => (
                                        <div key={group.category}>
                                            {group.category && (
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 capitalize">
                                                    {group.category}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {group.items.map((a) => (
                                                    <span key={a.name}
                                                        className="text-sm px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-700">
                                                        {a.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Floor plans */}
                        {property.floor_plans?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3">Floor Plans</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {property.floor_plans.map((fp) => (
                                        <a key={fp.id} href={fp.url} target="_blank" rel="noreferrer"
                                            className="aspect-video bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-400 transition-colors flex items-center justify-center text-xs text-emerald-600 font-medium">
                                            View floor plan →
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: enquiry form (sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                            <div>
                                <p className="text-xs text-gray-400">{purposeLabel}</p>
                                <p className="text-2xl font-extrabold text-emerald-700">{priceLabel}</p>
                            </div>
                            <AgentCard company={company} property={property} />
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Send an enquiry</h2>
                                <p className="text-xs text-gray-400 mt-0.5">About {property.reference} — we'll get back to you quickly.</p>
                            </div>
                            <EnquiryForm property={property} />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
