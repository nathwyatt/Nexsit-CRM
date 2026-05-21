import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DealForm from '@/Components/Deal/DealForm';

export default function DealEdit({ deal, pipelines, contacts, properties, agents }) {
    const { data, setData, put, processing, errors } = useForm({
        pipeline_id:          deal.pipeline_id,
        stage_id:             deal.stage_id,
        contact_id:           deal.contact_id,
        property_id:          deal.property_id,
        title:                deal.title,
        type:                 deal.type,
        value:                deal.value,
        commission_pct:       deal.commission_pct,
        expected_close_date:  deal.expected_close_date,
        assigned_to:          deal.assigned_to,
    });

    function submit(e) {
        e.preventDefault();
        put(`/deals/${deal.id}`);
    }

    return (
        <AppLayout title={`Edit — ${deal.reference}`}>
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/deals" className="hover:text-indigo-600">Deals</Link>
                    <span>/</span>
                    <Link href={`/deals/${deal.id}`} className="hover:text-indigo-600">{deal.reference}</Link>
                    <span>/</span>
                    <span className="text-gray-900">Edit</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <DealForm
                        data={data} setData={setData} errors={errors}
                        pipelines={pipelines} contacts={contacts} properties={properties} agents={agents}
                    />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <Link href={`/deals/${deal.id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
