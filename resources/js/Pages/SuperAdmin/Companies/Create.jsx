import { Link, useForm } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

const INPUT = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white';
const SELECT = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white';

export default function CompanyCreate({ plans }) {
    const { data, setData, post, processing, errors } = useForm({
        name:           '',
        email:          '',
        phone:          '',
        address:        '',
        city:           '',
        country:        'Rwanda',
        timezone:       'Africa/Kigali',
        plan_id:        plans[0]?.id ?? '',
        billing_cycle:  'monthly',
        payment_method: 'manual',
        trial_days:     '14',
        admin_name:     '',
        admin_email:    '',
        admin_password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/superadmin/companies');
    }

    return (
        <SuperAdminLayout title="Add Company">
            <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                    <Link href="/superadmin/companies" className="hover:text-violet-600">Companies</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">New Company</span>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Company info */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                </svg>
                            </div>
                            Company Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Field label="Company Name *" error={errors.name}>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={INPUT} placeholder="Kigali Realty Ltd" />
                                </Field>
                            </div>
                            <Field label="Business Email *" error={errors.email}>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={INPUT} placeholder="info@company.com" />
                            </Field>
                            <Field label="Phone" error={errors.phone}>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className={INPUT} placeholder="+250 7XX XXX XXX" />
                            </Field>
                            <Field label="City" error={errors.city}>
                                <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className={INPUT} placeholder="Kigali" />
                            </Field>
                            <Field label="Country" error={errors.country}>
                                <input type="text" value={data.country} onChange={e => setData('country', e.target.value)} className={INPUT} placeholder="Rwanda" />
                            </Field>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 010 2.624 3.745 3.745 0 01-2.625 2.625 3.744 3.744 0 01-2.624 0 3.745 3.745 0 01-3.068-1.593 3.744 3.744 0 01-2.624 0 3.745 3.745 0 01-2.625-2.625 3.744 3.744 0 010-2.624A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 010-2.624 3.745 3.745 0 012.625-2.625 3.744 3.744 0 012.624 0A3.744 3.744 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.744 3.744 0 012.624 0 3.745 3.745 0 012.625 2.625 3.744 3.744 0 010 2.624A3.745 3.745 0 0121 12z" />
                                </svg>
                            </div>
                            Subscription
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Plan *" error={errors.plan_id}>
                                <select value={data.plan_id} onChange={e => setData('plan_id', e.target.value)} className={SELECT}>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — ${p.price_monthly}/mo · ${p.price_yearly}/yr
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Billing Cycle *" error={errors.billing_cycle}>
                                <select value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value)} className={SELECT}>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly (discount)</option>
                                </select>
                            </Field>
                            <Field label="Payment Method *" error={errors.payment_method}>
                                <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className={SELECT}>
                                    <option value="manual">Manual (bank transfer / mobile money)</option>
                                    <option value="stripe">Stripe (card)</option>
                                    <option value="free">Free / Sponsored</option>
                                </select>
                            </Field>
                            <Field label="Trial Days" error={errors.trial_days}>
                                <input type="number" min="0" max="365" value={data.trial_days} onChange={e => setData('trial_days', e.target.value)} className={INPUT} placeholder="14" />
                            </Field>
                        </div>
                    </div>

                    {/* Admin user */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            Admin User Account
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Field label="Full Name *" error={errors.admin_name}>
                                    <input type="text" value={data.admin_name} onChange={e => setData('admin_name', e.target.value)} className={INPUT} placeholder="John Doe" />
                                </Field>
                            </div>
                            <Field label="Email *" error={errors.admin_email}>
                                <input type="email" value={data.admin_email} onChange={e => setData('admin_email', e.target.value)} className={INPUT} placeholder="admin@company.com" />
                            </Field>
                            <Field label="Password *" error={errors.admin_password}>
                                <input type="password" value={data.admin_password} onChange={e => setData('admin_password', e.target.value)} className={INPUT} placeholder="Min. 8 characters" />
                            </Field>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Link href="/superadmin/companies"
                            className="px-5 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 transition"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                            {processing ? 'Creating…' : 'Create Company'}
                        </button>
                    </div>
                </form>
            </div>
        </SuperAdminLayout>
    );
}
