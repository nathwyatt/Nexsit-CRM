import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import LeadForm from '@/Components/Lead/LeadForm';

export default function LeadEdit({ lead, sources, agents, properties, contacts }) {
    const { data, setData, put, processing, errors } = useForm({
        contact_id:      lead.contact_id,
        lead_source_id:  lead.lead_source_id,
        source_detail:   lead.source_detail,
        purpose:         lead.purpose,
        property_id:     lead.property_id,
        budget_min:      lead.budget_min,
        budget_max:      lead.budget_max,
        bedrooms_wanted: lead.bedrooms_wanted,
        message:         lead.message,
        assigned_to:     lead.assigned_to,
    });

    function submit(e) {
        e.preventDefault();
        put(`/leads/${lead.id}`);
    }

    return (
        <AppLayout title={`Edit — ${lead.reference}`}>
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/leads" className="hover:text-indigo-600">Leads</Link>
                    <span>/</span>
                    <Link href={`/leads/${lead.id}`} className="hover:text-indigo-600">{lead.reference}</Link>
                    <span>/</span>
                    <span className="text-gray-900">Edit</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <LeadForm data={data} setData={setData} errors={errors}
                        sources={sources} agents={agents} properties={properties} contacts={contacts} />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <Link href={`/leads/${lead.id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
