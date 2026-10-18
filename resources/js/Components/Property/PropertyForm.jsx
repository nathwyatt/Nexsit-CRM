import { useState } from 'react';
import AmenityPicker from './AmenityPicker';
import { useCurrency, rentSuffix } from '@/Utils/format';

const PURPOSES = [
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
    { value: 'both', label: 'Sale & Rent' },
];

const STATUSES = [
    { value: 'available',   label: 'Available' },
    { value: 'under_offer', label: 'Under Offer' },
    { value: 'reserved',    label: 'Reserved' },
    { value: 'sold',        label: 'Sold' },
    { value: 'rented',      label: 'Rented' },
    { value: 'off_market',  label: 'Off Market' },
];

const RENT_FREQS = [
    { value: 'monthly',   label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly',    label: 'Yearly' },
];

const TABS = ['Details', 'Location', 'Pricing', 'Amenities', 'SEO'];

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
            {...props}
        />
    );
}

function Select({ children, ...props }) {
    return (
        <select className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" {...props}>
            {children}
        </select>
    );
}

export default function PropertyForm({ data, setData, errors, propertyTypes, amenities, agents }) {
    const currency = useCurrency();
    const [tab, setTab] = useState('Details');

    return (
        <div className="space-y-6">
            {/* Tab nav */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {TABS.map((t) => (
                    <button key={t} type="button" onClick={() => setTab(t)}
                        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                            tab === t ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                        }`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Details */}
            {tab === 'Details' && (
                <div className="space-y-4">
                    <Field label="Title *" error={errors.title}>
                        <Input value={data.title} onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Spacious 3-bedroom house in Kibagabaga" />
                    </Field>

                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Type" error={errors.property_type_id}>
                            <Select value={data.property_type_id ?? ''} onChange={(e) => setData('property_type_id', e.target.value || null)}>
                                <option value="">— Select type —</option>
                                {propertyTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>
                        </Field>
                        <Field label="Purpose *" error={errors.purpose}>
                            <Select value={data.purpose} onChange={(e) => setData('purpose', e.target.value)}>
                                {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </Select>
                        </Field>
                        <Field label="Status *" error={errors.status}>
                            <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <Field label="Bedrooms" error={errors.bedrooms}>
                            <Input type="number" min="0" value={data.bedrooms ?? ''}
                                onChange={(e) => setData('bedrooms', e.target.value || null)} placeholder="0" />
                        </Field>
                        <Field label="Bathrooms" error={errors.bathrooms}>
                            <Input type="number" min="0" value={data.bathrooms ?? ''}
                                onChange={(e) => setData('bathrooms', e.target.value || null)} placeholder="0" />
                        </Field>
                        <Field label="Area (sqm)" error={errors.area_sqm}>
                            <Input type="number" min="0" step="0.01" value={data.area_sqm ?? ''}
                                onChange={(e) => setData('area_sqm', e.target.value || null)} placeholder="0.00" />
                        </Field>
                        <Field label="Permit No." error={errors.permit_number}>
                            <Input value={data.permit_number ?? ''}
                                onChange={(e) => setData('permit_number', e.target.value || null)} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Floor" error={errors.floor}>
                            <Input type="number" value={data.floor ?? ''}
                                onChange={(e) => setData('floor', e.target.value || null)} />
                        </Field>
                        <Field label="Total Floors" error={errors.total_floors}>
                            <Input type="number" min="1" value={data.total_floors ?? ''}
                                onChange={(e) => setData('total_floors', e.target.value || null)} />
                        </Field>
                        <Field label="Furnished">
                            <Select value={data.is_furnished === null ? '' : String(data.is_furnished)}
                                onChange={(e) => setData('is_furnished', e.target.value === '' ? null : e.target.value === 'true')}>
                                <option value="">Not specified</option>
                                <option value="true">Furnished</option>
                                <option value="false">Unfurnished</option>
                            </Select>
                        </Field>
                    </div>

                    <Field label="Description" error={errors.description}>
                        <textarea value={data.description ?? ''} rows={4}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Full property description..." />
                    </Field>

                    <Field label="Assigned to" error={errors.assigned_to}>
                        <Select value={data.assigned_to ?? ''}
                            onChange={(e) => setData('assigned_to', e.target.value || null)}>
                            <option value="">— Unassigned —</option>
                            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </Select>
                    </Field>
                </div>
            )}

            {/* Location */}
            {tab === 'Location' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Building" error={errors.building}>
                            <Input value={data.building ?? ''} onChange={(e) => setData('building', e.target.value || null)}
                                placeholder="e.g. Kigali Heights" />
                        </Field>
                        <Field label="Community / Area" error={errors.community}>
                            <Input value={data.community ?? ''} onChange={(e) => setData('community', e.target.value || null)}
                                placeholder="e.g. Kimihurura" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="City *" error={errors.city}>
                            <Input value={data.city} onChange={(e) => setData('city', e.target.value)}
                                placeholder="Kigali" />
                        </Field>
                        <Field label="Country" error={errors.country}>
                            <Input value={data.country ?? 'RW'} maxLength={2}
                                onChange={(e) => setData('country', e.target.value.toUpperCase())}
                                placeholder="RW" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Latitude" error={errors.latitude}>
                            <Input type="number" step="any" value={data.latitude ?? ''}
                                onChange={(e) => setData('latitude', e.target.value || null)}
                                placeholder="-1.9441" />
                        </Field>
                        <Field label="Longitude" error={errors.longitude}>
                            <Input type="number" step="any" value={data.longitude ?? ''}
                                onChange={(e) => setData('longitude', e.target.value || null)}
                                placeholder="30.0619" />
                        </Field>
                    </div>
                </div>
            )}

            {/* Pricing */}
            {tab === 'Pricing' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label={`Sale Price (${currency})`} error={errors.price}>
                            <Input type="number" min="0" step="1000" value={data.price ?? ''}
                                onChange={(e) => setData('price', e.target.value || null)}
                                placeholder="0" />
                        </Field>
                        <Field label={`Rent Price (${currency})`} error={errors.rent_price}>
                            <Input type="number" min="0" step="1000" value={data.rent_price ?? ''}
                                onChange={(e) => setData('rent_price', e.target.value || null)}
                                placeholder="0" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Rent Frequency" error={errors.rent_frequency}>
                            <Select value={data.rent_frequency ?? ''}
                                onChange={(e) => setData('rent_frequency', e.target.value || null)}>
                                <option value="">— Select —</option>
                                {RENT_FREQS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </Select>
                        </Field>
                        <Field label={`Service Charge (${currency} per month)`} error={errors.service_charge}>
                            <Input type="number" min="0" step="0.01" value={data.service_charge ?? ''}
                                onChange={(e) => setData('service_charge', e.target.value || null)}
                                placeholder="0.00" />
                        </Field>
                    </div>
                </div>
            )}

            {/* Amenities */}
            {tab === 'Amenities' && (
                <AmenityPicker
                    amenities={amenities}
                    selected={data.amenity_ids}
                    onChange={(ids) => setData('amenity_ids', ids)}
                />
            )}

            {/* SEO */}
            {tab === 'SEO' && (
                <div className="space-y-4">
                    <Field label="Meta Title" error={errors.meta_title}>
                        <Input value={data.meta_title ?? ''} onChange={(e) => setData('meta_title', e.target.value || null)}
                            placeholder="SEO title for listing page" />
                    </Field>
                    <Field label="Meta Description" error={errors.meta_description}>
                        <textarea rows={3} value={data.meta_description ?? ''}
                            onChange={(e) => setData('meta_description', e.target.value || null)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Short SEO description (150–160 chars)" />
                    </Field>
                </div>
            )}
        </div>
    );
}
