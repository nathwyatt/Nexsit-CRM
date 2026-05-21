import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';

const COLORS = ['emerald', 'violet', 'amber', 'sky', 'red', 'indigo'];

const BADGE = {
    emerald: 'bg-emerald-100 text-emerald-700',
    violet:  'bg-violet-100 text-violet-700',
    amber:   'bg-amber-100 text-amber-700',
    sky:     'bg-sky-100 text-sky-700',
    red:     'bg-red-100 text-red-700',
    indigo:  'bg-indigo-100 text-indigo-700',
};

const INPUT = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white';

function PlanForm({ plan, onClose }) {
    const isEdit = !!plan;
    const { data, setData, post, put, processing, errors } = useForm({
        name:            plan?.name ?? '',
        description:     plan?.description ?? '',
        price_monthly:   plan?.price_monthly ?? '',
        price_yearly:    plan?.price_yearly ?? '',
        max_users:       plan?.max_users ?? '',
        max_properties:  plan?.max_properties ?? '',
        max_leads:       plan?.max_leads ?? '',
        features:        plan?.features ?? [],
        badge_color:     plan?.badge_color ?? 'emerald',
        is_active:       plan?.is_active ?? true,
        is_featured:     plan?.is_featured ?? false,
        sort_order:      plan?.sort_order ?? 0,
    });

    const [featureInput, setFeatureInput] = useState('');

    function addFeature() {
        if (!featureInput.trim()) return;
        setData('features', [...data.features, featureInput.trim()]);
        setFeatureInput('');
    }

    function removeFeature(idx) {
        setData('features', data.features.filter((_, i) => i !== idx));
    }

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            put(`/superadmin/plans/${plan.id}`, { onSuccess: onClose });
        } else {
            post('/superadmin/plans', { onSuccess: onClose });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">{isEdit ? `Edit: ${plan.name}` : 'New Plan'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Name *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={INPUT} placeholder="Pro Plan" />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                            <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={INPUT} placeholder="Best for growing agencies" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Price ($) *</label>
                            <input type="number" min="0" step="0.01" value={data.price_monthly} onChange={e => setData('price_monthly', e.target.value)} className={INPUT} placeholder="49.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Yearly Price ($) *</label>
                            <input type="number" min="0" step="0.01" value={data.price_yearly} onChange={e => setData('price_yearly', e.target.value)} className={INPUT} placeholder="470.00" />
                        </div>
                    </div>

                    {/* Limits */}
                    <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Limits <span className="font-normal text-gray-400">(leave blank = unlimited)</span></p>
                        <div className="grid grid-cols-3 gap-3">
                            {['max_users', 'max_properties', 'max_leads'].map(field => (
                                <div key={field}>
                                    <label className="block text-xs text-gray-500 mb-1 capitalize">{field.replace('max_', '').replace('_', ' ')}</label>
                                    <input type="number" min="1" value={data[field]} onChange={e => setData(field, e.target.value)}
                                        className={INPUT} placeholder="∞" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Features</p>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className={INPUT} placeholder="e.g. WhatsApp integration" />
                            <button type="button" onClick={addFeature}
                                className="px-3 py-1.5 text-xs font-medium text-white rounded-xl shrink-0"
                                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.features.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full">
                                    {f}
                                    <button type="button" onClick={() => removeFeature(i)} className="ml-0.5 hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Badge Color</p>
                        <div className="flex gap-2">
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => setData('badge_color', c)}
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${BADGE[c]} ${data.badge_color === c ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-70'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded accent-violet-600" />
                            <span className="text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)}
                                className="w-4 h-4 rounded accent-violet-600" />
                            <span className="text-gray-700">Featured (recommended)</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                            {processing ? 'Saving…' : isEdit ? 'Update Plan' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PlanCard({ plan, onEdit }) {
    function deletePlan() {
        if (!confirm(`Delete "${plan.name}"?`)) return;
        router.delete(`/superadmin/plans/${plan.id}`, { preserveScroll: true });
    }

    return (
        <div className={`bg-white rounded-2xl border shadow-sm p-5 relative ${plan.is_featured ? 'border-violet-300 ring-2 ring-violet-100' : 'border-gray-200'}`}>
            {plan.is_featured && (
                <div className="absolute -top-2.5 left-5">
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-600 text-white px-2.5 py-0.5 rounded-full shadow">
                        Recommended
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between mb-3">
                <div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${BADGE[plan.badge_color] ?? 'bg-gray-100 text-gray-600'}`}>
                        {plan.name}
                    </span>
                    {!plan.is_active && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">Inactive</span>
                    )}
                </div>
                <span className="text-xs text-gray-400">{plan.subs_count} subs</span>
            </div>

            {plan.description && (
                <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
            )}

            <div className="mb-3">
                <span className="text-2xl font-bold text-gray-900">${Number(plan.price_monthly).toLocaleString()}</span>
                <span className="text-xs text-gray-400">/mo</span>
                <span className="text-xs text-gray-400 ml-2">${Number(plan.price_yearly).toLocaleString()}/yr</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
                <div className="text-center bg-gray-50 rounded-lg py-1.5">
                    <p className="font-bold text-gray-900">{plan.max_users ?? '∞'}</p>
                    <p className="text-gray-400">users</p>
                </div>
                <div className="text-center bg-gray-50 rounded-lg py-1.5">
                    <p className="font-bold text-gray-900">{plan.max_properties ?? '∞'}</p>
                    <p className="text-gray-400">properties</p>
                </div>
                <div className="text-center bg-gray-50 rounded-lg py-1.5">
                    <p className="font-bold text-gray-900">{plan.max_leads ?? '∞'}</p>
                    <p className="text-gray-400">leads</p>
                </div>
            </div>

            {plan.features?.length > 0 && (
                <ul className="space-y-1 mb-4">
                    {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {f}
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => onEdit(plan)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                    Edit
                </button>
                <button onClick={deletePlan}
                    className="py-1.5 px-3 text-xs font-medium rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition">
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function PlansIndex({ plans }) {
    const [modal, setModal] = useState(null); // null | 'new' | plan object

    return (
        <SuperAdminLayout title="Subscription Plans">
            {modal && (
                <PlanForm
                    plan={modal === 'new' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
                    <button onClick={() => setModal('new')}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        New Plan
                    </button>
                </div>

                {plans.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                        <p className="text-gray-400 text-sm mb-3">No plans yet. Create your first subscription plan.</p>
                        <button onClick={() => setModal('new')}
                            className="text-sm font-semibold text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                            Create First Plan
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {plans.map(plan => (
                            <PlanCard key={plan.id} plan={plan} onEdit={setModal} />
                        ))}
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
}
