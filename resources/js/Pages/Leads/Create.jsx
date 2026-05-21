import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import LeadForm from '@/Components/Lead/LeadForm';

export default function LeadCreate({ sources, agents, properties, contacts }) {
    const { data, setData, post, processing, errors } = useForm({
        contact_id:      null,
        lead_source_id:  null,
        source_detail:   null,
        purpose:         'buy',
        property_id:     null,
        budget_min:      null,
        budget_max:      null,
        bedrooms_wanted: null,
        message:         null,
        assigned_to:     null,
    });

    function submit(e) {
        e.preventDefault();
        post('/leads');
    }

    return (
        <AppLayout title="Add Lead">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/leads" className="hover:text-indigo-600">Leads</Link>
                    <span>/</span>
                    <span className="text-gray-900">New lead</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <LeadForm data={data} setData={setData} errors={errors}
                        sources={sources} agents={agents} properties={properties} contacts={contacts} />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Create lead'}
                        </button>
                        <Link href="/leads" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
