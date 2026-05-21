import { Link, router, useForm } from '@inertiajs/react';
import SuperAdminLayout, { SUB_STATUS_BADGE } from '@/Layouts/SuperAdminLayout';

function UsageMeter({ label, used, max, color = 'emerald' }) {
    const pct = max ? Math.min(100, Math.round((used / max) * 100)) : null;
    const barColor = {
        emerald: 'bg-emerald-500',
        amber:   'bg-amber-500',
        red:     'bg-red-500',
    };
    const usedColor = pct != null && pct >= 90 ? 'red' : pct >= 70 ? 'amber' : 'emerald';

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-semibold text-gray-700">
                    {used}{max ? ` / ${max}` : ' / ∞'}
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                {pct != null ? (
                    <div className={`h-full rounded-full ${barColor[usedColor]} transition-all`} style={{ width: `${pct}%` }} />
                ) : (
                    <div className={`h-full rounded-full ${barColor.emerald}`} style={{ width: `${Math.min(100, used * 2)}%` }} />
                )}
            </div>
        </div>
    );
}

function SubBadge({ status }) {
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${SUB_STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
}

export default function CompanyShow({ company, usage, subscription, subscription_history, users, plans }) {
    const { patch, processing } = useForm();

    const subForm = useForm({
        plan_id:        subscription?.plan?.id ?? plans[0]?.id ?? '',
        status:         subscription?.status ?? 'active',
        billing_cycle:  subscription?.billing_cycle ?? 'monthly',
        payment_method: subscription?.payment_method ?? 'manual',
        ends_at:        subscription?.ends_at ?? '',
        notes:          subscription?.notes ?? '',
    });

    function toggleActive() {
        if (!confirm(`${company.is_active ? 'Suspend' : 'Activate'} ${company.name}?`)) return;
        router.patch(`/superadmin/companies/${company.id}/toggle`, {}, { preserveScroll: true });
    }

    function updateSub(e) {
        e.preventDefault();
        subForm.patch(`/superadmin/companies/${company.id}/subscription`, { preserveScroll: true });
    }

    const planName = subscription?.plan?.name ?? 'No plan';

    return (
        <SuperAdminLayout title={company.name}>
            <div className="max-w-5xl space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/superadmin/companies" className="hover:text-violet-600">Companies</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{company.name}</span>
                </div>

                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-xl font-bold shrink-0">
                                {company.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="text-lg font-bold text-gray-900">{company.name}</h1>
                                    {!company.is_active && (
                                        <span className="text-xs bg-red-100 text-red-600 font-semibold rounded-full px-2 py-0.5">Suspended</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">{company.email} · {company.city}, {company.country}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Member since {company.created_at}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={toggleActive}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-xl border transition ${
                                    company.is_active
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}>
                                {company.is_active ? 'Suspend' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                    {/* Left col */}
                    <div className="col-span-2 space-y-5">
                        {/* Subscription */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Subscription</h3>
                                {subscription && <SubBadge status={subscription.status} />}
                            </div>

                            <form onSubmit={updateSub} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
                                        <select value={subForm.data.plan_id} onChange={e => subForm.setData('plan_id', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                                            {plans.map(p => <option key={p.id} value={p.id}>{p.name} (RWF {Number(p.price_monthly).toLocaleString()}/mo)</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                        <select value={subForm.data.status} onChange={e => subForm.setData('status', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                                            {['trial','active','past_due','cancelled','expired'].map(s => (
                                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Billing Cycle</label>
                                        <select value={subForm.data.billing_cycle} onChange={e => subForm.setData('billing_cycle', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select value={subForm.data.payment_method} onChange={e => subForm.setData('payment_method', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                                            <option value="manual">Manual</option>
                                            <option value="stripe">Stripe</option>
                                            <option value="free">Free</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Ends</label>
                                        <input type="date" value={subForm.data.ends_at}
                                            onChange={e => subForm.setData('ends_at', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
                                        <textarea rows={2} value={subForm.data.notes}
                                            onChange={e => subForm.setData('notes', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                                            placeholder="Payment notes, contract details…" />
                                    </div>
                                </div>
                                <button type="submit" disabled={subForm.processing}
                                    className="px-5 py-1.5 text-xs font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                                    {subForm.processing ? 'Saving…' : 'Save Subscription'}
                                </button>
                            </form>
                        </div>

                        {/* Users */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Team ({users.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {users.map(u => (
                                    <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                        </div>
                                        <span className={`text-xs rounded-full px-2 py-0.5 capitalize font-medium ${
                                            u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{u.role}</span>
                                        {!u.is_active && (
                                            <span className="text-xs bg-red-100 text-red-500 rounded-full px-2 py-0.5">Inactive</span>
                                        )}
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <p className="px-5 py-4 text-sm text-gray-400">No users yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right col */}
                    <div className="space-y-5">
                        {/* Usage */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Usage</h3>
                            <div className="space-y-4">
                                <UsageMeter label="Users" used={usage.users} max={subscription?.plan?.max_users ?? null} />
                                <UsageMeter label="Properties" used={usage.properties} max={null} />
                                <UsageMeter label="Leads" used={usage.leads} max={null} />
                                <UsageMeter label="Deals" used={usage.deals} max={null} />
                            </div>
                        </div>

                        {/* Sub history */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">History</h3>
                            <div className="space-y-2">
                                {subscription_history.map(s => (
                                    <div key={s.id} className="flex items-start gap-2 text-xs">
                                        <SubBadge status={s.status} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-700 truncate">{s.plan}</p>
                                            <p className="text-gray-400">{s.starts_at} → {s.ends_at}</p>
                                        </div>
                                    </div>
                                ))}
                                {subscription_history.length === 0 && (
                                    <p className="text-xs text-gray-400">No history yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
