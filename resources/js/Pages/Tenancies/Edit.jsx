import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCurrency, rentSuffix } from '@/Utils/format';

export default function TenanciesEdit({ tenancy, properties, contacts, deals }) {
    const currency = useCurrency();
    const { data, setData, put, processing, errors } = useForm({
        property_id:         tenancy.property_id ?? '',
        unit_id:             tenancy.unit_id ?? '',
        tenant_id:           tenancy.tenant_id ?? '',
        deal_id:             tenancy.deal_id ?? '',
        start_date:          tenancy.start_date ?? '',
        end_date:            tenancy.end_date ?? '',
        rent_amount:         tenancy.rent_amount ?? '',
        rent_frequency:      tenancy.rent_frequency ?? 'monthly',
        deposit_amount:      tenancy.deposit_amount ?? '',
        auto_renew:          tenancy.auto_renew ?? false,
        renewal_notice_days: tenancy.renewal_notice_days ?? 90,
        notes:               tenancy.notes ?? '',
        status:              tenancy.status ?? 'pending',
    });

    function submit(e) {
        e.preventDefault();
        put(`/tenancies/${tenancy.id}`);
    }

    const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
    const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

    return (
        <AppLayout title={`Edit ${tenancy.reference}`}>
            <div className="max-w-2xl mx-auto px-6 py-6">
                <div className="mb-5">
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <Link href="/tenancies" className="hover:text-indigo-600">Tenancies</Link>
                        <span>/</span>
                        <Link href={`/tenancies/${tenancy.id}`} className="hover:text-indigo-600">{tenancy.reference}</Link>
                        <span>/</span>
                        <span className="text-gray-700">Edit</span>
                    </nav>
                    <h1 className="text-xl font-bold text-gray-900">Edit {tenancy.reference}</h1>
                    <p className="text-xs text-amber-600 mt-1 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 inline-block">
                        Note: editing dates/frequency does not regenerate the payment schedule.
                    </p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <div>
                        <label className={labelCls}>Status</label>
                        <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputCls}>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelCls}>Property *</label>
                        <select value={data.property_id}
                            onChange={e => setData('property_id', e.target.value)} className={inputCls}>
                            <option value="">Select property…</option>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                        {errors.property_id && <p className="text-xs text-red-500 mt-1">{errors.property_id}</p>}
                    </div>

                    <div>
                        <label className={labelCls}>Tenant (Contact) *</label>
                        <select value={data.tenant_id}
                            onChange={e => setData('tenant_id', e.target.value)} className={inputCls}>
                            <option value="">Select tenant…</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>)}
                        </select>
                        {errors.tenant_id && <p className="text-xs text-red-500 mt-1">{errors.tenant_id}</p>}
                    </div>

                    <div>
                        <label className={labelCls}>Linked Deal</label>
                        <select value={data.deal_id}
                            onChange={e => setData('deal_id', e.target.value)} className={inputCls}>
                            <option value="">None</option>
                            {deals.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Start Date *</label>
                            <input type="date" value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)} className={inputCls} />
                            {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>End Date *</label>
                            <input type="date" value={data.end_date}
                                onChange={e => setData('end_date', e.target.value)} className={inputCls} />
                            {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Rent Amount ({currency}) *</label>
                            <input type="number" step="0.01" value={data.rent_amount}
                                onChange={e => setData('rent_amount', e.target.value)} className={inputCls} />
                            {errors.rent_amount && <p className="text-xs text-red-500 mt-1">{errors.rent_amount}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Frequency *</label>
                            <select value={data.rent_frequency}
                                onChange={e => setData('rent_frequency', e.target.value)} className={inputCls}>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Deposit Amount ({currency})</label>
                        <input type="number" step="0.01" value={data.deposit_amount}
                            onChange={e => setData('deposit_amount', e.target.value)}
                            placeholder="Optional" className={inputCls} />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.auto_renew}
                                onChange={e => setData('auto_renew', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600" />
                            <span className="text-sm text-gray-700">Auto renew</span>
                        </label>
                        {data.auto_renew && (
                            <div className="flex items-center gap-2">
                                <input type="number" value={data.renewal_notice_days}
                                    onChange={e => setData('renewal_notice_days', e.target.value)}
                                    className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
                                <span className="text-sm text-gray-500">days notice</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>Notes</label>
                        <textarea rows={3} value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className={`${inputCls} resize-none`} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold">
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                        <Link href={`/tenancies/${tenancy.id}`}
                            className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 font-medium">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
