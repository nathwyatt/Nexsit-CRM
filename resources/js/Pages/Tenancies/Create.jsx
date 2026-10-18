import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCurrency, rentSuffix } from '@/Utils/format';

export default function TenanciesCreate({ properties, contacts, deals }) {
    const currency = useCurrency();
    const { data, setData, post, processing, errors } = useForm({
        property_id:         '',
        unit_id:             '',
        tenant_id:           '',
        deal_id:             '',
        start_date:          '',
        end_date:            '',
        rent_amount:         '',
        rent_frequency:      'monthly',
        deposit_amount:      '',
        auto_renew:          false,
        renewal_notice_days: 90,
        notes:               '',
    });

    function submit(e) {
        e.preventDefault();
        post('/tenancies');
    }

    const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
    const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

    return (
        <AppLayout title="New Tenancy">
            <div className="max-w-2xl mx-auto px-6 py-6">
                <div className="mb-5">
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <Link href="/tenancies" className="hover:text-indigo-600">Tenancies</Link>
                        <span>/</span>
                        <span className="text-gray-700">New</span>
                    </nav>
                    <h1 className="text-xl font-bold text-gray-900">New Tenancy</h1>
                    <p className="text-sm text-gray-500 mt-0.5">A payment schedule will be auto-generated.</p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
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
                                onChange={e => setData('rent_amount', e.target.value)}
                                placeholder="e.g. 5000" className={inputCls} />
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
                            className={`${inputCls} resize-none`}
                            placeholder="Additional notes…" />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold">
                            {processing ? 'Creating…' : 'Create Tenancy'}
                        </button>
                        <Link href="/tenancies"
                            className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 font-medium">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
